import { firestore } from "../../infra/firebase";
import { fromTimestamp, getCollection, getNextId } from "./helpers";
import { BookingDateRange, CreateBookingInput, IBookingRepository } from "../bookingRepository";
import { Schedule } from "../models";

const SCHEDULES = "schedules";
const TEACHER_CLASSES = "teacherClasses";
const USERS = "users";

const PENDING_STATUSES = ["PENDING", "AGUARDANDO_PROFESSOR"];
const REJECTED_STATUSES = ["RECUSADO", "REJECTED"];
const ACCEPTED_STATUSES = ["ACEITO", "ACCEPTED", "CONFIRMED"];

const mapSchedule = (data: FirebaseFirestore.DocumentData, id: number): Schedule => ({
  id,
  offerId: data.offerId ?? null,
  studentId: data.studentId,
  teacherId: data.teacherId,
  startTime: fromTimestamp(data.startTime) ?? new Date(),
  endTime: fromTimestamp(data.endTime) ?? new Date(),
  status: data.status,
  notes: data.notes ?? null,
  respondedAt: fromTimestamp(data.respondedAt) ?? null,
  createdAt: fromTimestamp(data.createdAt) ?? new Date(),
  updatedAt: fromTimestamp(data.updatedAt) ?? new Date(),
});

const isCancelled = (status: string) => (status || "").toUpperCase() === "CANCELLED";

