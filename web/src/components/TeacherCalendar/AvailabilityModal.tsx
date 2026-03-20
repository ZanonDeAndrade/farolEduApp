import { useEffect, useState } from "react";
import { CalendarRange, Clock3, Trash2, X } from "lucide-react";
import type { Availability, AvailabilityPayload } from "../../services/availability";
import { WEEK_DAYS } from "../AvailabilityManager/types";
import "./TeacherCalendarModal.css";

type AvailabilityModalProps = {
  isOpen: boolean;
  availability?: Availability | null;
  initialValue?: AvailabilityPayload | null;
  isSaving?: boolean;
  errorMessage?: string | null;
  onClose(): void;
  onSubmit(payload: AvailabilityPayload): Promise<void> | void;
  onDelete?(availability: Availability): Promise<void> | void;
  onOpenManager?(): void;
};

const DEFAULT_VALUE: AvailabilityPayload = {
  dayOfWeek: 1,
  startTime: "14:00",
  endTime: "15:00",
  slotDuration: 60,
};

const AvailabilityModal: React.FC<AvailabilityModalProps> = ({
  isOpen,
  availability,
  initialValue,
  isSaving = false,
  errorMessage,
  onClose,
  onSubmit,
  onDelete,
  onOpenManager,
}) => {
  const [form, setForm] = useState<AvailabilityPayload>(DEFAULT_VALUE);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (availability) {
      setForm({
        dayOfWeek: availability.dayOfWeek,
        startTime: availability.startTime,
        endTime: availability.endTime,
        slotDuration: availability.slotDuration,
      });
      setLocalError(null);
      return;
    }

    setForm(initialValue ?? DEFAULT_VALUE);
    setLocalError(null);
  }, [availability, initialValue, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const dayLabel = WEEK_DAYS.find(item => item.value === form.dayOfWeek)?.label ?? "Dia";

  const handleSubmit = async () => {
    if (form.startTime >= form.endTime) {
      setLocalError("A hora final deve ser maior que a hora inicial.");
      return;
    }
    if (!Number.isFinite(form.slotDuration) || form.slotDuration <= 0) {
      setLocalError("Informe uma duracao valida.");
      return;
    }

    setLocalError(null);
    await onSubmit(form);
  };

  return (
    <div className="teacher-calendar-modal__overlay" onClick={event => event.target === event.currentTarget && onClose()}>
      <div className="teacher-calendar-modal" role="dialog" aria-modal="true" aria-label="Gerenciar disponibilidade">
        <div className="teacher-calendar-modal__header">
          <div>
            <p className="teacher-calendar-modal__eyebrow">
              <Clock3 size={16} />
              Agenda semanal
            </p>
            <h2>{availability ? "Bloco de disponibilidade" : "Nova disponibilidade"}</h2>
          </div>
          <button type="button" className="teacher-calendar-modal__close" onClick={onClose} aria-label="Fechar modal">
            <X size={18} />
          </button>
        </div>

        <div className="teacher-calendar-modal__summary">
          <CalendarRange size={18} />
          <div>
            <strong>{dayLabel}</strong>
            <span>Esse bloco vale para todas as aulas do professor.</span>
          </div>
        </div>

        <div className="teacher-calendar-modal__grid">
          <label>
            <span>Dia da semana</span>
            <select
              value={form.dayOfWeek}
              onChange={event => setForm(prev => ({ ...prev, dayOfWeek: Number(event.target.value) }))}
              disabled={Boolean(availability)}
            >
              {WEEK_DAYS.map(day => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Inicio</span>
            <input
              type="time"
              value={form.startTime}
              onChange={event => setForm(prev => ({ ...prev, startTime: event.target.value }))}
              disabled={Boolean(availability)}
            />
          </label>

          <label>
            <span>Fim</span>
            <input
              type="time"
              value={form.endTime}
              onChange={event => setForm(prev => ({ ...prev, endTime: event.target.value }))}
              disabled={Boolean(availability)}
            />
          </label>

          <label>
            <span>Duracao do slot</span>
            <input
              type="number"
              min={15}
              step={15}
              value={form.slotDuration}
              onChange={event => setForm(prev => ({ ...prev, slotDuration: Number(event.target.value) }))}
              disabled={Boolean(availability)}
            />
          </label>
        </div>

        {localError ? <div className="teacher-calendar-modal__alert is-error">{localError}</div> : null}
        {errorMessage ? <div className="teacher-calendar-modal__alert is-error">{errorMessage}</div> : null}

        <div className="teacher-calendar-modal__footer">
          {availability && onDelete ? (
            <button
              type="button"
              className="teacher-calendar-modal__danger"
              onClick={() => onDelete(availability)}
              disabled={isSaving}
            >
              <Trash2 size={16} />
              Remover bloco
            </button>
          ) : null}

          {onOpenManager ? (
            <button type="button" className="teacher-calendar-modal__ghost" onClick={onOpenManager}>
              Editor semanal
            </button>
          ) : null}

          {!availability ? (
            <button type="button" className="teacher-calendar-modal__primary" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar disponibilidade"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityModal;
