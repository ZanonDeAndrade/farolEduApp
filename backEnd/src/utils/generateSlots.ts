import { doesTimeRangeFit, formatMinutesToTime, parseTimeToMinutes, validateTimeRange } from "./dateTime";

export const generateSlots = (start: string, end: string, duration: number): string[] => {
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error("INVALID_DURATION");
  }

  if (!validateTimeRange(start, end)) {
    throw new Error("INVALID_TIME_RANGE");
  }

  const startMinutes = parseTimeToMinutes(start);
  const slots: string[] = [];
  for (let current = startMinutes; doesTimeRangeFit(formatMinutesToTime(current), end, duration); current += duration) {
    slots.push(formatMinutesToTime(current));
  }

  return slots;
};

export default generateSlots;
