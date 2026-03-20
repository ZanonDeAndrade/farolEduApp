import { CreateAvailabilityInput } from "../repositories/availabilityRepository";
import { getCollection } from "../repositories/firestore/helpers";
import { FirestoreAvailabilityRepository } from "../repositories/firestore/availabilityRepository";
import { FirestoreBookingRepository } from "../repositories/firestore/bookingRepository";
import { TeacherAvailability } from "../repositories/models";
import { doesTimeRangeFit, validateTimeRange } from "../utils/dateTime";
import { dateKeyTimeToDate, getDateRangeForDateKey, getDayOfWeekFromDateKey, isValidDateKey } from "../utils/appTime";
import { generateSlots } from "../utils/generateSlots";
import { isBookingWithinAvailability, sortTimeStrings, timeRangesOverlap } from "../utils/timeRange";

const TEACHER_CLASSES = "teacherClasses";

const availabilityRepository = new FirestoreAvailabilityRepository();
const bookingRepository = new FirestoreBookingRepository();

export class AvailabilityServiceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode = 400) {
    super(message);
    this.name = "AvailabilityServiceError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

const resolveOfferDuration = async (teacherId: number, offerId?: number) => {
  if (!Number.isFinite(offerId)) return null;

  const snap = await getCollection(TEACHER_CLASSES).doc(String(offerId)).get();
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

const ensureNonOverlappingAvailability = async (
  teacherId: number,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
) => {
  const existing = await availabilityRepository.getByTeacherAndDay(teacherId, dayOfWeek);
  const hasOverlap = existing.some(item =>
    timeRangesOverlap(item.startTime, item.endTime, startTime, endTime),
  );

  if (hasOverlap) {
    throw new AvailabilityServiceError(
      "Já existe um horário cadastrado que conflita com este intervalo",
      "AVAILABILITY_CONFLICT",
      409,
    );
  }
};

export const createAvailabilityForTeacher = async (
  teacherId: number,
  input: Omit<CreateAvailabilityInput, "teacherId">,
): Promise<TeacherAvailability> => {
  if (!validateTimeRange(input.startTime, input.endTime)) {
    throw new AvailabilityServiceError("Hora final deve ser maior que a hora inicial", "INVALID_TIME_RANGE", 400);
  }
  if (!doesTimeRangeFit(input.startTime, input.endTime, input.slotDuration)) {
    throw new AvailabilityServiceError(
      "A duracao do slot deve caber integralmente dentro da janela informada",
      "INVALID_SLOT_DURATION",
      400,
    );
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

export const listAvailabilityByTeacher = (teacherId: number) => availabilityRepository.getByTeacher(teacherId);

export const deleteAvailabilityByTeacher = async (teacherId: number, id: string) => {
  const current = await availabilityRepository.getByTeacher(teacherId);
  const ownsAvailability = current.some(item => item.id === id);
  if (!ownsAvailability) return false;

  return availabilityRepository.deleteAvailability(id);
};

export const getAvailableSlots = async (
  teacherId: number,
  date: string,
  options?: { offerId?: number },
): Promise<string[]> => {
  if (!Number.isFinite(teacherId) || teacherId <= 0) {
    throw new AvailabilityServiceError("Professor inválido", "INVALID_TEACHER_ID", 400);
  }
  if (!isValidDateKey(date)) {
    throw new AvailabilityServiceError("Data inválida", "INVALID_DATE", 400);
  }

  const dayOfWeek = getDayOfWeekFromDateKey(date);
  const requiredDuration = await resolveOfferDuration(teacherId, options?.offerId);
  const dayAvailability = await availabilityRepository.getByTeacherAndDay(teacherId, dayOfWeek);
  if (!dayAvailability.length) {
    return [];
  }

  const candidates = dayAvailability.flatMap(item => {
    const duration = requiredDuration ?? item.slotDuration;
    return generateSlots(item.startTime, item.endTime, item.slotDuration)
      .filter(time =>
        isBookingWithinAvailability(time, duration, item.startTime, item.endTime, item.slotDuration),
      )
      .map(time => ({
        time,
        duration,
      }));
  });

  if (!candidates.length) {
    return [];
  }

  const { startAtUtc, endAtUtc } = getDateRangeForDateKey(date);
  const bookings = await bookingRepository.findBlockingBookingsByTeacherInRange(
    teacherId,
    startAtUtc,
    endAtUtc,
  );

  const available = candidates.filter(candidate => {
    const startAtUtc = dateKeyTimeToDate(date, candidate.time);
    const endAtUtc = new Date(startAtUtc.getTime() + candidate.duration * 60_000);

    return !bookings.some(booking => startAtUtc < booking.endAtUtc && endAtUtc > booking.startAtUtc);
  });

  return sortTimeStrings(Array.from(new Set(available.map(item => item.time))));
};
