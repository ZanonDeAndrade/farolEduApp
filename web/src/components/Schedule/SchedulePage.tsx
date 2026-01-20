import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CalendarDays, Clock, Sparkles } from "lucide-react";
import "./SchedulePage.css";
import { createBooking } from "../../services/bookings";

const SchedulePage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const offerId = Number(params.get("offerId"));
  const teacherName = params.get("teacherName") || "professor";
  const offerTitle = params.get("offerTitle") || "";
  const durationMinutes = params.get("durationMinutes");

  const [date, setDate] = useState(() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    now.setHours(15, 0, 0, 0);
    return now.toISOString().slice(0, 16);
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formattedTeacher = useMemo(() => teacherName.split(" ")[0] || "professor", [teacherName]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async () => {
    if (!offerId) {
      setError("Oferta inválida. Volte e escolha uma aula.");
      return;
    }
    const normalizedDate = new Date(date);
    if (Number.isNaN(normalizedDate.getTime())) {
      setError("Use o formato AAAA-MM-DDTHH:mm");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await createBooking({
        offerId,
        startTime: normalizedDate.toISOString(),
      });
      setSuccess("Aula agendada com sucesso!");
    } catch (err) {
      console.error("Erro ao agendar:", err);
      setError("Não foi possível agendar. Verifique conflitos ou tente novamente.");
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

        <label className="schedule-input-group">
          <span>Data e horário</span>
          <div className="schedule-input">
            <CalendarDays size={18} />
            <input
              type="datetime-local"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          {durationMinutes ? (
            <small>Duração prevista: {durationMinutes} min.</small>
          ) : null}
        </label>

        {error ? <div className="schedule-alert error">{error}</div> : null}
        {success ? <div className="schedule-alert success">{success}</div> : null}

        <button
          type="button"
          className="btn btn-primary schedule-button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Agendando..." : (
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
