import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BookOpenText,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Layers3,
  PlusCircle,
  Settings2,
} from "lucide-react";
import "./TeacherDashboard.css";
import {
  createTeacherClass,
  fetchTeacherClasses,
  fetchTeacherSchedules,
  updateTeacherClass,
  type TeacherClassResponse,
  type TeacherScheduleResponse,
} from "../../services/teacherClasses";
import {
  createAvailability,
  deleteAvailability,
  fetchMyAvailability,
  type Availability,
  type AvailabilityPayload,
} from "../../services/availability";
import { acceptAppointment, rejectAppointment } from "../../services/appointments";
import { getStoredProfile } from "../../utils/profile";
import {
  formatBookingDateShort,
  formatBookingTimeRange,
  getBookingStartSortValue,
  normalizeStatusLabel,
} from "../../utils/dateTime";
import AvailabilityManager from "../AvailabilityManager/AvailabilityManager";
import { availabilitySignature, WEEK_DAYS } from "../AvailabilityManager/types";
import AvailabilityModal from "../TeacherCalendar/AvailabilityModal";
import BookingDetailsModal from "../TeacherCalendar/BookingDetailsModal";
import TeacherCalendarView from "../TeacherCalendar/TeacherCalendarView";
import type { TeacherCalendarToggles } from "../TeacherCalendar/calendarAdapters";

interface FormState {
  title: string;
  subject: string;
  description: string;
  modality: string;
  durationMinutes: number;
  price: string;
  location: string;
}

const DEFAULT_FORM: FormState = {
  title: "",
  subject: "",
  description: "",
  modality: "ONLINE",
  durationMinutes: 60,
  price: "",
  location: "",
};

const DEFAULT_TOGGLES: TeacherCalendarToggles = {
  showAvailability: true,
  showPending: true,
  showConfirmed: true,
};

const diffAvailability = (current: Availability[], next: AvailabilityPayload[]) => {
  const matchedIndexes = new Set<number>();
  const toCreate: AvailabilityPayload[] = [];

  next.forEach(item => {
    const signature = availabilitySignature(item);
    const currentIndex = current.findIndex(
      (candidate, index) => !matchedIndexes.has(index) && availabilitySignature(candidate) === signature,
    );

    if (currentIndex >= 0) {
      matchedIndexes.add(currentIndex);
      return;
    }

    toCreate.push(item);
  });

  const toDelete = current.filter((_, index) => !matchedIndexes.has(index));
  return { toCreate, toDelete };
};

const sortClasses = (items: TeacherClassResponse[]) =>
  items
    .slice()
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));

const sortSchedules = (items: TeacherScheduleResponse[]) =>
  items.slice().sort((left, right) => getBookingStartSortValue(left) - getBookingStartSortValue(right));