const withRelations = async (booking: Schedule) => {
  const [teacherDoc, studentDoc, offerDoc] = await Promise.all([
    getCollection(USERS).doc(String(booking.teacherId)).get(),
    getCollection(USERS).doc(String(booking.studentId)).get(),
    booking.offerId ? getCollection(TEACHER_CLASSES).doc(String(booking.offerId)).get() : Promise.resolve(null),
  ]);

  const teacher = teacherDoc?.exists ? teacherDoc.data() : null;
  const student = studentDoc?.exists ? studentDoc.data() : null;
  const offer = offerDoc?.exists ? offerDoc.data() : null;

  return {
    ...booking,
    teacher: teacher
      ? { id: teacher.id, name: teacher.name, email: teacher.email }
      : undefined,
    student: student
      ? { id: student.id, name: student.name, email: student.email }
      : undefined,
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

export class FirestoreBookingRepository implements IBookingRepository {
  async createBooking(input: CreateBookingInput): Promise<Schedule> {
    const id = await getNextId(SCHEDULES);
    const booking = await firestore.runTransaction<Schedule>(async tx => {
      const offerRef = getCollection(TEACHER_CLASSES).doc(String(input.offerId));
      const offerDoc = await tx.get(offerRef);
      if (!offerDoc.exists) {
        const err = new Error("OFFER_NOT_FOUND");
        (err as any).code = "OFFER_NOT_FOUND";
        throw err;
      }
      const offer = offerDoc.data()!;
      if (!offer.active) {
        const err = new Error("OFFER_INACTIVE");
        (err as any).code = "OFFER_INACTIVE";
        throw err;
      }

      const duration = Number.isFinite(offer.durationMinutes) ? offer.durationMinutes : 60;
      const endTime = new Date(input.startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);

      // Conflitos professor
      const teacherQuery = getCollection(SCHEDULES)
        .where("teacherId", "==", offer.teacherId)
        .where("startTime", "<", endTime)
        .orderBy("startTime");
      const teacherSnap = await tx.get(teacherQuery);
      const conflictTeacher = teacherSnap.docs
        .map(doc => mapSchedule(doc.data(), Number(doc.id)))
        .find(s => !isCancelled(s.status) && s.endTime > input.startTime);
      if (conflictTeacher) {
        const err = new Error("BOOKING_CONFLICT_TEACHER");
        (err as any).code = "BOOKING_CONFLICT_TEACHER";
        throw err;
      }

      // Conflitos estudante
      const studentQuery = getCollection(SCHEDULES)
        .where("studentId", "==", input.studentId)
        .where("startTime", "<", endTime)
        .orderBy("startTime");
      const studentSnap = await tx.get(studentQuery);
      const conflictStudent = studentSnap.docs
        .map(doc => mapSchedule(doc.data(), Number(doc.id)))
        .find(s => !isCancelled(s.status) && s.endTime > input.startTime);
      if (conflictStudent) {
        const err = new Error("BOOKING_CONFLICT_STUDENT");
        (err as any).code = "BOOKING_CONFLICT_STUDENT";
        throw err;
      }

      const now = new Date();
      const payload = {
        id,
        offerId: offer.id,
        studentId: input.studentId,
        teacherId: offer.teacherId,
        startTime: input.startTime,
        endTime,
        notes: input.notes ?? null,
        status: "PENDING",
        respondedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      tx.set(getCollection(SCHEDULES).doc(String(id)), payload);
      return mapSchedule(payload, id);
    });

    return withRelations(booking);
  }

  async listBookingsByUser(userId: number, role: string, range: BookingDateRange = {}): Promise<Schedule[]> {
    const isTeacher = (role || "").toLowerCase() === "teacher";
    let ref: FirebaseFirestore.Query = getCollection(SCHEDULES).where(isTeacher ? "teacherId" : "studentId", "==", userId);

    if (range.from) {
      ref = ref.where("startTime", ">=", range.from);
    }
    if (range.to) {
      ref = ref.where("startTime", "<=", range.to);
    }
    ref = ref.orderBy("startTime", "asc");

    const snap = await ref.get();
    const bookings = snap.docs.map(doc => mapSchedule(doc.data(), Number(doc.id)));
    const withRel = await Promise.all(bookings.map(withRelations));
    return withRel.sort((a, b) => a.startTime.getTime() - b.startTime.getTime() || a.id - b.id);
  }

  async cancelBookingByActor(bookingId: number, actorId: number): Promise<Schedule | "FORBIDDEN" | null> {
    const updated = await firestore.runTransaction<Schedule | "FORBIDDEN" | null>(async tx => {
      const ref = getCollection(SCHEDULES).doc(String(bookingId));
      const snap = await tx.get(ref);
      if (!snap.exists) return null;
      const booking = mapSchedule(snap.data()!, bookingId);
      if (actorId !== booking.studentId && actorId !== booking.teacherId) {
        return "FORBIDDEN";
      }
      if (isCancelled(booking.status)) {
        return booking;
      }
      const next: Schedule = { ...booking, status: "CANCELLED", updatedAt: new Date() };
      tx.set(ref, next);
      return next;
    });

    if (!updated || updated === "FORBIDDEN") return updated;
    return withRelations(updated);
  }

  async findPendingByTeacher(teacherId: number): Promise<Schedule[]> {
    const ref = getCollection(SCHEDULES)
      .where("teacherId", "==", teacherId)
      .where("status", "in", PENDING_STATUSES)
      .orderBy("startTime", "asc");

    const snap = await ref.get();
    const bookings = snap.docs.map(doc => mapSchedule(doc.data(), Number(doc.id)));
    return Promise.all(bookings.map(withRelations));
  }

  async updateStatusByTeacher(
    bookingId: number,
    teacherId: number,
    nextStatus: "ACEITO" | "RECUSADO",
  ): Promise<Schedule | "FORBIDDEN" | "INVALID_STATUS" | null> {
    const normalizedNext = nextStatus === "ACEITO" ? "ACEITO" : "RECUSADO";
    const updated = await firestore.runTransaction<Schedule | "FORBIDDEN" | "INVALID_STATUS" | null>(async tx => {
      const ref = getCollection(SCHEDULES).doc(String(bookingId));
      const snap = await tx.get(ref);
      if (!snap.exists) return null;
      const booking = mapSchedule(snap.data()!, bookingId);

      if (booking.teacherId !== teacherId) return "FORBIDDEN";

      const currentStatus = (booking.status || "").toUpperCase();
      const isPending = PENDING_STATUSES.includes(currentStatus);
      if (!isPending) return "INVALID_STATUS";

      const now = new Date();
      const next: Schedule = {
        ...booking,
        status: normalizedNext,
        respondedAt: now,
        updatedAt: now,
      };
      tx.set(ref, next);
      return next;
    });

    if (!updated || updated === "FORBIDDEN" || updated === "INVALID_STATUS") return updated;
    return withRelations(updated);
  }

  async legacyMigrateSchedule(): Promise<void> {
    // Sem no-op; nada a migrar
    return;
  }
}
