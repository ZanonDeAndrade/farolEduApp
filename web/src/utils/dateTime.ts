const APP_TIMEZONE = import.meta.env.VITE_APP_TIMEZONE || "America/Sao_Paulo";
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

type DateOptions = Intl.DateTimeFormatOptions;

const parseDateString = (value: string) => {
  const match = DATE_PATTERN.exec(value);
  if (!match) {
    throw new Error("INVALID_DATE");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return { year, month, day };
};

const toZonedReferenceDate = (date: string) => {
  const { year, month, day } = parseDateString(date);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
};

export const addDaysToDateString = (date: string, days: number) => {
  const { year, month, day } = parseDateString(date);
  const next = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0, 0));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(
    next.getUTCDate(),
  ).padStart(2, "0")}`;
};

export const getTodayDateString = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
};

export const formatDateString = (date: string, options: DateOptions) =>
  new Intl.DateTimeFormat("pt-BR", {
    timeZone: APP_TIMEZONE,
    ...options,
  }).format(toZonedReferenceDate(date));

export const formatBookingDateShort = (date: string) =>
  formatDateString(date, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

export const formatBookingDateLong = (date: string) =>
  formatDateString(date, {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

export const formatTimeLabel = (time: string) => time.slice(0, 5);

export const formatBookingTimeRange = (startTime: string, endTime: string) =>
  `${formatTimeLabel(startTime)} - ${formatTimeLabel(endTime)}`;

export const normalizeStatusLabel = (status?: string | null) => {
  const key = (status ?? "PENDING").toUpperCase();
  if (key === "CONFIRMED" || key === "ACEITO" || key === "ACCEPTED") return "Confirmada";
  if (key === "REJECTED" || key === "RECUSADO") return "Recusada";
  if (key === "CANCELLED") return "Cancelada";
  return "Pendente";
};

export const getBookingStartSortValue = (booking: {
  date: string;
  startTime: string;
  startAtUtc?: string;
}) => {
  if (booking.startAtUtc) {
    const time = Date.parse(booking.startAtUtc);
    if (!Number.isNaN(time)) return time;
  }

  return Date.parse(`${booking.date}T${booking.startTime}:00Z`);
};

export const toCalendarUtcDateTime = (date: string, time: string) => `${date}T${time}:00Z`;
