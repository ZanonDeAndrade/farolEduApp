import type { EventInput } from "@fullcalendar/core";
import type { Availability } from "../../services/availability";
import type { Booking } from "../../services/bookings";
import { normalizeStatusLabel, toCalendarUtcDateTime } from "../../utils/dateTime";

export type TeacherCalendarToggles = {
  showAvailability: boolean;
  showPending: boolean;
  showConfirmed: boolean;
};

const isPendingBooking = (status?: string | null) => {
  const key = (status ?? "").toUpperCase();
  return key === "PENDING" || key === "AGUARDANDO_PROFESSOR";
};

const isConfirmedBooking = (status?: string | null) => {
  const key = (status ?? "").toUpperCase();
  return key === "CONFIRMED" || key === "ACEITO" || key === "ACCEPTED";
};

export const buildAvailabilityEvents = (availability: Availability[]): EventInput[] =>
  availability.map(item => ({
    id: `availability:${item.id}`,
    title: `Disponivel • ${item.slotDuration} min`,
    daysOfWeek: [String(item.dayOfWeek)],
    startTime: `${item.startTime}:00`,
    endTime: `${item.endTime}:00`,
    classNames: ["teacher-calendar-event", "is-availability"],
    extendedProps: {
      kind: "availability",
      availability: item,
    },
  }));

export const buildBookingEvents = (bookings: Booking[], toggles: TeacherCalendarToggles): EventInput[] =>
  bookings
    .filter(item => {
      if (isPendingBooking(item.status)) return toggles.showPending;
      if (isConfirmedBooking(item.status)) return toggles.showConfirmed;
      return false;
    })
    .map(item => ({
      id: `booking:${item.id}`,
      title: `${normalizeStatusLabel(item.status)} • ${item.offer?.title ?? "Aula"}`,
      start: toCalendarUtcDateTime(item.date, item.startTime),
      end: toCalendarUtcDateTime(item.date, item.endTime),
      classNames: [
        "teacher-calendar-event",
        isPendingBooking(item.status) ? "is-pending" : "is-confirmed",
      ],
      extendedProps: {
        kind: "booking",
        booking: item,
      },
    }));

export const buildTeacherCalendarEvents = (
  availability: Availability[],
  bookings: Booking[],
  toggles: TeacherCalendarToggles,
) => [
  ...(toggles.showAvailability ? buildAvailabilityEvents(availability) : []),
  ...buildBookingEvents(bookings, toggles),
];
