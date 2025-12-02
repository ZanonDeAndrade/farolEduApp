import { apiRequest } from './apiClient';

export type TeacherProfile = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type RegisterTeacherResponse = TeacherProfile;

export type LoginTeacherResponse = {
  message?: string;
  token: string;
  teacher?: TeacherProfile;
  user?: TeacherProfile;
};

export const registerTeacher = async (payload: {
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  experience?: string;
}) => {
  const body = {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    phone: payload.phone.trim(),
    city: payload.city.trim(),
    region: payload.city.trim(),
    experience: payload.experience?.trim() || undefined,
  };

  return apiRequest<RegisterTeacherResponse>('/api/professors/register', {
    method: 'POST',
    body,
  });
};

export const loginTeacher = async (payload: { email: string; password: string }) => {
  const body = {
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  };

  return apiRequest<LoginTeacherResponse>('/api/professors/login', {
    method: 'POST',
    body,
  });
};

export type PublicTeacher = {
  id: number;
  name: string;
  email: string;
  role: string;
  teacherProfile?: {
    city?: string | null;
    region?: string | null;
    experience?: string | null;
    phone?: string | null;
  } | null;
  classes?: {
    id: number;
    title: string;
    subject?: string | null;
    description?: string | null;
    modality: string;
    price?: number | null;
    durationMinutes: number;
  }[];
};

export const fetchPublicTeacher = async (teacherId: number) => {
  return apiRequest<PublicTeacher>(`/api/professors/public/${teacherId}`);
};