const isFutureBooking = (item: TeacherScheduleResponse) => getBookingStartSortValue(item) >= Date.now();

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const calendarSectionRef = useRef<HTMLElement | null>(null);

  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const [teacherClasses, setTeacherClasses] = useState<TeacherClassResponse[]>([]);
  const [teacherAvailability, setTeacherAvailability] = useState<Availability[]>([]);
  const [schedules, setSchedules] = useState<TeacherScheduleResponse[]>([]);

  const [classesLoading, setClassesLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [calendarToggles, setCalendarToggles] = useState<TeacherCalendarToggles>(DEFAULT_TOGGLES);

  const [isAvailabilityManagerOpen, setIsAvailabilityManagerOpen] = useState(false);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [availabilityErrorMessage, setAvailabilityErrorMessage] = useState<string | null>(null);
  const [availabilitySuccessMessage, setAvailabilitySuccessMessage] = useState<string | null>(null);

  const [quickAvailabilityDraft, setQuickAvailabilityDraft] = useState<AvailabilityPayload | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<TeacherScheduleResponse | null>(null);
  const [calendarMutationError, setCalendarMutationError] = useState<string | null>(null);

  const refreshDashboardData = useCallback(async () => {
    setClassesLoading(true);
    setAvailabilityLoading(true);
    setScheduleLoading(true);

    try {
      const [classResp, availabilityResp, scheduleResp] = await Promise.all([
        fetchTeacherClasses(),
        fetchMyAvailability(),
        fetchTeacherSchedules(),
      ]);
      setTeacherClasses(sortClasses(classResp));
      setTeacherAvailability(availabilityResp);
      setSchedules(sortSchedules(scheduleResp));
    } finally {
      setClassesLoading(false);
      setAvailabilityLoading(false);
      setScheduleLoading(false);
    }
  }, []);

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

    refreshDashboardData()
      .catch(error => {
        console.error("Erro ao carregar dados do professor:", error);
        setErrorMessage("Nao foi possivel carregar o painel do professor.");
      })
      .finally(() => setIsInitializing(false));
  }, [navigate, refreshDashboardData]);

  useEffect(() => {
    const section = searchParams.get("section");
    if (section === "availability") {
      setIsAvailabilityManagerOpen(true);
      return;
    }

    if (section === "agenda") {
      requestAnimationFrame(() => {
        calendarSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [searchParams]);

  const clearSectionQuery = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("section");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const openAvailabilityManager = useCallback(() => {
    setQuickAvailabilityDraft(null);
    setSelectedAvailability(null);
    setCalendarMutationError(null);
    setAvailabilityErrorMessage(null);
    setAvailabilitySuccessMessage(null);
    setIsAvailabilityManagerOpen(true);

    const next = new URLSearchParams(searchParams);
    next.set("section", "availability");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const closeAvailabilityManager = useCallback(() => {
    setIsAvailabilityManagerOpen(false);
    clearSectionQuery();
  }, [clearSectionQuery]);

  const openAgenda = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.set("section", "agenda");
    setSearchParams(next, { replace: true });
    requestAnimationFrame(() => {
      calendarSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [searchParams, setSearchParams]);

  const groupedAvailability = useMemo(
    () =>
      WEEK_DAYS.map(day => ({
        ...day,
        items: teacherAvailability
          .filter(item => item.dayOfWeek === day.value)
          .slice()
          .sort((left, right) => left.startTime.localeCompare(right.startTime)),
      })).filter(group => group.items.length > 0),
    [teacherAvailability],
  );

  const pendingBookings = useMemo(
    () =>
      schedules.filter(
        item =>
          ["PENDING", "AGUARDANDO_PROFESSOR"].includes((item.status ?? "").toUpperCase()) && isFutureBooking(item),
      ),
    [schedules],
  );

  const nextBooking = useMemo(
    () =>
      schedules.find(
        item =>
          !["CANCELLED", "REJECTED", "RECUSADO"].includes((item.status ?? "").toUpperCase()) && isFutureBooking(item),
      ) ?? null,
    [schedules],
  );

  const handleSaveAvailability = async (nextItems: AvailabilityPayload[]) => {
    setAvailabilitySaving(true);
    setAvailabilityErrorMessage(null);
    setAvailabilitySuccessMessage(null);

    try {
      const { toCreate, toDelete } = diffAvailability(teacherAvailability, nextItems);

      for (const item of toDelete) {
        await deleteAvailability(item.id);
      }

      for (const item of toCreate) {
        await createAvailability(item);
      }

      const refreshed = await fetchMyAvailability();
      setTeacherAvailability(refreshed);
      setAvailabilitySuccessMessage("Disponibilidade atualizada com sucesso.");
      setIsAvailabilityManagerOpen(false);
      clearSectionQuery();
    } catch (error) {
      console.error("Erro ao salvar disponibilidade:", error);
      setAvailabilityErrorMessage("Nao foi possivel salvar a disponibilidade.");
      throw error;
    } finally {
      setAvailabilitySaving(false);
    }
  };

  const handleCreateQuickAvailability = async (payload: AvailabilityPayload) => {
    setAvailabilitySaving(true);
    setCalendarMutationError(null);

    try {
      await createAvailability(payload);
      const refreshed = await fetchMyAvailability();
      setTeacherAvailability(refreshed);
      setQuickAvailabilityDraft(null);
      setAvailabilitySuccessMessage("Bloco de disponibilidade criado.");
    } catch (error) {
      console.error("Erro ao criar disponibilidade:", error);
      setCalendarMutationError("Nao foi possivel salvar este bloco. Verifique conflitos no mesmo dia.");
    } finally {
      setAvailabilitySaving(false);
    }
  };

  const handleDeleteAvailability = async (item: Availability) => {
    const shouldDelete = window.confirm("Remover este bloco de disponibilidade da agenda semanal?");
    if (!shouldDelete) return;

    setAvailabilitySaving(true);
    setCalendarMutationError(null);
    try {
      await deleteAvailability(item.id);
      const refreshed = await fetchMyAvailability();
      setTeacherAvailability(refreshed);
      setSelectedAvailability(null);
      setAvailabilitySuccessMessage("Bloco removido com sucesso.");
    } catch (error) {
      console.error("Erro ao remover disponibilidade:", error);
      setCalendarMutationError("Nao foi possivel remover este bloco.");
    } finally {
      setAvailabilitySaving(false);
    }
  };

  const handleDecision = async (bookingId: number, action: "accept" | "reject") => {
    setActionLoadingId(bookingId);
    setErrorMessage(null);

    try {
      const updated =
        action === "accept" ? await acceptAppointment(bookingId) : await rejectAppointment(bookingId);

      setSchedules(prev => sortSchedules(prev.map(item => (item.id === updated.id ? updated : item))));
      setSelectedBooking(prev => (prev?.id === updated.id ? updated : prev));
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error);
      setErrorMessage("Nao foi possivel atualizar o status do agendamento.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleFormChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedTitle = form.title.trim();
    if (!trimmedTitle) {
      setErrorMessage("Informe um titulo para a aula.");
      return;
    }

    const duration = Number(form.durationMinutes);
    if (!Number.isFinite(duration) || duration <= 0) {
      setErrorMessage("Informe uma duracao valida em minutos.");
      return;
    }

    let priceCents: number | undefined;
    if (form.price.trim()) {
      const parsedPrice = Number(form.price.replace(",", "."));
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        setErrorMessage("Valor informado e invalido.");
        return;
      }
      priceCents = Math.round(parsedPrice * 100);
    }

    setIsSubmitting(true);
    try {
      const created = await createTeacherClass({
        title: trimmedTitle,
        subject: form.subject.trim() || undefined,
        description: form.description.trim() || undefined,
        modality: form.modality,
        durationMinutes: Math.round(duration),
        priceCents,
        location: form.location.trim() || undefined,
        active: true,
      });

      setTeacherClasses(prev => sortClasses([...prev, created]));
      setForm(DEFAULT_FORM);
      setSuccessMessage("Aula cadastrada com sucesso.");
    } catch (error) {
      console.error("Erro ao cadastrar aula:", error);
      setErrorMessage("Nao foi possivel cadastrar a aula.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (klass: TeacherClassResponse) => {
    try {
      const updated = await updateTeacherClass(klass.id, { active: !(klass.active ?? true) });
      setTeacherClasses(prev => sortClasses(prev.map(item => (item.id === updated.id ? updated : item))));
    } catch (error) {
      console.error("Erro ao atualizar oferta:", error);
      setErrorMessage("Nao foi possivel atualizar o status da oferta.");
    }
  };

  if (isInitializing) {
    return (
      <div className="teacher-dashboard teacher-dashboard--loading">
        <div className="teacher-dashboard__spinner" />
        <p>Carregando painel do professor...</p>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      <header className="teacher-dashboard__hero">
        <div>
          <p className="teacher-dashboard__eyebrow">Painel do professor</p>
          <h1>{teacherName ? `Agenda de ${teacherName.split(" ")[0]}` : "Painel de agenda"}</h1>
          <p className="teacher-dashboard__subtitle">
            Gerencie disponibilidade semanal, acompanhe bookings reais e mantenha suas ofertas atualizadas.
          </p>
        </div>

        <div className="teacher-dashboard__hero-actions">
          <button type="button" className="btn btn-primary" onClick={openAvailabilityManager}>
            <Settings2 size={16} />
            Alterar disponibilidade
          </button>
          <button type="button" className="btn btn-secondary" onClick={openAgenda}>
            <CalendarRange size={16} />
            Ver agenda
          </button>
        </div>
      </header>

      {errorMessage ? <div className="teacher-dashboard__alert is-error">{errorMessage}</div> : null}
      {successMessage ? <div className="teacher-dashboard__alert is-success">{successMessage}</div> : null}
      {availabilitySuccessMessage ? <div className="teacher-dashboard__alert is-success">{availabilitySuccessMessage}</div> : null}

      <section className="teacher-dashboard__stats">
        <article className="teacher-dashboard__stat-card">
          <span className="teacher-dashboard__stat-icon">
            <BookOpenText size={18} />
          </span>
          <strong>{teacherClasses.filter(item => item.active ?? true).length}</strong>
          <span>Ofertas ativas</span>
        </article>
        <article className="teacher-dashboard__stat-card">
          <span className="teacher-dashboard__stat-icon">
            <Layers3 size={18} />
          </span>
          <strong>{teacherAvailability.length}</strong>
          <span>Blocos semanais</span>
        </article>
        <article className="teacher-dashboard__stat-card">
          <span className="teacher-dashboard__stat-icon">
            <Clock3 size={18} />
          </span>
          <strong>{pendingBookings.length}</strong>
          <span>Pendentes</span>
        </article>
        <article className="teacher-dashboard__stat-card">
          <span className="teacher-dashboard__stat-icon">
            <CheckCircle2 size={18} />
          </span>
          <strong>{nextBooking ? formatBookingDateShort(nextBooking.date) : "--"}</strong>
          <span>Proxima aula</span>
        </article>
      </section>

      <div className="teacher-dashboard__layout">
        <section className="teacher-dashboard__panel teacher-dashboard__panel--calendar" ref={calendarSectionRef}>
          <div className="teacher-dashboard__panel-head">
            <div>
              <p className="teacher-dashboard__panel-eyebrow">Calendario profissional</p>
              <h2>Agenda semanal</h2>
            </div>
            <div className="teacher-dashboard__toggle-row" aria-label="Filtros do calendario">
              <button
                type="button"
                className={`teacher-dashboard__toggle ${calendarToggles.showAvailability ? "is-active" : ""}`}
                onClick={() => setCalendarToggles(prev => ({ ...prev, showAvailability: !prev.showAvailability }))}
              >
                Disponibilidades
              </button>
              <button
                type="button"
                className={`teacher-dashboard__toggle ${calendarToggles.showPending ? "is-active" : ""}`}
                onClick={() => setCalendarToggles(prev => ({ ...prev, showPending: !prev.showPending }))}
              >
                Pendentes
              </button>
              <button
                type="button"
                className={`teacher-dashboard__toggle ${calendarToggles.showConfirmed ? "is-active" : ""}`}
                onClick={() => setCalendarToggles(prev => ({ ...prev, showConfirmed: !prev.showConfirmed }))}
              >
                Confirmados
              </button>
            </div>
          </div>

          <TeacherCalendarView
            availability={teacherAvailability}
            bookings={schedules}
            toggles={calendarToggles}
            isLoading={availabilityLoading || scheduleLoading}
            onCreateAvailability={selection =>
              setQuickAvailabilityDraft({
                dayOfWeek: selection.dayOfWeek,
                startTime: selection.startTime,
                endTime: selection.endTime,
                slotDuration: 60,
              })
            }
            onAvailabilityClick={item => {
              setQuickAvailabilityDraft(null);
              setSelectedAvailability(item);
              setCalendarMutationError(null);
            }}
            onBookingClick={item => {
              setSelectedBooking(item);
            }}
          />
        </section>

        <section className="teacher-dashboard__panel">
          <div className="teacher-dashboard__panel-head">
            <div>
              <p className="teacher-dashboard__panel-eyebrow">Resumo semanal</p>
              <h2>Disponibilidade</h2>
            </div>
            <button type="button" className="teacher-dashboard__link-button" onClick={openAvailabilityManager}>
              Abrir editor
            </button>
          </div>

          {groupedAvailability.length === 0 ? (
            <div className="teacher-dashboard__empty">
              Nenhuma disponibilidade cadastrada ainda. Selecione um horario no calendario para comecar.
            </div>
          ) : (
            <div className="teacher-dashboard__availability-list">
              {groupedAvailability.map(group => (
                <article key={group.value} className="teacher-dashboard__availability-card">
                  <header>
                    <strong>{group.label}</strong>
                    <span>{group.items.length} bloco(s)</span>
                  </header>
                  <ul>
                    {group.items.map(item => (
                      <li key={item.id}>
                        <span>{formatBookingTimeRange(item.startTime, item.endTime)}</span>
                        <small>{item.slotDuration} min</small>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="teacher-dashboard__panel">
          <div className="teacher-dashboard__panel-head">
            <div>
              <p className="teacher-dashboard__panel-eyebrow">Fila de aprovacao</p>
              <h2>Bookings pendentes</h2>
            </div>
          </div>

          {scheduleLoading ? (
            <div className="teacher-dashboard__empty">Carregando agendamentos...</div>
          ) : pendingBookings.length === 0 ? (
            <div className="teacher-dashboard__empty">Nenhum agendamento pendente no momento.</div>
          ) : (
            <div className="teacher-dashboard__booking-list">
              {pendingBookings.map(item => (
                <article key={item.id} className="teacher-dashboard__booking-card">
                  <div className="teacher-dashboard__booking-head">
                    <strong>{item.offer?.title ?? "Aula agendada"}</strong>
                    <span>{normalizeStatusLabel(item.status)}</span>
                  </div>
                  <p>{item.student?.name ?? "Aluno nao identificado"}</p>
                  <small>
                    {formatBookingDateShort(item.date)} • {formatBookingTimeRange(item.startTime, item.endTime)}
                  </small>
                  <div className="teacher-dashboard__booking-actions">
                    <button
                      type="button"
                      className="teacher-dashboard__ghost-button"
                      onClick={() => setSelectedBooking(item)}
                    >
                      Detalhes
                    </button>
                    <button
                      type="button"
                      className="teacher-dashboard__ghost-button is-danger"
                      onClick={() => handleDecision(item.id, "reject")}
                      disabled={actionLoadingId === item.id}
                    >
                      Recusar
                    </button>
                    <button
                      type="button"
                      className="teacher-dashboard__primary-button"
                      onClick={() => handleDecision(item.id, "accept")}
                      disabled={actionLoadingId === item.id}
                    >
                      {actionLoadingId === item.id ? "Salvando..." : "Confirmar"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="teacher-dashboard__panel teacher-dashboard__panel--wide">
          <div className="teacher-dashboard__panel-head">
            <div>
              <p className="teacher-dashboard__panel-eyebrow">Nova oferta</p>
              <h2>Cadastrar aula</h2>
            </div>
          </div>

          <form className="teacher-dashboard__form" onSubmit={handleSubmit}>
            <div className="teacher-dashboard__form-grid">
              <label>
                <span>Titulo</span>
                <input value={form.title} onChange={event => handleFormChange("title", event.target.value)} />
              </label>
              <label>
                <span>Materia</span>
                <input value={form.subject} onChange={event => handleFormChange("subject", event.target.value)} />
              </label>
              <label>
                <span>Modalidade</span>
                <select value={form.modality} onChange={event => handleFormChange("modality", event.target.value)}>
                  <option value="ONLINE">Online</option>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="AMBOS">Ambos</option>
                </select>
              </label>
              <label>
                <span>Duracao (min)</span>
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={form.durationMinutes}
                  onChange={event => handleFormChange("durationMinutes", Number(event.target.value))}
                />
              </label>
              <label>
                <span>Preco</span>
                <input value={form.price} onChange={event => handleFormChange("price", event.target.value)} />
              </label>
              <label>
                <span>Local</span>
                <input value={form.location} onChange={event => handleFormChange("location", event.target.value)} />
              </label>
            </div>

            <label>
              <span>Descricao</span>
              <textarea
                rows={4}
                value={form.description}
                onChange={event => handleFormChange("description", event.target.value)}
              />
            </label>

            <button type="submit" className="teacher-dashboard__primary-button" disabled={isSubmitting}>
              <PlusCircle size={16} />
              {isSubmitting ? "Salvando..." : "Cadastrar aula"}
            </button>
          </form>
        </section>

        <section className="teacher-dashboard__panel teacher-dashboard__panel--wide">
          <div className="teacher-dashboard__panel-head">
            <div>
              <p className="teacher-dashboard__panel-eyebrow">Suas ofertas</p>
              <h2>Aulas cadastradas</h2>
            </div>
          </div>

          {classesLoading ? (
            <div className="teacher-dashboard__empty">Carregando aulas...</div>
          ) : teacherClasses.length === 0 ? (
            <div className="teacher-dashboard__empty">Cadastre sua primeira aula para comecar a receber bookings.</div>
          ) : (
            <div className="teacher-dashboard__class-grid">
              {teacherClasses.map(item => (
                <article key={item.id} className="teacher-dashboard__class-card">
                  <div className="teacher-dashboard__class-head">
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.subject || "Materia livre"}</span>
                    </div>
                    <span className={`teacher-dashboard__status-tag ${(item.active ?? true) ? "is-active" : "is-inactive"}`}>
                      {(item.active ?? true) ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                  <p>{item.description || "Sem descricao adicional."}</p>
                  <div className="teacher-dashboard__class-meta">
                    <span>{item.modality}</span>
                    <span>{item.durationMinutes} min</span>
                    <span>
                      {item.priceCents !== null && item.priceCents !== undefined
                        ? `R$ ${(item.priceCents / 100).toFixed(2)}`
                        : "Valor a combinar"}
                    </span>
                  </div>
                  <button type="button" className="teacher-dashboard__ghost-button" onClick={() => handleToggleActive(item)}>
                    {(item.active ?? true) ? "Desativar" : "Reativar"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <AvailabilityManager
        isOpen={isAvailabilityManagerOpen}
        isLoading={availabilityLoading}
        isSaving={availabilitySaving}
        availability={teacherAvailability}
        errorMessage={availabilityErrorMessage}
        onClose={closeAvailabilityManager}
        onSave={handleSaveAvailability}
      />

      <AvailabilityModal
        isOpen={Boolean(quickAvailabilityDraft || selectedAvailability)}
        availability={selectedAvailability}
        initialValue={quickAvailabilityDraft}
        isSaving={availabilitySaving}
        errorMessage={calendarMutationError}
        onClose={() => {
          setQuickAvailabilityDraft(null);
          setSelectedAvailability(null);
          setCalendarMutationError(null);
        }}
        onOpenManager={openAvailabilityManager}
        onSubmit={handleCreateQuickAvailability}
        onDelete={handleDeleteAvailability}
      />

      <BookingDetailsModal
        isOpen={Boolean(selectedBooking)}
        booking={selectedBooking}
        isSubmitting={actionLoadingId === selectedBooking?.id}
        errorMessage={errorMessage}
        onClose={() => setSelectedBooking(null)}
        onAccept={bookingId => handleDecision(bookingId, "accept")}
        onReject={bookingId => handleDecision(bookingId, "reject")}
      />
    </div>
  );
};

export default TeacherDashboard;
