import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CalendarDays, Clock, Sparkles } from "lucide-react";
import "./SchedulePage.css";
import { createBooking } from "../../services/bookings";
import { fetchTeacherAvailableSlots } from "../../services/availability";
import {
  addDaysToDateString,
  formatDateString,
  formatTimeLabel,
  getTodayDateString,
} from "../../utils/dateTime";

const formatScheduleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
  }

  return "Nao foi possivel agendar. Verifique os horarios disponiveis e tente novamente.";
};

const SchedulePage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const offerId = Number(params.get("offerId"));
  const teacherId = Number(params.get("teacherId"));
  const teacherName = params.get("teacherName") || "professor";
  const offerTitle = params.get("offerTitle") || "";
  const durationMinutes = Number(params.get("durationMinutes"));

  const [selectedDate, setSelectedDate] = useState(() => {
    return addDaysToDateString(getTodayDateString(), 1);
  });
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formattedTeacher = useMemo(
    () => teacherName.split(" ")[0] || "professor",
    [teacherName],
  );

  const loadSlots = async (
    dateValue: string,
    options?: { preserveSelection?: boolean; autoSelectFirst?: boolean },
  ) => {
    if (!teacherId || !dateValue) {
      setAvailableSlots([]);
      return;
    }

    setSlotsLoading(true);
    setError(null);

    try {
      const slots = await fetchTeacherAvailableSlots(teacherId, dateValue, {
        offerId: Number.isFinite(offerId) ? offerId : undefined,
      });
      setAvailableSlots(slots);
      setSelectedSlot(current => {
        const nextCurrent = options?.preserveSelection === false ? null : current;
        if (nextCurrent && slots.includes(nextCurrent)) {
          return nextCurrent;
        }
        if (options?.autoSelectFirst === false) {
          return null;
        }
        return slots[0] ?? null;
      });
    } catch (err) {
      console.error("Erro ao carregar slots:", err);
      setAvailableSlots([]);
      setSelectedSlot(null);
      setError("Nao foi possivel carregar os horarios disponiveis.");
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    loadSlots(selectedDate);
  }, [offerId, selectedDate, teacherId]);

  const handleSubmit = async () => {
    if (!offerId) {
      setError("Oferta invalida. Volte e escolha uma aula.");
      return;
    }
    if (!teacherId) {
      setError("Professor invalido. Volte e selecione a aula novamente.");
      return;
    }
    if (!selectedSlot) {
      setError("Selecione um horario disponivel para continuar.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const bookedSlot = selectedSlot;
      await createBooking({
        offerId,
        date: selectedDate,
        startTime: bookedSlot,
      });
      setSuccess(
        `Aula agendada com sucesso para ${formatDateString(selectedDate, {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
        })} às ${formatTimeLabel(bookedSlot)}.`,
      );
      await loadSlots(selectedDate, { preserveSelection: false, autoSelectFirst: false });
    } catch (err) {
      console.error("Erro ao agendar:", err);
      setError(formatScheduleError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="schedule-page">
      <div className="schedule-card">
        <div className="schedule-header">
          <div className="schedule-icon">
            <Sparkles size={18} />
          </div>
          <div>
            <h1>Agendar aula</h1>
            <p>
              {offerTitle ? `${offerTitle} com ${formattedTeacher}` : `Com ${formattedTeacher}`}
            </p>
          </div>
        </div>

        <div className="schedule-summary">
          <span>
            <Clock size={16} />
            {Number.isFinite(durationMinutes) ? `${durationMinutes} min por encontro` : "Duracao definida pelo professor"}
          </span>
          <span>
            <Sparkles size={16} />
            Os horarios abaixo ja consideram a agenda unica do professor.
          </span>
        </div>

        <label className="schedule-input-group">
          <span>Escolha uma data</span>
          <div className="schedule-input">
            <CalendarDays size={18} />
            <input
              type="date"
              value={selectedDate}
              onChange={event => {
                setSelectedDate(event.target.value);
                setSuccess(null);
              }}
            />
          </div>
        </label>

        <div className="schedule-slots">
          <div className="schedule-slots-head">
            <h2>Horarios disponiveis</h2>
            <span>{availableSlots.length} slot(s)</span>
          </div>

          {slotsLoading ? (
            <div className="schedule-slots-empty">Carregando horarios...</div>
          ) : availableSlots.length ? (
            <div className="schedule-slots-grid">
              {availableSlots.map(slot => (
                <button
                  key={slot}
                  type="button"
                  className={`schedule-slot ${selectedSlot === slot ? "is-selected" : ""}`}
                  onClick={() => {
                    setSelectedSlot(slot);
                    setError(null);
                  }}
                >
                  {formatTimeLabel(slot)}
                </button>
              ))}
            </div>
          ) : (
            <div className="schedule-slots-empty">
              Nenhum horario livre nesta data. Escolha outro dia para ver novos slots.
            </div>
          )}
        </div>

        {error ? <div className="schedule-alert error">{error}</div> : null}
        {success ? <div className="schedule-alert success">{success}</div> : null}

        <button
          type="button"
          className="btn btn-primary schedule-button"
          onClick={handleSubmit}
          disabled={isSubmitting || slotsLoading || !selectedSlot}
        >
          {isSubmitting ? (
            "Agendando..."
          ) : (
            <span className="schedule-button-row">
              <Clock size={16} />
              Confirmar agendamento
            </span>
          )}
        </button>

        <button
          type="button"
          className="btn btn-secondary schedule-button"
          onClick={() => navigate(-1)}
        >
          Voltar
        </button>
      </div>
    </div>
  );
};

export default SchedulePage;
