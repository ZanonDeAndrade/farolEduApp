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

export async function registerStudent(p: { name: string; email: string; password: string }) {
  const body = { name: p.name.trim(), email: p.email.trim().toLowerCase(), password: p.password };
  console.log("REGISTER_STUDENT_REQ", { ...body, password: `len=${body.password.length}` });
  const { data } = await api.post("/api/users/register", body);
  return data;
}

export async function login(p: { email: string; password: string }) {
  const body = { email: p.email.trim().toLowerCase(), password: p.password };
  console.log("LOGIN_REQ", { ...body, password: `len=${body.password.length}` });
  const { data } = await api.post("/api/auth/login", body);
  const profileRaw = data.user || data.teacher || data.student || {};
  const roleLower = (profileRaw.roleRaw ?? profileRaw.role ?? "").toLowerCase();
  const profile = { ...profileRaw, role: roleLower };

  localStorage.setItem("token", data.token);
  localStorage.setItem("profile", JSON.stringify(profile));
  window.dispatchEvent(new Event("faroledu-auth-change"));
  console.log("LOGIN_OK", { id: profile?.id, role: profile?.role });
  return { ...data, user: profile };
}
