import { apiRequest } from './apiClient';

export type TeacherClass = {
  id: number;
  teacherId: number;
  title: string;
  description?: string | null;
  subject?: string | null;
  modality: string;
  durationMinutes: number;
  price?: string | null;
  startTime?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TeacherSchedule = {
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
};

export type PublicTeacherClass = {
  id: number;
  teacherId: number;
  title: string;
  subject?: string | null;
  description?: string | null;
  modality: string;
  durationMinutes: number;
  price?: number | null;
  createdAt: string;
  updatedAt: string;
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
};

export type CreateTeacherClassPayload = {
  title: string;
  subject?: string;
  description?: string;
  modality?: string;
  durationMinutes?: number;
  price?: number;
};

export type PublicTeacherClassQuery = {
  q?: string;
  city?: string;
  modality?: string;
  take?: number;
};

export const fetchTeacherClasses = async (token: string) => {
  return apiRequest<TeacherClass[]>('/api/teacher-classes', { token });
};

export const fetchTeacherSchedules = async (token: string) => {
  return apiRequest<TeacherSchedule[]>('/api/schedules', { token });
};

export const createTeacherClass = async (token: string, payload: CreateTeacherClassPayload) => {
  return apiRequest<TeacherClass>('/api/teacher-classes', {
    method: 'POST',
    token,
    body: payload,
  });
};

export const fetchPublicTeacherClasses = async (query?: PublicTeacherClassQuery) => {
  const params = new URLSearchParams();
  if (query?.q) params.set('q', query.q);
  if (query?.city) params.set('city', query.city);
  if (query?.modality) params.set('modality', query.modality);
  if (query?.take) params.set('take', String(query.take));
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<PublicTeacherClass[]>(`/api/teacher-classes/public${suffix}`);
};
