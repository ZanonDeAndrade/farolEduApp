import { getCollection } from "../repositories/firestore/helpers";
import { FirestoreBookingRepository } from "../repositories/firestore/bookingRepository";
import { BookingDateRange, BookingDecision, CreateBookingInput } from "../repositories/bookingRepository";
import { Schedule } from "../repositories/models";
import { normalizeBookingDateTime } from "../utils/dateTime";

const TEACHER_CLASSES = "teacherClasses";

const bookingRepository = new FirestoreBookingRepository();

export class BookingServiceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = "BookingServiceError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

const assertValidBookingInput = async (input: CreateBookingInput) => {
  if (!Number.isFinite(input.studentId) || input.studentId <= 0) {
    throw new BookingServiceError("Aluno invalido", "INVALID_STUDENT_ID", 400);
  }

  if (!Number.isFinite(input.offerId) || input.offerId <= 0) {
    throw new BookingServiceError("Oferta invalida", "INVALID_OFFER_ID", 400);
  }

  const offerDoc = await getCollection(TEACHER_CLASSES).doc(String(input.offerId)).get();
  if (!offerDoc.exists) {
    throw new BookingServiceError("Oferta nao encontrada", "OFFER_NOT_FOUND", 404);
  }

  const offer = offerDoc.data() ?? {};
  if (!offer.active) {
    throw new BookingServiceError("Oferta nao esta ativa", "OFFER_INACTIVE", 400);
  }

  const durationMinutes = Number(offer.durationMinutes);
  try {
    normalizeBookingDateTime({
      date: input.date,
      startTime: input.startTime,
      durationMinutes: Number.isFinite(durationMinutes) && durationMinutes > 0 ? Math.round(durationMinutes) : 60,
    });
  } catch {
    throw new BookingServiceError("Horario invalido", "INVALID_SLOT", 400);
  }
};

export const createBookingForStudent = async (input: CreateBookingInput): Promise<Schedule> => {
  await assertValidBookingInput(input);
  return bookingRepository.createBooking({
    studentId: input.studentId,
    offerId: input.offerId,
    date: input.date,
    startTime: input.startTime,
    notes: input.notes ?? null,
  });
};

export const listBookingsByUser = (userId: number, role: string, range?: BookingDateRange) =>
  bookingRepository.listBookingsByUser(userId, role, range);

export const cancelBookingByActor = (bookingId: number, actorId: number) =>
  bookingRepository.cancelBookingByActor(bookingId, actorId);

export const findPendingByTeacher = (teacherId: number) => bookingRepository.findPendingByTeacher(teacherId);

export const updateBookingStatusByTeacher = (
  bookingId: number,
  teacherId: number,
  status: BookingDecision,
) => bookingRepository.updateStatusByTeacher(bookingId, teacherId, status);

export const legacyMigrateSchedule = () => bookingRepository.legacyMigrateSchedule();
