import { apiRequest } from './apiClient';

export type SchedulePayload = {
  teacherId: number;
  date: string; // ISO string
};

export type Schedule = {
  id: number;
  studentId: number;
  teacherId: number;
  date: string;
  createdAt: string;
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
};

export const createSchedule = async (token: string, payload: SchedulePayload) => {
  return apiRequest<Schedule>('/api/schedules', {
    method: 'POST',
    token,
    body: payload,
  });
};

export const fetchSchedules = async (token: string) => {
  return apiRequest<Schedule[]>('/api/schedules', {
    token,
  });
};
