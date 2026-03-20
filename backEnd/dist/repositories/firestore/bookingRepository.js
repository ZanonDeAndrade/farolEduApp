"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreBookingRepository = void 0;
const firebase_1 = require("../../infra/firebase");
const dateTime_1 = require("../../utils/dateTime");
const helpers_1 = require("./helpers");
const SCHEDULES = "schedules";
const TEACHER_CLASSES = "teacherClasses";
const TEACHER_AVAILABILITY = "teacher_availability";
const USERS = "users";
const PENDING_STATUSES = ["PENDING", "AGUARDANDO_PROFESSOR"];
const NON_BLOCKING_STATUSES = new Set(["CANCELLED", "RECUSADO", "REJECTED"]);
const createRepositoryError = (code) => {
    const error = new Error(code);
    error.code = code;
    return error;
};
const isBlockingStatus = (status) => !NON_BLOCKING_STATUSES.has((status || "").toUpperCase());
const getLegacyDateTimeRange = (data) => {
    const startAtUtc = (0, helpers_1.fromTimestamp)(data.startAtUtc) ?? (0, helpers_1.fromTimestamp)(data.startTime);
    const endAtUtc = (0, helpers_1.fromTimestamp)(data.endAtUtc) ?? (0, helpers_1.fromTimestamp)(data.endTime);
    if (!startAtUtc || !endAtUtc) {
        throw createRepositoryError("INVALID_SCHEDULE_DATETIME");
    }
    const startParts = (0, dateTime_1.getLocalDateTimeParts)(startAtUtc);
    const endParts = (0, dateTime_1.getLocalDateTimeParts)(endAtUtc);
    return {
        date: typeof data.date === "string" && (0, dateTime_1.isValidDateString)(data.date)
            ? data.date
            : startParts.date,
        startTime: typeof data.startTime === "string" && (0, dateTime_1.isValidTimeString)(data.startTime)
            ? data.startTime
            : startParts.time,
        endTime: typeof data.endTime === "string" && (0, dateTime_1.isValidTimeString)(data.endTime)
            ? data.endTime
            : endParts.time,
        startAtUtc,
        endAtUtc,
    };
};
const mapSchedule = (data, id) => {
    const normalized = getLegacyDateTimeRange(data);
    return {
        id,
        offerId: data.offerId ?? null,
        studentId: Number(data.studentId),
        teacherId: Number(data.teacherId),
        date: normalized.date,
        startTime: normalized.startTime,
        endTime: normalized.endTime,
        startAtUtc: normalized.startAtUtc,
        endAtUtc: normalized.endAtUtc,
        status: data.status,
        notes: data.notes ?? null,
        respondedAt: (0, helpers_1.fromTimestamp)(data.respondedAt) ?? null,
        createdAt: (0, helpers_1.fromTimestamp)(data.createdAt) ?? new Date(),
        updatedAt: (0, helpers_1.fromTimestamp)(data.updatedAt) ?? new Date(),
    };
};
const toScheduleWriteData = (schedule) => ({
    id: schedule.id,
    offerId: schedule.offerId,
    studentId: schedule.studentId,
    teacherId: schedule.teacherId,
    date: schedule.date,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    startAtUtc: schedule.startAtUtc,
    endAtUtc: schedule.endAtUtc,
    status: schedule.status,
    notes: schedule.notes,
    respondedAt: schedule.respondedAt ?? null,
    createdAt: schedule.createdAt,
    updatedAt: schedule.updatedAt,
});
const withRelations = async (booking) => {
    const [teacherDoc, studentDoc, offerDoc] = await Promise.all([
        (0, helpers_1.getCollection)(USERS).doc(String(booking.teacherId)).get(),
        (0, helpers_1.getCollection)(USERS).doc(String(booking.studentId)).get(),
        booking.offerId ? (0, helpers_1.getCollection)(TEACHER_CLASSES).doc(String(booking.offerId)).get() : Promise.resolve(null),
    ]);
    const teacher = teacherDoc?.exists ? teacherDoc.data() : null;
    const student = studentDoc?.exists ? studentDoc.data() : null;
    const offer = offerDoc?.exists ? offerDoc.data() : null;
    return {
        ...booking,
        teacher: teacher ? { id: teacher.id, name: teacher.name, email: teacher.email } : undefined,
        student: student ? { id: student.id, name: student.name, email: student.email } : undefined,
        offer: offer
            ? {
                id: offer.id,
                title: offer.title,
                subject: offer.subject ?? null,
                modality: offer.modality,
                durationMinutes: offer.durationMinutes,
            }
            : null,
    };
};
const sortSchedules = (items) => items.slice().sort((left, right) => left.startAtUtc.getTime() - right.startAtUtc.getTime() || left.id - right.id);
const getConflictingSchedulesInTransaction = async (tx, field, ownerId, startAtUtc, endAtUtc) => {
    const snap = await tx.get((0, helpers_1.getCollection)(SCHEDULES).where(field, "==", ownerId));
    return sortSchedules(snap.docs
        .map(doc => mapSchedule(doc.data(), Number(doc.id)))
        .filter(schedule => isBlockingStatus(schedule.status) &&
        schedule.startAtUtc < endAtUtc &&
        schedule.endAtUtc > startAtUtc));
};
class FirestoreBookingRepository {
    async createBooking(input) {
        const id = await (0, helpers_1.getNextId)(SCHEDULES);
        const booking = await firebase_1.firestore.runTransaction(async (tx) => {
            const offerRef = (0, helpers_1.getCollection)(TEACHER_CLASSES).doc(String(input.offerId));
            const offerDoc = await tx.get(offerRef);
            if (!offerDoc.exists) {
                throw createRepositoryError("OFFER_NOT_FOUND");
            }
            const offer = offerDoc.data();
            if (!offer.active) {
                throw createRepositoryError("OFFER_INACTIVE");
            }
            const teacherId = Number(offer.teacherId);
            const durationMinutes = Number.isFinite(offer.durationMinutes) ? Math.round(offer.durationMinutes) : 60;
            let normalized;
            try {
                normalized = (0, dateTime_1.normalizeBookingDateTime)({
                    date: input.date,
                    startTime: input.startTime,
                    durationMinutes,
                });
            }
            catch {
                throw createRepositoryError("INVALID_SLOT");
            }
            const availabilitySnap = await tx.get((0, helpers_1.getCollection)(TEACHER_AVAILABILITY)
                .where("teacherId", "==", teacherId)
                .where("dayOfWeek", "==", normalized.dayOfWeek));
            const fitsAvailability = availabilitySnap.docs.some(doc => {
                const data = doc.data();
                return (0, dateTime_1.isBookingWithinAvailability)(normalized.startTime, normalized.durationMinutes, String(data.startTime), String(data.endTime), Number(data.slotDuration));
            });
            if (!fitsAvailability) {
                throw createRepositoryError("SLOT_OUTSIDE_AVAILABILITY");
            }
            const [teacherConflicts, studentConflicts] = await Promise.all([
                getConflictingSchedulesInTransaction(tx, "teacherId", teacherId, normalized.startAtUtc, normalized.endAtUtc),
                getConflictingSchedulesInTransaction(tx, "studentId", input.studentId, normalized.startAtUtc, normalized.endAtUtc),
            ]);
            if (teacherConflicts.length || studentConflicts.length) {
                throw createRepositoryError("BOOKING_CONFLICT");
            }
            const now = new Date();
            const payload = {
                id,
                offerId: Number(offer.id ?? input.offerId),
                studentId: input.studentId,
                teacherId,
                date: normalized.date,
                startTime: normalized.startTime,
                endTime: normalized.endTime,
                startAtUtc: normalized.startAtUtc,
                endAtUtc: normalized.endAtUtc,
                notes: input.notes ?? null,
                status: "PENDING",
                respondedAt: null,
                createdAt: now,
                updatedAt: now,
            };
            tx.set((0, helpers_1.getCollection)(SCHEDULES).doc(String(id)), toScheduleWriteData(payload));
            return payload;
        });
        return withRelations(booking);
    }
    async listBookingsByUser(userId, role, range = {}) {
        const isTeacher = (role || "").toLowerCase() === "teacher";
        const snap = await (0, helpers_1.getCollection)(SCHEDULES)
            .where(isTeacher ? "teacherId" : "studentId", "==", userId)
            .get();
        const bookings = sortSchedules(snap.docs
            .map(doc => mapSchedule(doc.data(), Number(doc.id)))
            .filter(item => (!range.from || item.startAtUtc >= range.from) && (!range.to || item.startAtUtc <= range.to)));
        const withRel = await Promise.all(bookings.map(withRelations));
        return sortSchedules(withRel);
    }
    async findBlockingBookingsByTeacherInRange(teacherId, from, to) {
        const snap = await (0, helpers_1.getCollection)(SCHEDULES)
            .where("teacherId", "==", teacherId)
            .get();
        return sortSchedules(snap.docs
            .map(doc => mapSchedule(doc.data(), Number(doc.id)))
            .filter(booking => isBlockingStatus(booking.status) && booking.endAtUtc > from && booking.startAtUtc < to));
    }
    async cancelBookingByActor(bookingId, actorId) {
        const updated = await firebase_1.firestore.runTransaction(async (tx) => {
            const ref = (0, helpers_1.getCollection)(SCHEDULES).doc(String(bookingId));
            const snap = await tx.get(ref);
            if (!snap.exists)
                return null;
            const booking = mapSchedule(snap.data(), bookingId);
            if (actorId !== booking.studentId && actorId !== booking.teacherId) {
                return "FORBIDDEN";
            }
            if ((booking.status || "").toUpperCase() === "CANCELLED") {
                return booking;
            }
            const next = { ...booking, status: "CANCELLED", updatedAt: new Date() };
            tx.set(ref, toScheduleWriteData(next), { merge: true });
            return next;
        });
        if (!updated || updated === "FORBIDDEN")
            return updated;
        return withRelations(updated);
    }
    async findPendingByTeacher(teacherId) {
        const snap = await (0, helpers_1.getCollection)(SCHEDULES).where("teacherId", "==", teacherId).get();
        const bookings = sortSchedules(snap.docs
            .map(doc => mapSchedule(doc.data(), Number(doc.id)))
            .filter(item => PENDING_STATUSES.includes((item.status || "").toUpperCase())));
        return Promise.all(bookings.map(withRelations));
    }
    async updateStatusByTeacher(bookingId, teacherId, nextStatus) {
        const updated = await firebase_1.firestore.runTransaction(async (tx) => {
            const ref = (0, helpers_1.getCollection)(SCHEDULES).doc(String(bookingId));
            const snap = await tx.get(ref);
            if (!snap.exists)
                return null;
            const booking = mapSchedule(snap.data(), bookingId);
            if (booking.teacherId !== teacherId)
                return "FORBIDDEN";
            const currentStatus = (booking.status || "").toUpperCase();
            const isPending = PENDING_STATUSES.includes(currentStatus);
            if (!isPending)
                return "INVALID_STATUS";
            const now = new Date();
            const next = {
                ...booking,
                status: nextStatus,
                respondedAt: now,
                updatedAt: now,
            };
            tx.set(ref, toScheduleWriteData(next), { merge: true });
            return next;
        });
        if (!updated || updated === "FORBIDDEN" || updated === "INVALID_STATUS")
            return updated;
        return withRelations(updated);
    }
    async legacyMigrateSchedule() {
        const snap = await (0, helpers_1.getCollection)(SCHEDULES).get();
        if (snap.empty)
            return;
        let batch = firebase_1.firestore.batch();
        let operations = 0;
        const commitBatch = async () => {
            if (!operations)
                return;
            await batch.commit();
            batch = firebase_1.firestore.batch();
            operations = 0;
        };
        for (const doc of snap.docs) {
            try {
                const data = doc.data();
                const normalized = getLegacyDateTimeRange(data);
                const needsUpdate = !data.startAtUtc ||
                    !data.endAtUtc ||
                    data.date !== normalized.date ||
                    data.startTime !== normalized.startTime ||
                    data.endTime !== normalized.endTime;
                if (!needsUpdate) {
                    continue;
                }
                batch.set(doc.ref, {
                    date: normalized.date,
                    startTime: normalized.startTime,
                    endTime: normalized.endTime,
                    startAtUtc: normalized.startAtUtc,
                    endAtUtc: normalized.endAtUtc,
                }, { merge: true });
                operations += 1;
                if (operations >= 400) {
                    await commitBatch();
                }
            }
            catch (error) {
                console.warn(`Falha ao migrar schedule ${doc.id}:`, error);
            }
        }
        await commitBatch();
    }
}
exports.FirestoreBookingRepository = FirestoreBookingRepository;
