import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  MapPin,
  NotebookPen,
  PlusCircle,
  Users,
} from "lucide-react";
import "./TeacherDashboard.css";
import {
  createTeacherClass,
  fetchTeacherClasses,
  fetchTeacherSchedules,
  updateTeacherClass,
  TeacherClassResponse,
  TeacherScheduleResponse,
} from "../../services/teacherClasses";
import { acceptAppointment, rejectAppointment } from "../../services/appointments";
import { getStoredProfile } from "../../utils/profile";

interface FormState {
  title: string;
  subject: string;
  description: string;
  modality: string;
  durationMinutes: number;
  price: string;
  location: string;
}

const monthsPT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const weekdaysPT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const toDateKey = (date: Date) => date.toISOString().split("T")[0];

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(true);
  const [teacherClasses, setTeacherClasses] = useState<TeacherClassResponse[]>([]);
  const [schedules, setSchedules] = useState<TeacherScheduleResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classesLoading, setClassesLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const todayKey = toDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [form, setForm] = useState<FormState>({
    title: "",
    subject: "",
    description: "",
    modality: "ONLINE",
    durationMinutes: 60,
    price: "",
    location: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const profile = getStoredProfile();
    if (!token || !profile) {
      navigate("/login");
      return;
    }

    if ((profile.role ?? "").toLowerCase() !== "teacher") {
      navigate("/");
      return;
    }
    setTeacherName(profile.name || profile.fullName || null);

    const load = async () => {
      try {
        setClassesLoading(true);
        setScheduleLoading(true);
        const [classResp, scheduleResp] = await Promise.all([
          fetchTeacherClasses(),
          fetchTeacherSchedules(),
        ]);
        setTeacherClasses(classResp);
        setSchedules(scheduleResp);
        if (scheduleResp.length) {
          const firstUpcoming = scheduleResp
            .map((item) => ({ item, date: new Date(item.startTime) }))
            .filter(({ date }) => !Number.isNaN(date.getTime()))
            .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
          if (firstUpcoming) {
            setSelectedDate(toDateKey(firstUpcoming.date));
            setCalendarMonth(
              new Date(
                firstUpcoming.date.getFullYear(),
                firstUpcoming.date.getMonth(),
                1
              )
            );
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do professor:", error);
        setErrorMessage("Não foi possível carregar suas aulas. Tente novamente.");
      } finally {
        setClassesLoading(false);
        setScheduleLoading(false);
        setIsInitializing(false);
      }
    };

    load();
  }, [navigate]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, TeacherScheduleResponse[]> = {};
    schedules.forEach((schedule) => {
      const date = new Date(schedule.startTime);
      if (Number.isNaN(date.getTime())) return;
      const key = toDateKey(date);
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(schedule);
    });
    return map;
  }, [schedules]);

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const startWeekday = (firstDayOfMonth.getDay() + 6) % 7; // segunda-feira como primeiro dia
    const days: Array<{ day: number | null; date?: Date }> = [];

    for (let i = 0; i < startWeekday; i++) {
      days.push({ day: null });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ day, date });
    }
    return days;
  }, [calendarMonth]);

  const selectedDateEvents = eventsByDay[selectedDate] ?? [];

  const updateScheduleInState = (updated: TeacherScheduleResponse) => {
    setSchedules(prev =>
      prev.map(item => (item.id === updated.id ? updated : item)),
    );
  };

  const handleDecision = async (id: number, action: "accept" | "reject") => {
    setActionLoadingId(id);
    try {
      const next =
        action === "accept" ? await acceptAppointment(id) : await rejectAppointment(id);
      updateScheduleInState(next);
    } catch (error) {
      console.error(`Erro ao ${action === "accept" ? "aceitar" : "recusar"} agendamento:`, error);
      setErrorMessage("Não foi possível atualizar o status. Tente novamente.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleFormChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedTitle = form.title.trim();
    if (!trimmedTitle) {
      setErrorMessage("Informe um título para a aula.");
      return;
    }

    const duration = Number(form.durationMinutes);
    if (!Number.isFinite(duration) || duration <= 0) {
      setErrorMessage("Informe uma duração válida em minutos.");
      return;
    }

    let priceCents: number | undefined;
    if (form.price.trim()) {
      const parsed = Number(form.price.replace(",", "."));
      if (!Number.isFinite(parsed) || parsed < 0) {
        setErrorMessage("Valor informado é inválido.");
        return;
      }
      priceCents = Math.round(parsed * 100);
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: trimmedTitle,
        subject: form.subject.trim() || undefined,
        description: form.description.trim() || undefined,
        modality: form.modality,
        durationMinutes: Math.round(duration),
        priceCents,
        location: form.location.trim() || undefined,
        active: true,
      };

      const created = await createTeacherClass(payload);
      setTeacherClasses((prev) => {
        const merged = [...prev, created];
        return merged.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      setSuccessMessage("Aula cadastrada com sucesso!");
      setForm((prev) => ({
        title: "",
        subject: "",
        description: "",
        modality: prev.modality,
        durationMinutes: 60,
        price: "",
        location: "",
      }));
    } catch (error) {
      console.error("Erro ao cadastrar aula:", error);
      setErrorMessage("Não foi possível cadastrar a aula. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (klass: TeacherClassResponse) => {
    try {
      const updated = await updateTeacherClass(klass.id, { active: !(klass.active ?? true) });
      setTeacherClasses((prev) =>
        prev
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
    } catch (error) {
      console.error("Erro ao atualizar aula:", error);
      setErrorMessage("Não foi possível alterar o status da oferta.");
    }
  };

  const handlePrevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const formatDateHeading = (dateKey: string) => {
    const date = new Date(`${dateKey}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "Selecione uma data";
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  if (isInitializing) {
    return (
      <div className="teacher-dashboard-loading">
        <div className="teacher-dashboard-spinner" />
        <p>Carregando painel do professor...</p>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard-container">
      <div className="teacher-dashboard-header">
        <div>
          <h1>
            {teacherName ? (
              <span className="teacher-dashboard-teacher-name">{teacherName}</span>
            ) : (
              "Suas aulas, organizadas"
            )}
          </h1>
          <p>Cadastre novas aulas e acompanhe a agenda de encontros já agendados.</p>
        </div>
      </div>

      <div className="teacher-dashboard-grid">
        <section className="teacher-dashboard-section">
          <header className="teacher-dashboard-section-header">
            <div className="teacher-dashboard-section-title">
              <PlusCircle className="teacher-dashboard-section-icon" />
              <h2>Cadastrar aulas</h2>
            </div>
            <span>Registre novos encontros e veja tudo que já foi preparado.</span>
          </header>

          <form className="teacher-dashboard-form" onSubmit={handleSubmit}>
            <div className="teacher-dashboard-form-grid">
              <label className="teacher-dashboard-field">
                <span>Título da aula</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => handleFormChange("title", event.target.value)}
                  placeholder="Ex: Reforço de matemática para ENEM"
                />
              </label>

              <label className="teacher-dashboard-field">
                <span>Disciplina / tema</span>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(event) => handleFormChange("subject", event.target.value)}
                  placeholder="Matemática, Física, Idiomas..."
                />
              </label>

              <label className="teacher-dashboard-field">
                <span>Modalidade</span>
                <select
                  value={form.modality}
                  onChange={(event) => handleFormChange("modality", event.target.value)}
                >
                  <option value="ONLINE">Online</option>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="AMBOS">Híbrido / ambos</option>
                </select>
              </label>

              <label className="teacher-dashboard-field">
                <span>Duração (min)</span>
                <input
                  type="number"
                  min={15}
                  max={600}
                  value={form.durationMinutes}
                  onChange={(event) =>
                    handleFormChange("durationMinutes", Number(event.target.value))
                  }
                />
              </label>

              <label className="teacher-dashboard-field">
                <span>Valor (opcional)</span>
                <input
                  type="text"
                  value={form.price}
                  onChange={(event) => handleFormChange("price", event.target.value)}
                  placeholder="Ex: 80.00"
                />
              </label>

              <label className="teacher-dashboard-field">
                <span>Local (opcional)</span>
                <input
                  type="text"
                  value={form.location}
                  onChange={(event) => handleFormChange("location", event.target.value)}
                  placeholder="Cidade, região ou link de sala online"
                />
              </label>
            </div>

            <label className="teacher-dashboard-field">
              <span>Descrição (opcional)</span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) => handleFormChange("description", event.target.value)}
                placeholder="Inclua detalhes sobre o conteúdo, materiais ou pré-requisitos."
              />
            </label>

            {errorMessage && (
              <div className="teacher-dashboard-alert teacher-dashboard-alert-error">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="teacher-dashboard-alert teacher-dashboard-alert-success">
                {successMessage}
              </div>
            )}

            <button type="submit" className="teacher-dashboard-submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar aula"}
            </button>
          </form>

          <div className="teacher-dashboard-list">
            <h3>Suas aulas cadastradas</h3>
            {classesLoading ? (
              <p>Carregando aulas...</p>
            ) : teacherClasses.length ? (
              <ul>
                {teacherClasses.map((item) => {
                  const createdDate = new Date(item.createdAt);
                  const createdLabel = createdDate.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const priceValue =
                    item.priceCents !== null && item.priceCents !== undefined
                      ? item.priceCents / 100
                      : item.price !== null && item.price !== undefined
                      ? Number(item.price)
                      : null;
                  const priceLabel =
                    priceValue !== null && priceValue !== undefined
                      ? `R$ ${priceValue.toFixed(2)}`
                      : "Valor não informado";
                  const modalityLabel =
                    item.modality === "PRESENCIAL"
                      ? "Presencial"
                      : item.modality === "AMBOS"
                      ? "Híbrido"
                      : "Online";
                  return (
                    <li key={item.id} className="teacher-dashboard-class-card">
                      <div className="teacher-dashboard-class-main">
                        <h4>{item.title}</h4>
                        <div className="teacher-dashboard-chip-row">
                          {item.subject && (
                            <span className="teacher-dashboard-chip">{item.subject}</span>
                          )}
                          <span
                            className={`teacher-dashboard-chip ${item.active === false ? "is-inactive" : ""}`}
                          >
                            {item.active === false ? "Pausada" : "Ativa"}
                          </span>
                        </div>
                      </div>
                      <div className="teacher-dashboard-class-meta">
                        <span>
                          <CalendarDays size={16} />
                          Criada em {createdLabel}
                        </span>
                        <span>
                          <Clock size={16} />
                          {item.durationMinutes} min
                        </span>
                        <span>
                          <MapPin size={16} />
                          {modalityLabel}
                        </span>
                        <span>
                          <NotebookPen size={16} />
                          {priceLabel}
                        </span>
                        {item.location ? <span>{item.location}</span> : null}
                      </div>
                      {item.description && (
                        <p className="teacher-dashboard-class-description">{item.description}</p>
                      )}
                      <button
                        type="button"
                        className="teacher-dashboard-toggle"
                        onClick={() => handleToggleActive(item)}
                      >
                        {item.active === false ? "Reativar oferta" : "Pausar oferta"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>Nenhuma aula cadastrada ainda. Cadastre uma nova aula para começar.</p>
            )}
          </div>
        </section>

        <section className="teacher-dashboard-section">
          <header className="teacher-dashboard-section-header">
            <div className="teacher-dashboard-section-title">
              <CalendarDays className="teacher-dashboard-section-icon" />
              <h2>Agenda de aulas</h2>
            </div>
            <span>Visualize rapidamente os dias com encontros marcados.</span>
          </header>

          <div className="teacher-dashboard-calendar-card">
            <div className="teacher-dashboard-calendar-header">
              <button type="button" onClick={handlePrevMonth} aria-label="Mês anterior">
                ◀
              </button>
              <h3>
                {monthsPT[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </h3>
              <button type="button" onClick={handleNextMonth} aria-label="Próximo mês">
                ▶
              </button>
            </div>

            <div className="teacher-dashboard-calendar-grid">
              {weekdaysPT.map((weekday) => (
                <div key={weekday} className="teacher-dashboard-calendar-weekday">
                  {weekday}
                </div>
              ))}
              {calendarDays.map(({ day, date }, index) => {
                if (!day || !date) {
                  return <div key={`empty-${index}`} className="teacher-dashboard-calendar-day empty" />;
                }

                const key = toDateKey(date);
                const hasEvents = Boolean(eventsByDay[key]?.length);
                const isSelected = selectedDate === key;
                const isToday = key === todayKey;

                return (
                  <button
                    key={key}
                    type="button"
                    className={[
                      "teacher-dashboard-calendar-day",
                      hasEvents ? "has-events" : "",
                      isSelected ? "is-selected" : "",
                      isToday ? "is-today" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")
                    }
                    onClick={() => {
                      setSelectedDate(key);
                    }}
                  >
                    <span>{day}</span>
                    {hasEvents && <span className="teacher-dashboard-calendar-indicator" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="teacher-dashboard-calendar-details">
            <header>
              <h3>{formatDateHeading(selectedDate)}</h3>
              <span>
                <Users size={16} />
                {selectedDateEvents.length
                  ? `${selectedDateEvents.length} aula(s) agendada(s)`
                  : "Nenhuma aula agendada"}
              </span>
            </header>

            {scheduleLoading ? (
              <p>Carregando agenda...</p>
            ) : selectedDateEvents.length ? (
              <ul>
                {selectedDateEvents.map((event) => {
                  const eventDate = new Date(event.startTime);
                  const time = eventDate.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const endTime = new Date(event.endTime);
                  const timeEnd = Number.isNaN(endTime.getTime())
                    ? null
                    : endTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                  const statusUpper = (event.status || "").toUpperCase();
                  const isPending = statusUpper === "PENDING" || statusUpper === "AGUARDANDO_PROFESSOR";
                  return (
                    <li key={event.id} className="teacher-dashboard-calendar-item">
                      <div>
                        <strong>
                          {time}
                          {timeEnd ? ` - ${timeEnd}` : ""}
                        </strong>
                        <p>
                          {event.student?.name
                            ? `Com ${event.student.name}`
                            : "Aula agendada"}
                        </p>
                        {event.offer?.title ? <p>{event.offer.title}</p> : null}
                      </div>
                      <div className="teacher-dashboard-calendar-tags">
                        {event.student?.email && <span>{event.student.email}</span>}
                        <span
                          className={`teacher-dashboard-chip ${event.status === "CANCELLED" ? "is-inactive" : ""}`}
                        >
                          {event.status || "PENDING"}
                        </span>
                        {isPending ? (
                          <div className="teacher-dashboard-actions">
                            <button
                              type="button"
                              className="teacher-dashboard-btn accept"
                              disabled={actionLoadingId === event.id}
                              onClick={() => handleDecision(event.id, "accept")}
                            >
                              {actionLoadingId === event.id ? "Salvando..." : "Aceitar"}
                            </button>
                            <button
                              type="button"
                              className="teacher-dashboard-btn reject"
                              disabled={actionLoadingId === event.id}
                              onClick={() => handleDecision(event.id, "reject")}
                            >
                              {actionLoadingId === event.id ? "Salvando..." : "Recusar"}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>Nenhuma aula agendada para esta data.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeacherDashboard;
