import { apiRequest } from './apiClient';

export type StudentProfile = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type RegisterStudentResponse = StudentProfile;

export type LoginStudentResponse = {
  message?: string;
  token: string;
  user?: StudentProfile;
  student?: StudentProfile;
};

export const registerStudent = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  const body = {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  };

  return apiRequest<RegisterStudentResponse>('/api/users/register', {
    method: 'POST',
    body,
  });
};

export const loginStudent = async (payload: { email: string; password: string }) => {
  const body = {
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  };

  return apiRequest<LoginStudentResponse>('/api/users/login', {
    method: 'POST',
    body,
  });
};
