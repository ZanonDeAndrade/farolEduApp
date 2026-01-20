import { FirestoreBookingRepository } from "../repositories/firestore/bookingRepository";
import { BookingDateRange, BookingDecision, CreateBookingInput } from "../repositories/bookingRepository";

const repo = new FirestoreBookingRepository();

export const createBooking = (input: CreateBookingInput) => repo.createBooking(input);

export const listBookingsByUser = (userId: number, role: string, range?: BookingDateRange) =>
  repo.listBookingsByUser(userId, role, range);

export const cancelBookingByActor = (bookingId: number, actorId: number) =>
  repo.cancelBookingByActor(bookingId, actorId);

export const findPendingByTeacher = (teacherId: number) => repo.findPendingByTeacher(teacherId);

export const updateBookingStatusByTeacher = (bookingId: number, teacherId: number, status: BookingDecision) =>
  repo.updateStatusByTeacher(bookingId, teacherId, status);

export const legacyMigrateSchedule = () => repo.legacyMigrateSchedule();
