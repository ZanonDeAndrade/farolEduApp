"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreAvailabilityRepository = void 0;
const helpers_1 = require("./helpers");
const timeRange_1 = require("../../utils/timeRange");
const TEACHER_AVAILABILITY = "teacher_availability";
const mapAvailability = (data, id) => ({
    id,
    teacherId: Number(data.teacherId),
    dayOfWeek: Number(data.dayOfWeek),
    startTime: String(data.startTime),
    endTime: String(data.endTime),
    slotDuration: Number(data.slotDuration),
});
const sortAvailability = (items) => items.slice().sort((left, right) => {
    if (left.dayOfWeek !== right.dayOfWeek) {
        return left.dayOfWeek - right.dayOfWeek;
    }
    return (0, timeRange_1.parseTimeToMinutes)(left.startTime) - (0, timeRange_1.parseTimeToMinutes)(right.startTime);
});
class FirestoreAvailabilityRepository {
    async createAvailability(input) {
        const ref = (0, helpers_1.getCollection)(TEACHER_AVAILABILITY).doc();
        const payload = {
            id: ref.id,
            teacherId: input.teacherId,
            dayOfWeek: input.dayOfWeek,
            startTime: input.startTime,
            endTime: input.endTime,
            slotDuration: input.slotDuration,
        };
        await ref.set(payload);
        return payload;
    }
    async getByTeacher(teacherId) {
        const snap = await (0, helpers_1.getCollection)(TEACHER_AVAILABILITY).where("teacherId", "==", teacherId).get();
        return sortAvailability(snap.docs.map(doc => mapAvailability(doc.data(), doc.id)));
    }
    async getByTeacherAndDay(teacherId, dayOfWeek) {
        const snap = await (0, helpers_1.getCollection)(TEACHER_AVAILABILITY)
            .where("teacherId", "==", teacherId)
            .where("dayOfWeek", "==", dayOfWeek)
            .get();
        return sortAvailability(snap.docs.map(doc => mapAvailability(doc.data(), doc.id)));
    }
    async deleteAvailability(id) {
        const ref = (0, helpers_1.getCollection)(TEACHER_AVAILABILITY).doc(id);
        const snap = await ref.get();
        if (!snap.exists)
            return false;
        await ref.delete();
        return true;
    }
}
exports.FirestoreAvailabilityRepository = FirestoreAvailabilityRepository;
