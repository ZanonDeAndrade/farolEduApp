"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.legacyMigrateSchedule = exports.updateBookingStatusByTeacher = exports.findPendingByTeacher = exports.cancelBookingByActor = exports.listBookingsByUser = exports.createBookingForStudent = exports.BookingServiceError = void 0;
const helpers_1 = require("../repositories/firestore/helpers");
const bookingRepository_1 = require("../repositories/firestore/bookingRepository");
const dateTime_1 = require("../utils/dateTime");
const TEACHER_CLASSES = "teacherClasses";
const bookingRepository = new bookingRepository_1.FirestoreBookingRepository();
class BookingServiceError extends Error {
    constructor(message, code, statusCode) {
        super(message);
        this.name = "BookingServiceError";
        this.code = code;
        this.statusCode = statusCode;
    }
}
exports.BookingServiceError = BookingServiceError;
const assertValidBookingInput = async (input) => {
    if (!Number.isFinite(input.studentId) || input.studentId <= 0) {
        throw new BookingServiceError("Aluno invalido", "INVALID_STUDENT_ID", 400);
    }
    if (!Number.isFinite(input.offerId) || input.offerId <= 0) {
        throw new BookingServiceError("Oferta invalida", "INVALID_OFFER_ID", 400);
    }
    const offerDoc = await (0, helpers_1.getCollection)(TEACHER_CLASSES).doc(String(input.offerId)).get();
    if (!offerDoc.exists) {
        throw new BookingServiceError("Oferta nao encontrada", "OFFER_NOT_FOUND", 404);
    }
    const offer = offerDoc.data() ?? {};
    if (!offer.active) {
        throw new BookingServiceError("Oferta nao esta ativa", "OFFER_INACTIVE", 400);
    }
    const durationMinutes = Number(offer.durationMinutes);
    try {
        (0, dateTime_1.normalizeBookingDateTime)({
            date: input.date,
            startTime: input.startTime,
            durationMinutes: Number.isFinite(durationMinutes) && durationMinutes > 0 ? Math.round(durationMinutes) : 60,
        });
    }
    catch {
        throw new BookingServiceError("Horario invalido", "INVALID_SLOT", 400);
    }
};
const createBookingForStudent = async (input) => {
    await assertValidBookingInput(input);
    return bookingRepository.createBooking({
        studentId: input.studentId,
        offerId: input.offerId,
        date: input.date,
        startTime: input.startTime,
        notes: input.notes ?? null,
    });
};
exports.createBookingForStudent = createBookingForStudent;
const listBookingsByUser = (userId, role, range) => bookingRepository.listBookingsByUser(userId, role, range);
exports.listBookingsByUser = listBookingsByUser;
const cancelBookingByActor = (bookingId, actorId) => bookingRepository.cancelBookingByActor(bookingId, actorId);
exports.cancelBookingByActor = cancelBookingByActor;
const findPendingByTeacher = (teacherId) => bookingRepository.findPendingByTeacher(teacherId);
exports.findPendingByTeacher = findPendingByTeacher;
const updateBookingStatusByTeacher = (bookingId, teacherId, status) => bookingRepository.updateStatusByTeacher(bookingId, teacherId, status);
exports.updateBookingStatusByTeacher = updateBookingStatusByTeacher;
const legacyMigrateSchedule = () => bookingRepository.legacyMigrateSchedule();
exports.legacyMigrateSchedule = legacyMigrateSchedule;
