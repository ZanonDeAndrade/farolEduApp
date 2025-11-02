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

export type CreateTeacherClassPayload = {
  title: string;
  subject?: string;
  description?: string;
  modality?: string;
  durationMinutes?: number;
  price?: number;
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
