import { getLocalDateTimeParts } from "./dateTime";

export {
  addDaysToLocalDate as addDaysToDateKey,
  buildDateString as buildDateKey,
  combineDateAndTime as dateKeyTimeToDate,
  getDayOfWeekFromLocalDate as getDayOfWeekFromDateKey,
  getLocalDateRange as getDateRangeForDateKey,
  getLocalDateTimeParts as getAppDateTimeParts,
  isValidDateString as isValidDateKey,
  parseDateString as parseDateKey,
} from "./dateTime";

export const formatDateKeyInAppTimeZone = (date: Date) => getLocalDateTimeParts(date).date;

export const formatTimeInAppTimeZone = (date: Date) => getLocalDateTimeParts(date).time;
