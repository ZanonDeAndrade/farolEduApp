import api from "./api";
import type { Booking } from "./bookings";

export interface TeacherClassPayload {
  title: string;
  description?: string;
  subject?: string;
  modality?: string;
  durationMinutes?: number;
  price?: number;
  priceCents?: number;
  location?: string;
  active?: boolean;
}

export interface TeacherClassResponse {
  id: number;
  teacherId: number;
  title: string;
  description?: string | null;
  subject?: string | null;
  modality: string;
  durationMinutes: number;
  price?: number | null;
  priceCents?: number | null;
  location?: string | null;
  active?: boolean;
  startTime?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TeacherScheduleResponse = Booking;

export async function createTeacherClass(payload: TeacherClassPayload) {
  const { data } = await api.post<TeacherClassResponse>("/api/offers", payload);
  return data;
}

export async function updateTeacherClass(id: number, payload: Partial<TeacherClassPayload>) {
  const { data } = await api.patch<TeacherClassResponse>(`/api/offers/${id}`, payload);
  return data;
}

export async function fetchTeacherClasses() {
  const { data } = await api.get<TeacherClassResponse[]>("/api/offers");
  return data;
}

export async function fetchTeacherSchedules(params?: { from?: string; to?: string }) {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const suffix = search.toString() ? `?${search.toString()}` : "";
  const { data } = await api.get<TeacherScheduleResponse[]>(`/api/bookings/me${suffix}`);
  return data;
}

export interface PublicTeacherClassResponse extends TeacherClassResponse {
  teacher: {
    id: number | null;
    name: string | null;
    email: string | null;
    photoUrl?: string | null;
    profile: {
      city: string | null;
      region: string | null;
      experience: string | null;
      profilePhoto: string | null;
    } | null;
  } | null;
}

export interface PublicTeacherClassQuery {
  q?: string;
  city?: string;
  modality?: string;
  take?: number;
  teacherId?: number;
  teacherName?: string;
}

export async function fetchPublicTeacherClasses(query?: PublicTeacherClassQuery) {
  const params = new URLSearchParams();
  if (query?.q) params.set("q", query.q);
  if (query?.city) params.set("city", query.city);
  if (query?.modality) params.set("modality", query.modality);
  if (query?.take) params.set("take", String(query.take));
  if (query?.teacherId) params.set("teacherId", String(query.teacherId));
  if (query?.teacherName) params.set("teacherName", query.teacherName);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const url = `/api/offers/public${suffix}`;
  const { data } = await api.get<PublicTeacherClassResponse[]>(url);
  return data;
}
