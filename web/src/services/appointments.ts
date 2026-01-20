import api from "./api";
import type { TeacherScheduleResponse } from "./teacherClasses";

// Retorna agendamentos pendentes para o professor logado
export async function fetchPendingAppointments() {
  const { data } = await api.get<TeacherScheduleResponse[]>("/api/appointments/pending");
  return data;
}

export async function acceptAppointment(id: number) {
  const { data } = await api.post<TeacherScheduleResponse>(`/api/appointments/${id}/accept`);
  return data;
}

export async function rejectAppointment(id: number) {
  const { data } = await api.post<TeacherScheduleResponse>(`/api/appointments/${id}/reject`);
  return data;
}

