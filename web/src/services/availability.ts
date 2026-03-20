import api from "./api";

export type Availability = {
  id: string;
  teacherId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
};

export type AvailabilityPayload = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
};

export async function fetchMyAvailability() {
  const { data } = await api.get<Availability[]>("/api/availability/me");
  return data;
}

export async function createAvailability(payload: AvailabilityPayload) {
  const { data } = await api.post<Availability>("/api/availability", payload);
  return data;
}

export async function deleteAvailability(id: string) {
  await api.delete(`/api/availability/${id}`);
}

export async function fetchTeacherAvailableSlots(
  teacherId: number,
  date: string,
  options?: { offerId?: number },
) {
  const search = new URLSearchParams({ date });
  if (options?.offerId) {
    search.set("offerId", String(options.offerId));
  }

  const { data } = await api.get<string[]>(
    `/api/teachers/${teacherId}/available-slots?${search.toString()}`,
  );
  return data;
}
