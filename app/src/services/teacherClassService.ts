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
  priceCents?: number | null;
  location?: string | null;
  active?: boolean;
  startTime?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TeacherSchedule = {
  id: number;
  studentId: number;
  teacherId: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  status: string;
  notes?: string | null;
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
  priceCents?: number | null;
  location?: string | null;
  active?: boolean;
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
  priceCents?: number;
  location?: string;
  active?: boolean;
};

export type UpdateTeacherClassPayload = Partial<CreateTeacherClassPayload>;

export type PublicTeacherClassQuery = {
  q?: string;
  city?: string;
  modality?: string;
  take?: number;
  teacherId?: number;
  teacherName?: string;
};

export const fetchTeacherClasses = async (token: string) => {
  return apiRequest<TeacherClass[]>('/api/offers', { token });
};

export const fetchTeacherSchedules = async (token: string) => {
  return apiRequest<TeacherSchedule[]>('/api/bookings/me', { token });
};

export const createTeacherClass = async (token: string, payload: CreateTeacherClassPayload) => {
  return apiRequest<TeacherClass>('/api/offers', {
    method: 'POST',
    token,
    body: payload,
  });
};

export const updateTeacherClass = async (token: string, id: number, payload: UpdateTeacherClassPayload) => {
  return apiRequest<TeacherClass>(`/api/offers/${id}`, {
    method: 'PATCH',
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
  if (query?.teacherId) params.set('teacherId', String(query.teacherId));
  if (query?.teacherName) params.set('teacherName', query.teacherName);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<PublicTeacherClass[]>(`/api/offers/public${suffix}`);
};
