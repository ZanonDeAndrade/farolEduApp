"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBookingWithinAvailability = exports.normalizeBookingDateTime = exports.getLocalDateRange = exports.combineDateAndTime = exports.addDaysToLocalDate = exports.getDayOfWeekFromLocalDate = exports.getLocalDateTimeParts = exports.doesTimeRangeFit = exports.timeRangesOverlap = exports.validateTimeRange = exports.sortTimeStrings = exports.formatSlotLabel = exports.formatMinutesToTime = exports.parseTimeToMinutes = exports.isValidTimeString = exports.buildDateString = exports.isValidDateString = exports.parseDateString = exports.TIME_PATTERN = exports.DATE_PATTERN = void 0;
const env_1 = require("../config/env");
exports.DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
exports.TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const APP_DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
    timeZone: env_1.APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
});
const readPart = (parts, type) => {
    const value = parts.find(part => part.type === type)?.value;
    if (!value) {
        throw new Error(`MISSING_${type.toUpperCase()}_PART`);
    }
    return Number(value);
};
const parseDateString = (value) => {
    const match = exports.DATE_PATTERN.exec(value);
    if (!match) {
        throw new Error("INVALID_DATE");
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const candidate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
    if (candidate.getUTCFullYear() !== year ||
        candidate.getUTCMonth() !== month - 1 ||
        candidate.getUTCDate() !== day) {
        throw new Error("INVALID_DATE");
    }
    return { year, month, day };
};
exports.parseDateString = parseDateString;
const isValidDateString = (value) => {
    try {
        (0, exports.parseDateString)(value);
        return true;
    }
    catch {
        return false;
    }
};
exports.isValidDateString = isValidDateString;
const buildDateString = ({ year, month, day }) => `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
exports.buildDateString = buildDateString;
const isValidTimeString = (value) => exports.TIME_PATTERN.test(value);
exports.isValidTimeString = isValidTimeString;
const parseTimeToMinutes = (value) => {
    const match = exports.TIME_PATTERN.exec(value);
    if (!match) {
        throw new Error("INVALID_TIME");
    }
    return Number(match[1]) * 60 + Number(match[2]);
};
exports.parseTimeToMinutes = parseTimeToMinutes;
const formatMinutesToTime = (minutes) => {
    if (!Number.isFinite(minutes) || minutes < 0 || minutes >= 24 * 60) {
        throw new Error("INVALID_TIME");
    }
    const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
    const minute = String(minutes % 60).padStart(2, "0");
    return `${hour}:${minute}`;
};
exports.formatMinutesToTime = formatMinutesToTime;
const formatSlotLabel = (time) => (0, exports.formatMinutesToTime)((0, exports.parseTimeToMinutes)(time));
exports.formatSlotLabel = formatSlotLabel;
const sortTimeStrings = (times) => times.slice().sort((left, right) => (0, exports.parseTimeToMinutes)(left) - (0, exports.parseTimeToMinutes)(right));
exports.sortTimeStrings = sortTimeStrings;
const validateTimeRange = (startTime, endTime) => (0, exports.parseTimeToMinutes)(startTime) < (0, exports.parseTimeToMinutes)(endTime);
exports.validateTimeRange = validateTimeRange;
const timeRangesOverlap = (startA, endA, startB, endB) => {
    const startAMinutes = (0, exports.parseTimeToMinutes)(startA);
    const endAMinutes = (0, exports.parseTimeToMinutes)(endA);
    const startBMinutes = (0, exports.parseTimeToMinutes)(startB);
    const endBMinutes = (0, exports.parseTimeToMinutes)(endB);
    return startAMinutes < endBMinutes && startBMinutes < endAMinutes;
};
exports.timeRangesOverlap = timeRangesOverlap;
const doesTimeRangeFit = (startTime, endTime, durationMinutes) => {
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
        return false;
    }
    return (0, exports.parseTimeToMinutes)(startTime) + durationMinutes <= (0, exports.parseTimeToMinutes)(endTime);
};
exports.doesTimeRangeFit = doesTimeRangeFit;
const getPartsInAppTimeZone = (date) => {
    const parts = APP_DATE_TIME_FORMATTER.formatToParts(date);
    const year = readPart(parts, "year");
    const month = readPart(parts, "month");
    const day = readPart(parts, "day");
    const hour = readPart(parts, "hour");
    const minute = readPart(parts, "minute");
    const dateKey = (0, exports.buildDateString)({ year, month, day });
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
const getLocalDateTimeParts = (date) => getPartsInAppTimeZone(date);
exports.getLocalDateTimeParts = getLocalDateTimeParts;
const getDayOfWeekFromLocalDate = (date) => {
    const { year, month, day } = (0, exports.parseDateString)(date);
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0)).getUTCDay();
};
exports.getDayOfWeekFromLocalDate = getDayOfWeekFromLocalDate;
const addDaysToLocalDate = (date, days) => {
    const { year, month, day } = (0, exports.parseDateString)(date);
    const next = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0, 0));
    return (0, exports.buildDateString)({
        year: next.getUTCFullYear(),
        month: next.getUTCMonth() + 1,
        day: next.getUTCDate(),
    });
};
exports.addDaysToLocalDate = addDaysToLocalDate;
const combineDateAndTime = (date, time) => {
    const { year, month, day } = (0, exports.parseDateString)(date);
    const [hour, minute] = (0, exports.formatSlotLabel)(time).split(":").map(Number);
    let guess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const actual = getPartsInAppTimeZone(guess);
        const diffMs = Date.UTC(year, month - 1, day, hour, minute, 0, 0) -
            Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, 0, 0);
        if (diffMs === 0) {
            return guess;
        }
        guess = new Date(guess.getTime() + diffMs);
    }
    return guess;
};
exports.combineDateAndTime = combineDateAndTime;
const getLocalDateRange = (date) => ({
    startAtUtc: (0, exports.combineDateAndTime)(date, "00:00"),
    endAtUtc: (0, exports.combineDateAndTime)((0, exports.addDaysToLocalDate)(date, 1), "00:00"),
});
exports.getLocalDateRange = getLocalDateRange;
const normalizeBookingDateTime = (input) => {
    const date = (0, exports.buildDateString)((0, exports.parseDateString)(input.date));
    const startTime = (0, exports.formatSlotLabel)(input.startTime);
    const explicitEndTime = "endTime" in input && typeof input.endTime === "string" ? input.endTime : undefined;
    const durationMinutesValue = "durationMinutes" in input && typeof input.durationMinutes === "number" && Number.isFinite(input.durationMinutes)
        ? input.durationMinutes
        : explicitEndTime
            ? (0, exports.parseTimeToMinutes)(explicitEndTime) - (0, exports.parseTimeToMinutes)(startTime)
            : NaN;
    const endTime = explicitEndTime
        ? (0, exports.formatSlotLabel)(explicitEndTime)
        : (0, exports.formatMinutesToTime)((0, exports.parseTimeToMinutes)(startTime) + durationMinutesValue);
    if (!Number.isFinite(durationMinutesValue) || durationMinutesValue <= 0) {
        throw new Error("INVALID_SLOT");
    }
    const durationMinutes = durationMinutesValue;
    if (!(0, exports.validateTimeRange)(startTime, endTime)) {
        throw new Error("INVALID_SLOT");
    }
    const startAtUtc = (0, exports.combineDateAndTime)(date, startTime);
    const endAtUtc = (0, exports.combineDateAndTime)(date, endTime);
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
        dayOfWeek: (0, exports.getDayOfWeekFromLocalDate)(date),
    };
};
exports.normalizeBookingDateTime = normalizeBookingDateTime;
const isBookingWithinAvailability = (slotStart, bookingDuration, availabilityStart, availabilityEnd, slotDuration) => {
    if (!Number.isFinite(bookingDuration) || bookingDuration <= 0)
        return false;
    if (!Number.isFinite(slotDuration) || slotDuration <= 0)
        return false;
    const slotStartMinutes = (0, exports.parseTimeToMinutes)(slotStart);
    const availabilityStartMinutes = (0, exports.parseTimeToMinutes)(availabilityStart);
    const availabilityEndMinutes = (0, exports.parseTimeToMinutes)(availabilityEnd);
    if (slotStartMinutes < availabilityStartMinutes)
        return false;
    if (slotStartMinutes + bookingDuration > availabilityEndMinutes)
        return false;
    return (slotStartMinutes - availabilityStartMinutes) % slotDuration === 0;
};
exports.isBookingWithinAvailability = isBookingWithinAvailability;
