// src/services/auth.ts
import api from "./api";

export async function registerTeacher(p: { name: string; email: string; password: string }) {
  const body = { name: p.name.trim(), email: p.email.trim().toLowerCase(), password: p.password };
  console.log("REGISTER_TEACHER_REQ", { ...body, password: `len=${body.password.length}` });
  const { data } = await api.post("/api/professors/register", body);
  return data;
}

export async function loginTeacher(p: { email: string; password: string }) {
  const body = { email: p.email.trim().toLowerCase(), password: p.password };
  console.log("LOGIN_TEACHER_REQ", { ...body, password: `len=${body.password.length}` });
  const { data } = await api.post("/api/professors/login", body);
  localStorage.setItem("token", data.token);
  localStorage.setItem("profile", JSON.stringify(data.teacher));
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
  console.log("LOGIN_STUDENT_OK", { id: data.user?.id, role: data.user?.role });
  return data;
}
