import api from "./api";

export interface PublicTeacherClass {
  id: number;
  title: string;
  subject?: string | null;
  description?: string | null;
  modality: string;
  durationMinutes: number;
  price?: number | null;
  priceCents?: number | null;
  location?: string | null;
  active?: boolean;
}

export interface PublicTeacherProfile {
  city: string | null;
  region: string | null;
  experience: string | null;
  profilePhoto: string | null;
  phone?: string | null;
}

export interface PublicTeacherResponse {
  id: number;
  name: string;
  email?: string | null;
  photoUrl?: string | null;
  teacherProfile?: PublicTeacherProfile | null;
  teacherClasses?: PublicTeacherClass[]; // API pode retornar teacherClasses
  classes?: PublicTeacherClass[];
}

export async function fetchPublicTeacher(id: number) {
  const { data } = await api.get<PublicTeacherResponse>(`/api/professors/public/${id}`);
  return data;
}
