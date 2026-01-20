import { apiRequest } from './apiClient';

export type SchedulePayload = {
  offerId: number;
  startTime: string; // ISO
  notes?: string;
};

export type Schedule = {
  id: number;
  offerId?: number | null;
  studentId: number;
  teacherId: number;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string | null;
  createdAt: string;
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
};

export const createSchedule = async (token: string, payload: SchedulePayload) => {
  return apiRequest<Schedule>('/api/bookings', {
    method: 'POST',
    token,
    body: payload,
  });
};

export const fetchSchedules = async (token: string, params?: { from?: string; to?: string }) => {
  const search = new URLSearchParams();
  if (params?.from) search.set('from', params.from);
  if (params?.to) search.set('to', params.to);
  const suffix = search.toString() ? `?${search.toString()}` : '';
  return apiRequest<Schedule[]>(`/api/bookings${suffix}`, {
    token,
  });
};

export const fetchMyBookings = async (token: string, params?: { from?: string; to?: string }) => {
  const search = new URLSearchParams();
  if (params?.from) search.set('from', params.from);
  if (params?.to) search.set('to', params.to);
  const suffix = search.toString() ? `?${search.toString()}` : '';
  return apiRequest<Schedule[]>(`/api/bookings/me${suffix}`, {
    token,
  });
};

export const cancelSchedule = async (token: string, bookingId: number) => {
  return apiRequest<Schedule>(`/api/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
    token,
  });
};
