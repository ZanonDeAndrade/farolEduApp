import { CalendarRange, Clock3, MessageSquareText, UserRound, X } from "lucide-react";
import type { Booking } from "../../services/bookings";
import { formatBookingDateLong, formatBookingTimeRange, normalizeStatusLabel } from "../../utils/dateTime";
import "./TeacherCalendarModal.css";

type BookingDetailsModalProps = {
  booking?: Booking | null;
  isOpen: boolean;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onClose(): void;
  onAccept?(bookingId: number): Promise<void> | void;
  onReject?(bookingId: number): Promise<void> | void;
};

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  isOpen,
  isSubmitting = false,
  errorMessage,
  onClose,
  onAccept,
  onReject,
}) => {
  if (!isOpen || !booking) return null;

  const isPending = ["PENDING", "AGUARDANDO_PROFESSOR"].includes((booking.status ?? "").toUpperCase());

  return (
    <div className="teacher-calendar-modal__overlay" onClick={event => event.target === event.currentTarget && onClose()}>
      <div className="teacher-calendar-modal" role="dialog" aria-modal="true" aria-label="Detalhes do agendamento">
        <div className="teacher-calendar-modal__header">
          <div>
            <p className="teacher-calendar-modal__eyebrow">
              <CalendarRange size={16} />
              Agendamento
            </p>
            <h2>{booking.offer?.title ?? "Aula agendada"}</h2>
          </div>
          <button type="button" className="teacher-calendar-modal__close" onClick={onClose} aria-label="Fechar modal">
            <X size={18} />
          </button>
        </div>

        <div className="teacher-calendar-modal__stack">
          <div className="teacher-calendar-modal__info">
            <Clock3 size={17} />
            <div>
              <strong>{formatBookingDateLong(booking.date)}</strong>
              <span>{formatBookingTimeRange(booking.startTime, booking.endTime)}</span>
            </div>
          </div>

          <div className="teacher-calendar-modal__info">
            <UserRound size={17} />
            <div>
              <strong>{booking.student?.name ?? "Aluno nao identificado"}</strong>
              <span>{normalizeStatusLabel(booking.status)}</span>
            </div>
          </div>

          {booking.notes ? (
            <div className="teacher-calendar-modal__info">
              <MessageSquareText size={17} />
              <div>
                <strong>Observacoes</strong>
                <span>{booking.notes}</span>
              </div>
            </div>
          ) : null}
        </div>

        {errorMessage ? <div className="teacher-calendar-modal__alert is-error">{errorMessage}</div> : null}

        <div className="teacher-calendar-modal__footer">
          <button type="button" className="teacher-calendar-modal__ghost" onClick={onClose}>
            Fechar
          </button>
          {isPending && onReject ? (
            <button
              type="button"
              className="teacher-calendar-modal__danger"
              onClick={() => onReject(booking.id)}
              disabled={isSubmitting}
            >
              Recusar
            </button>
          ) : null}
          {isPending && onAccept ? (
            <button
              type="button"
              className="teacher-calendar-modal__primary"
              onClick={() => onAccept(booking.id)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Confirmar"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
