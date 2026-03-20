import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import type { DateSelectArg, EventClickArg, EventContentArg } from "@fullcalendar/core";
import { CalendarRange } from "lucide-react";
import type { Availability } from "../../services/availability";
import type { Booking } from "../../services/bookings";
import { formatBookingTimeRange, normalizeStatusLabel } from "../../utils/dateTime";
import {
  buildTeacherCalendarEvents,
  type TeacherCalendarToggles,
} from "./calendarAdapters";
import "./TeacherCalendarView.css";

type CalendarSelection = {
  date: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type TeacherCalendarViewProps = {
  availability: Availability[];
  bookings: Booking[];
  toggles: TeacherCalendarToggles;
  isLoading?: boolean;
  onCreateAvailability(selection: CalendarSelection): void;
  onAvailabilityClick(item: Availability): void;
  onBookingClick(item: Booking): void;
};

const toUtcDateString = (value: Date) =>
  `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(
    value.getUTCDate(),
  ).padStart(2, "0")}`;

const toUtcTimeString = (value: Date) =>
  `${String(value.getUTCHours()).padStart(2, "0")}:${String(value.getUTCMinutes()).padStart(2, "0")}`;

const TeacherCalendarView: React.FC<TeacherCalendarViewProps> = ({
  availability,
  bookings,
  toggles,
  isLoading = false,
  onCreateAvailability,
  onAvailabilityClick,
  onBookingClick,
}) => {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [isCompactLayout, setIsCompactLayout] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 680px)").matches : false,
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(max-width: 680px)");
    const updateLayout = () => setIsCompactLayout(mediaQuery.matches);

    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);
    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    api.changeView(isCompactLayout ? "timeGridDay" : "timeGridWeek");
  }, [isCompactLayout]);

  const events = useMemo(
    () =>
      buildTeacherCalendarEvents(availability, bookings, toggles).map(event => {
        const kind = (event.extendedProps as { kind?: string } | undefined)?.kind;
        if (!isCompactLayout || kind !== "availability") {
          return event;
        }

        return {
          ...event,
          display: "background",
          title: "",
          classNames: ["teacher-calendar-event", "is-availability-background"],
        };
      }),
    [availability, bookings, toggles, isCompactLayout],
  );

  const handleSelect = (selection: DateSelectArg) => {
    onCreateAvailability({
      date: toUtcDateString(selection.start),
      dayOfWeek: selection.start.getUTCDay(),
      startTime: toUtcTimeString(selection.start),
      endTime: toUtcTimeString(selection.end),
    });
  };

  const handleEventClick = (click: EventClickArg) => {
    const kind = click.event.extendedProps.kind as "availability" | "booking";
    if (isCompactLayout && kind === "availability") {
      return;
    }
    if (kind === "availability") {
      onAvailabilityClick(click.event.extendedProps.availability as Availability);
      return;
    }

    onBookingClick(click.event.extendedProps.booking as Booking);
  };

  const hasAnyData = availability.length > 0 || bookings.length > 0;
  const headerToolbar = isCompactLayout
    ? {
        left: "prev,next",
        center: "title",
        right: "today",
      }
    : {
        left: "prev,next today",
        center: "title",
        right: "",
      };

  const renderEventContent = (eventContent: EventContentArg) => {
    const { event } = eventContent;
    const kind = event.extendedProps.kind as "availability" | "booking";

    if (kind === "availability") {
      const availability = event.extendedProps.availability as Availability;
      return (
        <div className={`teacher-calendar__event-card ${isCompactLayout ? "is-compact" : ""}`}>
          <strong>Disponivel</strong>
          {!isCompactLayout ? <span>{formatBookingTimeRange(availability.startTime, availability.endTime)}</span> : null}
        </div>
      );
    }

    const booking = event.extendedProps.booking as Booking;
    return (
      <div className={`teacher-calendar__event-card ${isCompactLayout ? "is-compact" : ""}`}>
        <strong>{booking.offer?.title ?? "Aula"}</strong>
        <span>{isCompactLayout ? normalizeStatusLabel(booking.status) : booking.student?.name ?? normalizeStatusLabel(booking.status)}</span>
      </div>
    );
  };

  return (
    <div className="teacher-calendar">
      <div className="teacher-calendar__surface">
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin]}
          locale={ptBrLocale}
          timeZone="UTC"
          initialView={isCompactLayout ? "timeGridDay" : "timeGridWeek"}
          headerToolbar={headerToolbar}
          firstDay={1}
          weekends
          nowIndicator
          allDaySlot={false}
          selectable
          selectMirror
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          height="auto"
          dayHeaderFormat={isCompactLayout ? { weekday: "short", day: "2-digit" } : { weekday: "short", day: "2-digit", month: "2-digit" }}
          slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          eventMinHeight={isCompactLayout ? 44 : 60}
          events={events}
          select={handleSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
        />

        {isLoading ? <div className="teacher-calendar__overlay">Carregando agenda...</div> : null}
      </div>

      {!isLoading && !hasAnyData ? (
        <div className="teacher-calendar__empty">
          <CalendarRange size={18} />
          <span>Selecione um horario vazio no calendario para cadastrar sua primeira disponibilidade.</span>
        </div>
      ) : null}
    </div>
  );
};

export default TeacherCalendarView;
