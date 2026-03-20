import { CreateAvailabilityInput, IAvailabilityRepository } from "../availabilityRepository";
import { TeacherAvailability } from "../models";
import { getCollection } from "./helpers";
import { parseTimeToMinutes } from "../../utils/timeRange";

const TEACHER_AVAILABILITY = "teacher_availability";

const mapAvailability = (
  data: FirebaseFirestore.DocumentData,
  id: string,
): TeacherAvailability => ({
  id,
  teacherId: Number(data.teacherId),
  dayOfWeek: Number(data.dayOfWeek),
  startTime: String(data.startTime),
  endTime: String(data.endTime),
  slotDuration: Number(data.slotDuration),
});

const sortAvailability = (items: TeacherAvailability[]) =>
  items.slice().sort((left, right) => {
    if (left.dayOfWeek !== right.dayOfWeek) {
      return left.dayOfWeek - right.dayOfWeek;
    }

    return parseTimeToMinutes(left.startTime) - parseTimeToMinutes(right.startTime);
  });

export class FirestoreAvailabilityRepository implements IAvailabilityRepository {
  async createAvailability(input: CreateAvailabilityInput): Promise<TeacherAvailability> {
    const ref = getCollection(TEACHER_AVAILABILITY).doc();
    const payload: TeacherAvailability = {
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

  async getByTeacher(teacherId: number): Promise<TeacherAvailability[]> {
    const snap = await getCollection(TEACHER_AVAILABILITY).where("teacherId", "==", teacherId).get();
    return sortAvailability(snap.docs.map(doc => mapAvailability(doc.data(), doc.id)));
  }

  async getByTeacherAndDay(teacherId: number, dayOfWeek: number): Promise<TeacherAvailability[]> {
    const snap = await getCollection(TEACHER_AVAILABILITY)
      .where("teacherId", "==", teacherId)
      .where("dayOfWeek", "==", dayOfWeek)
      .get();

    return sortAvailability(snap.docs.map(doc => mapAvailability(doc.data(), doc.id)));
  }

  async deleteAvailability(id: string): Promise<boolean> {
    const ref = getCollection(TEACHER_AVAILABILITY).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return false;

    await ref.delete();
    return true;
  }
}
