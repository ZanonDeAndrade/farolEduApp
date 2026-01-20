import { createBooking, listBookingsByUser } from "./bookingModel";

// Legacy shim to preserve old imports/names
export const createSchedule = (data: { studentId: number; offerId: number; startTime: Date; notes?: string | null }) =>
  createBooking({ studentId: data.studentId, offerId: data.offerId, startTime: data.startTime, notes: data.notes });

export const getSchedulesByUser = (userId: number, role: string, range?: { from?: Date; to?: Date }) =>
  listBookingsByUser(userId, role, range);
