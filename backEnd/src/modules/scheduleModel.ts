import { createBooking, listBookingsByUser } from "./bookingModel";

// Legacy shim to preserve old imports/names
export const createSchedule = (data: {
  studentId: number;
  offerId: number;
  date: string;
  startTime: string;
  notes?: string | null;
}) =>
  createBooking({
    studentId: data.studentId,
    offerId: data.offerId,
    date: data.date,
    startTime: data.startTime,
    notes: data.notes,
  });

export const getSchedulesByUser = (userId: number, role: string, range?: { from?: Date; to?: Date }) =>
  listBookingsByUser(userId, role, range);
