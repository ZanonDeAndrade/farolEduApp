import api from "./api";

export async function registerTeacher(p: {name: string; email: string; password: string}) {
  const { data } = await api.post("/api/professors/register", p);
  return data; // {id,name,email,role}
}

export async function loginTeacher(p: {email: string; password: string}) {
  const { data } = await api.post("/api/professors/login", p);
  // { message, token, teacher: {...} }
  localStorage.setItem("token", data.token);
  localStorage.setItem("profile", JSON.stringify(data.teacher));
  return data;
}

// Se seu backend tem endpoints de usuários (alunos):
export async function registerStudent(p: {name: string; email: string; password: string}) {
  const { data } = await api.post("/api/users/register", p);
  return data;
}

export async function loginStudent(p: {email: string; password: string}) {
  const { data } = await api.post("/api/users/login", p);
  localStorage.setItem("token", data.token);
  localStorage.setItem("profile", JSON.stringify(data.user || data.student || data.teacher || {}));
  return data;
}
