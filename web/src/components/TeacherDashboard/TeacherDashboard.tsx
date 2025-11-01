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
  TeacherClassResponse,
  TeacherScheduleResponse,
} from "../../services/teacherClasses";
import { getStoredProfile } from "../../utils/profile";

interface FormState {
  title: string;
  subject: string;
  description: string;
  modality: string;
  durationMinutes: number;
  price: string;
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
    modality: "online",
    durationMinutes: 60,
    price: "",
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
            .map((item) => ({ item, date: new Date(item.date) }))
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
      const date = new Date(schedule.date);
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

    let priceNumber: number | undefined;
    if (form.price.trim()) {
      const parsed = Number(form.price.replace(",", "."));
      if (!Number.isFinite(parsed) || parsed < 0) {
        setErrorMessage("Valor informado é inválido.");
        return;
      }
      priceNumber = Number(parsed.toFixed(2));
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: trimmedTitle,
        subject: form.subject.trim() || undefined,
        description: form.description.trim() || undefined,
        modality: form.modality,
        durationMinutes: Math.round(duration),
        price: priceNumber,
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
      }));
    } catch (error) {
      console.error("Erro ao cadastrar aula:", error);
      setErrorMessage("Não foi possível cadastrar a aula. Tente novamente.");
    } finally {
      setIsSubmitting(false);
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
                  <option value="online">Online</option>
                  <option value="home">Na minha casa</option>
                  <option value="travel">Vou até o aluno</option>
                  <option value="presencial">Presencial combinado</option>
                  <option value="hybrid">Híbrido</option>
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
                  const startDate =
                    item.startTime && !Number.isNaN(new Date(item.startTime).getTime())
                      ? new Date(item.startTime)
                      : null;
                  const createdDate = new Date(item.createdAt);
                  const startLabel = startDate
                    ? startDate.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : null;
                  const createdLabel = createdDate.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  return (
                    <li key={item.id} className="teacher-dashboard-class-card">
                      <div className="teacher-dashboard-class-main">
                        <h4>{item.title}</h4>
                        {item.subject && (
                          <span className="teacher-dashboard-chip">{item.subject}</span>
                        )}
                      </div>
                      <div className="teacher-dashboard-class-meta">
                        <span>
                          <CalendarDays size={16} />
                          {startLabel ? `Disponível: ${startLabel}` : `Criada em ${createdLabel}`}
                        </span>
                        <span>
                          <Clock size={16} />
                          {item.durationMinutes} min
                        </span>
                        <span>
                          <MapPin size={16} />
                          {item.modality === "home"
                            ? "Na sua casa"
                            : item.modality === "travel"
                            ? "No aluno"
                            : item.modality === "presencial"
                            ? "Presencial"
                            : item.modality === "hybrid"
                            ? "Híbrido"
                            : "Online"}
                        </span>
                        {item.price && (
                          <span>
                            <NotebookPen size={16} />
                            R$ {Number(item.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="teacher-dashboard-class-description">{item.description}</p>
                      )}
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
                  const eventDate = new Date(event.date);
                  const time = eventDate.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <li key={event.id} className="teacher-dashboard-calendar-item">
                      <div>
                        <strong>{time}</strong>
                        <p>
                          {event.student?.name
                            ? `Com ${event.student.name}`
                            : "Aula agendada"}
                        </p>
                      </div>
                      {event.student?.email && <span>{event.student.email}</span>}
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
