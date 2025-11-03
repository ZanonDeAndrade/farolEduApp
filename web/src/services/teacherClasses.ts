import api from "./api";

export interface TeacherClassPayload {
  title: string;
  description?: string;
  subject?: string;
  modality?: string;
  startTime?: string;
  durationMinutes?: number;
  price?: number;
}

export interface TeacherClassResponse {
  id: number;
  teacherId: number;
  title: string;
  description?: string | null;
  subject?: string | null;
  modality: string;
  startTime?: string | null;
  durationMinutes: number;
  price?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherScheduleResponse {
  id: number;
  studentId: number;
  teacherId: number;
  date: string;
  createdAt: string;
  student?: {
    id: number;
    name: string;
    email: string;
  };
}

export async function createTeacherClass(payload: TeacherClassPayload) {
  const { data } = await api.post<TeacherClassResponse>("/api/teacher-classes", payload);
  return data;
}

export async function fetchTeacherClasses() {
  const { data } = await api.get<TeacherClassResponse[]>("/api/teacher-classes");
  return data;
}

export async function fetchTeacherSchedules() {
  const { data } = await api.get<TeacherScheduleResponse[]>("/api/schedules");
  return data;
}

export interface PublicTeacherClassResponse extends TeacherClassResponse {
  teacher: {
    id: number | null;
    name: string | null;
    email: string | null;
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
}

export async function fetchPublicTeacherClasses(query?: PublicTeacherClassQuery) {
  const params = new URLSearchParams();
  if (query?.q) params.set("q", query.q);
  if (query?.city) params.set("city", query.city);
  if (query?.modality) params.set("modality", query.modality);
  if (query?.take) params.set("take", String(query.take));
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const { data } = await api.get<PublicTeacherClassResponse[]>(`/api/teacher-classes/public${suffix}`);
  return data;
}
