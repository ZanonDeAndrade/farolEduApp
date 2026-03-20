import { Schedule } from "./models";

export type CreateBookingInput = {
  studentId: number;
  offerId: number;
  date: string;
  startTime: string;
  notes?: string | null;
};

export type BookingDateRange = {
  from?: Date;
  to?: Date;
};

export type BookingDecision = "CONFIRMED" | "REJECTED";

export interface IBookingRepository {
  createBooking(input: CreateBookingInput): Promise<Schedule>;
  listBookingsByUser(userId: number, role: string, range?: BookingDateRange): Promise<Schedule[]>;
  findBlockingBookingsByTeacherInRange(teacherId: number, from: Date, to: Date): Promise<Schedule[]>;
  cancelBookingByActor(bookingId: number, actorId: number): Promise<Schedule | "FORBIDDEN" | null>;
  findPendingByTeacher(teacherId: number): Promise<Schedule[]>;
  updateStatusByTeacher(
    bookingId: number,
    teacherId: number,
    nextStatus: BookingDecision,
  ): Promise<Schedule | "FORBIDDEN" | "INVALID_STATUS" | null>;
  legacyMigrateSchedule(): Promise<void>;
}
