// src/services/auth.ts
import api from "./api";

export type AuthProvider = "EMAIL" | "GOOGLE" | "FACEBOOK";

export interface TeacherRegistrationPayload {
  name: string;
  email: string;
  password: string;
  authProvider: AuthProvider;
  authProviderId?: string;
  phone: string;
  city: string;
  region?: string;
  experience?: string;
  profilePhoto?: string;
  wantsToAdvertise?: boolean;
}

export async function registerTeacher(p: TeacherRegistrationPayload) {
  const body: TeacherRegistrationPayload = {
    ...p,
    name: p.name.trim(),
    email: p.email.trim().toLowerCase(),
    password: p.password,
    phone: p.phone.trim(),
    city: p.city.trim(),
    region: p.region?.trim() || undefined,
    experience: p.experience?.trim() || undefined,
    profilePhoto: p.profilePhoto,
    wantsToAdvertise: Boolean(p.wantsToAdvertise),
  };

  const debugLog = {
    name: body.name,
    email: body.email,
    authProvider: body.authProvider,
    hasProfilePhoto: Boolean(body.profilePhoto),
  };
  console.log("REGISTER_TEACHER_REQ", {
    ...debugLog,
    password: `len=${body.password.length}`,
  });

  const { data } = await api.post("/api/professors/register", body);
  return data;
}

export async function loginTeacher(p: { email: string; password: string }) {
  const body = { email: p.email.trim().toLowerCase(), password: p.password };
  console.log("LOGIN_TEACHER_REQ", { ...body, password: `len=${body.password.length}` });
  const { data } = await api.post("/api/professors/login", body);
  localStorage.setItem("token", data.token);
  localStorage.setItem("profile", JSON.stringify(data.teacher));
  window.dispatchEvent(new Event("faroledu-auth-change"));
  console.log("LOGIN_TEACHER_OK", { id: data.teacher?.id, role: data.teacher?.role });
  return data;
}

export async function registerStudent(p: { name: string; email: string; password: string }) {
  const body = { name: p.name.trim(), email: p.email.trim().toLowerCase(), password: p.password };
  console.log("REGISTER_STUDENT_REQ", { ...body, password: `len=${body.password.length}` });
  const { data } = await api.post("/api/users/register", body);
  return data;
}

export async function loginStudent(p: { email: string; password: string }) {
  const body = { email: p.email.trim().toLowerCase(), password: p.password };
  console.log("LOGIN_STUDENT_REQ", { ...body, password: `len=${body.password.length}` });
  const { data } = await api.post("/api/users/login", body);
  localStorage.setItem("token", data.token);
  localStorage.setItem("profile", JSON.stringify(data.user || data.student || {}));
  window.dispatchEvent(new Event("faroledu-auth-change"));
  console.log("LOGIN_STUDENT_OK", { id: data.user?.id, role: data.user?.role });
  return data;
}
