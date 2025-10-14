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
}) => {
  const body = {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
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
