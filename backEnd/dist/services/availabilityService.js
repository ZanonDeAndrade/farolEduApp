"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableSlots = exports.deleteAvailabilityByTeacher = exports.listAvailabilityByTeacher = exports.createAvailabilityForTeacher = exports.AvailabilityServiceError = void 0;
const helpers_1 = require("../repositories/firestore/helpers");
const availabilityRepository_1 = require("../repositories/firestore/availabilityRepository");
const bookingRepository_1 = require("../repositories/firestore/bookingRepository");
const dateTime_1 = require("../utils/dateTime");
const appTime_1 = require("../utils/appTime");
const generateSlots_1 = require("../utils/generateSlots");
const timeRange_1 = require("../utils/timeRange");
const TEACHER_CLASSES = "teacherClasses";
const availabilityRepository = new availabilityRepository_1.FirestoreAvailabilityRepository();
const bookingRepository = new bookingRepository_1.FirestoreBookingRepository();
class AvailabilityServiceError extends Error {
    constructor(message, code, statusCode = 400) {
        super(message);
        this.name = "AvailabilityServiceError";
        this.code = code;
        this.statusCode = statusCode;
    }
}
exports.AvailabilityServiceError = AvailabilityServiceError;
const resolveOfferDuration = async (teacherId, offerId) => {
    if (!Number.isFinite(offerId))
        return null;
    const snap = await (0, helpers_1.getCollection)(TEACHER_CLASSES).doc(String(offerId)).get();
    if (!snap.exists) {
        throw new AvailabilityServiceError("Oferta não encontrada", "OFFER_NOT_FOUND", 404);
    }
    const offer = snap.data() ?? {};
    if (Number(offer.teacherId) !== teacherId) {
        throw new AvailabilityServiceError("Oferta não pertence a este professor", "OFFER_TEACHER_MISMATCH", 400);
    }
    const duration = Number(offer.durationMinutes);
    return Number.isFinite(duration) && duration > 0 ? Math.round(duration) : 60;
};
const ensureNonOverlappingAvailability = async (teacherId, dayOfWeek, startTime, endTime) => {
    const existing = await availabilityRepository.getByTeacherAndDay(teacherId, dayOfWeek);
    const hasOverlap = existing.some(item => (0, timeRange_1.timeRangesOverlap)(item.startTime, item.endTime, startTime, endTime));
    if (hasOverlap) {
        throw new AvailabilityServiceError("Já existe um horário cadastrado que conflita com este intervalo", "AVAILABILITY_CONFLICT", 409);
    }
};
const createAvailabilityForTeacher = async (teacherId, input) => {
    if (!(0, dateTime_1.validateTimeRange)(input.startTime, input.endTime)) {
        throw new AvailabilityServiceError("Hora final deve ser maior que a hora inicial", "INVALID_TIME_RANGE", 400);
    }
    if (!(0, dateTime_1.doesTimeRangeFit)(input.startTime, input.endTime, input.slotDuration)) {
        throw new AvailabilityServiceError("A duracao do slot deve caber integralmente dentro da janela informada", "INVALID_SLOT_DURATION", 400);
    }
    await ensureNonOverlappingAvailability(teacherId, input.dayOfWeek, input.startTime, input.endTime);
    return availabilityRepository.createAvailability({
        teacherId,
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        slotDuration: input.slotDuration,
    });
};
exports.createAvailabilityForTeacher = createAvailabilityForTeacher;
const listAvailabilityByTeacher = (teacherId) => availabilityRepository.getByTeacher(teacherId);
exports.listAvailabilityByTeacher = listAvailabilityByTeacher;
const deleteAvailabilityByTeacher = async (teacherId, id) => {
    const current = await availabilityRepository.getByTeacher(teacherId);
    const ownsAvailability = current.some(item => item.id === id);
    if (!ownsAvailability)
        return false;
    return availabilityRepository.deleteAvailability(id);
};
exports.deleteAvailabilityByTeacher = deleteAvailabilityByTeacher;
const getAvailableSlots = async (teacherId, date, options) => {
    if (!Number.isFinite(teacherId) || teacherId <= 0) {
        throw new AvailabilityServiceError("Professor inválido", "INVALID_TEACHER_ID", 400);
    }
    if (!(0, appTime_1.isValidDateKey)(date)) {
        throw new AvailabilityServiceError("Data inválida", "INVALID_DATE", 400);
    }
    const dayOfWeek = (0, appTime_1.getDayOfWeekFromDateKey)(date);
    const requiredDuration = await resolveOfferDuration(teacherId, options?.offerId);
    const dayAvailability = await availabilityRepository.getByTeacherAndDay(teacherId, dayOfWeek);
    if (!dayAvailability.length) {
        return [];
    }
    const candidates = dayAvailability.flatMap(item => {
        const duration = requiredDuration ?? item.slotDuration;
        return (0, generateSlots_1.generateSlots)(item.startTime, item.endTime, item.slotDuration)
            .filter(time => (0, timeRange_1.isBookingWithinAvailability)(time, duration, item.startTime, item.endTime, item.slotDuration))
            .map(time => ({
            time,
            duration,
        }));
    });
    if (!candidates.length) {
        return [];
    }
    const { startAtUtc, endAtUtc } = (0, appTime_1.getDateRangeForDateKey)(date);
    const bookings = await bookingRepository.findBlockingBookingsByTeacherInRange(teacherId, startAtUtc, endAtUtc);
    const available = candidates.filter(candidate => {
        const startAtUtc = (0, appTime_1.dateKeyTimeToDate)(date, candidate.time);
        const endAtUtc = new Date(startAtUtc.getTime() + candidate.duration * 60000);
        return !bookings.some(booking => startAtUtc < booking.endAtUtc && endAtUtc > booking.startAtUtc);
    });
    return (0, timeRange_1.sortTimeStrings)(Array.from(new Set(available.map(item => item.time))));
};
exports.getAvailableSlots = getAvailableSlots;
