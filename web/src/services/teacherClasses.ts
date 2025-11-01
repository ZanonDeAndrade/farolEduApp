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
