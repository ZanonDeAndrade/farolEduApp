import { APP_TIMEZONE } from "../config/env";

export const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
export const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

type ParsedDateKey = {
  year: number;
  month: number;
  day: number;
};

type LocalDateTimeParts = ParsedDateKey & {
  date: string;
  time: string;
  dayOfWeek: number;
  hour: number;
  minute: number;
};

type NormalizeBookingInput =
  | {
      date: string;
      startTime: string;
      durationMinutes: number;
      endTime?: never;
    }
  | {
      date: string;
      startTime: string;
      endTime: string;
      durationMinutes?: never;
    };

const APP_DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const readPart = (parts: Intl.DateTimeFormatPart[], type: string) => {
  const value = parts.find(part => part.type === type)?.value;
  if (!value) {
    throw new Error(`MISSING_${type.toUpperCase()}_PART`);
  }
  return Number(value);
};

export const parseDateString = (value: string): ParsedDateKey => {
  const match = DATE_PATTERN.exec(value);
  if (!match) {
    throw new Error("INVALID_DATE");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    throw new Error("INVALID_DATE");
  }

  return { year, month, day };
};

export const isValidDateString = (value: string) => {
  try {
    parseDateString(value);
    return true;
  } catch {
    return false;
  }
};

export const buildDateString = ({ year, month, day }: ParsedDateKey) =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export const isValidTimeString = (value: string) => TIME_PATTERN.test(value);

export const parseTimeToMinutes = (value: string) => {
  const match = TIME_PATTERN.exec(value);
  if (!match) {
    throw new Error("INVALID_TIME");
  }

  return Number(match[1]) * 60 + Number(match[2]);
};

export const formatMinutesToTime = (minutes: number) => {
  if (!Number.isFinite(minutes) || minutes < 0 || minutes >= 24 * 60) {
    throw new Error("INVALID_TIME");
  }

  const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
  const minute = String(minutes % 60).padStart(2, "0");
  return `${hour}:${minute}`;
};

export const formatSlotLabel = (time: string) => formatMinutesToTime(parseTimeToMinutes(time));

export const sortTimeStrings = <T extends string>(times: T[]) =>
  times.slice().sort((left, right) => parseTimeToMinutes(left) - parseTimeToMinutes(right));

export const validateTimeRange = (startTime: string, endTime: string) =>
  parseTimeToMinutes(startTime) < parseTimeToMinutes(endTime);

export const timeRangesOverlap = (
  startA: string,
  endA: string,
  startB: string,
  endB: string,
) => {
  const startAMinutes = parseTimeToMinutes(startA);
  const endAMinutes = parseTimeToMinutes(endA);
  const startBMinutes = parseTimeToMinutes(startB);
  const endBMinutes = parseTimeToMinutes(endB);

  return startAMinutes < endBMinutes && startBMinutes < endAMinutes;
};

export const doesTimeRangeFit = (startTime: string, endTime: string, durationMinutes: number) => {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return false;
  }

  return parseTimeToMinutes(startTime) + durationMinutes <= parseTimeToMinutes(endTime);
};

const getPartsInAppTimeZone = (date: Date): LocalDateTimeParts => {
  const parts = APP_DATE_TIME_FORMATTER.formatToParts(date);
  const year = readPart(parts, "year");
  const month = readPart(parts, "month");
  const day = readPart(parts, "day");
  const hour = readPart(parts, "hour");
  const minute = readPart(parts, "minute");
  const dateKey = buildDateString({ year, month, day });

  return {
    year,
    month,
    day,
    hour,
    minute,
    date: dateKey,
    time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    dayOfWeek: new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0)).getUTCDay(),
  };
};

export const getLocalDateTimeParts = (date: Date) => getPartsInAppTimeZone(date);

export const getDayOfWeekFromLocalDate = (date: string) => {
  const { year, month, day } = parseDateString(date);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0)).getUTCDay();
};

export const addDaysToLocalDate = (date: string, days: number) => {
  const { year, month, day } = parseDateString(date);
  const next = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0, 0));
  return buildDateString({
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  });
};

export const combineDateAndTime = (date: string, time: string): Date => {
  const { year, month, day } = parseDateString(date);
  const [hour, minute] = formatSlotLabel(time).split(":").map(Number);
  let guess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const actual = getPartsInAppTimeZone(guess);
    const diffMs =
      Date.UTC(year, month - 1, day, hour, minute, 0, 0) -
      Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, 0, 0);

    if (diffMs === 0) {
      return guess;
    }

    guess = new Date(guess.getTime() + diffMs);
  }

  return guess;
};

export const getLocalDateRange = (date: string) => ({
  startAtUtc: combineDateAndTime(date, "00:00"),
  endAtUtc: combineDateAndTime(addDaysToLocalDate(date, 1), "00:00"),
});

export const normalizeBookingDateTime = (input: NormalizeBookingInput) => {
  const date = buildDateString(parseDateString(input.date));
  const startTime = formatSlotLabel(input.startTime);
  const explicitEndTime = "endTime" in input && typeof input.endTime === "string" ? input.endTime : undefined;
  const durationMinutesValue =
    "durationMinutes" in input && typeof input.durationMinutes === "number" && Number.isFinite(input.durationMinutes)
      ? input.durationMinutes
      : explicitEndTime
        ? parseTimeToMinutes(explicitEndTime) - parseTimeToMinutes(startTime)
        : NaN;
  const endTime = explicitEndTime
    ? formatSlotLabel(explicitEndTime)
    : formatMinutesToTime(parseTimeToMinutes(startTime) + durationMinutesValue);

  if (!Number.isFinite(durationMinutesValue) || durationMinutesValue <= 0) {
    throw new Error("INVALID_SLOT");
  }
  const durationMinutes = durationMinutesValue as number;

  if (!validateTimeRange(startTime, endTime)) {
    throw new Error("INVALID_SLOT");
  }

  const startAtUtc = combineDateAndTime(date, startTime);
  const endAtUtc = combineDateAndTime(date, endTime);
  if (!(endAtUtc > startAtUtc)) {
    throw new Error("INVALID_SLOT");
  }

  return {
    date,
    startTime,
    endTime,
    startAtUtc,
    endAtUtc,
    durationMinutes,
    dayOfWeek: getDayOfWeekFromLocalDate(date),
  };
};

export const isBookingWithinAvailability = (
  slotStart: string,
  bookingDuration: number,
  availabilityStart: string,
  availabilityEnd: string,
  slotDuration: number,
) => {
  if (!Number.isFinite(bookingDuration) || bookingDuration <= 0) return false;
  if (!Number.isFinite(slotDuration) || slotDuration <= 0) return false;

  const slotStartMinutes = parseTimeToMinutes(slotStart);
  const availabilityStartMinutes = parseTimeToMinutes(availabilityStart);
  const availabilityEndMinutes = parseTimeToMinutes(availabilityEnd);

  if (slotStartMinutes < availabilityStartMinutes) return false;
  if (slotStartMinutes + bookingDuration > availabilityEndMinutes) return false;

  return (slotStartMinutes - availabilityStartMinutes) % slotDuration === 0;
};
