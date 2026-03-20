import api from "./api";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "REJECTED"
  | "ACEITO"
  | "RECUSADO"
  | "AGUARDANDO_PROFESSOR";

export interface Booking {
  id: number;
  offerId?: number | null;
  studentId: number;
  teacherId: number;
  date: string;
  startTime: string;
  endTime: string;
  startAtUtc: string;
  endAtUtc: string;
  status: BookingStatus;
  notes?: string | null;
  createdAt: string;
  respondedAt?: string | null;
  updatedAt?: string;
  teacher?: {
    id: number;
    name: string;
    email: string;
  };
  student?: {
    id: number;
    name: string;
    email: string;
  };
  offer?: {
    id: number;
    title: string;
    subject?: string | null;
    modality: string;
    durationMinutes: number;
  } | null;
}

export interface CreateBookingPayload {
  offerId: number;
  date: string;
  startTime: string;
  notes?: string;
}

export async function fetchMyBookings(params?: { from?: string; to?: string }) {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const suffix = search.toString() ? `?${search.toString()}` : "";
  const { data } = await api.get<Booking[]>(`/api/bookings/me${suffix}`);
  return data;
}

export async function createBooking(payload: CreateBookingPayload) {
  const { data } = await api.post<Booking>("/api/bookings", payload);
  return data;
}

export async function cancelBooking(id: number) {
  const { data } = await api.patch<Booking>(`/api/bookings/${id}/cancel`);
  return data;
}
