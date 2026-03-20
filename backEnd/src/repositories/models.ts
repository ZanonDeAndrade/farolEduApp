export type Modality = "ONLINE" | "PRESENCIAL" | "AMBOS" | string;

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "AGUARDANDO_PROFESSOR"
  | "ACEITO"
  | "RECUSADO"
  | "ACCEPTED"
  | "REJECTED"
  | string;

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  photoUrl?: string | null;
  authProvider: string;
  authProviderId: string | null;
  providers?: string[];
  googleUid?: string | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherProfile {
  id: number;
  userId: number;
  phone: string;
  city: string;
  region: string | null;
  experience: string | null;
  profilePhoto: string | null;
  advertisesFromHome: boolean;
  advertisesTravel: boolean;
  advertisesOnline: boolean;
  wantsToAdvertise: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherClass {
  id: number;
  teacherId: number;
  title: string;
  description: string | null;
  subject: string | null;
  modality: Modality;
  startTime: Date | null;
  durationMinutes: number;
  price: number | null;
  priceCents: number | null;
  location: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: number;
  offerId: number | null;
  studentId: number;
  teacherId: number;
  date: string;
  startTime: string;
  endTime: string;
  startAtUtc: Date;
  endAtUtc: Date;
  status: BookingStatus;
  notes: string | null;
  respondedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherAvailability {
  id: string;
  teacherId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export type TeacherWithProfile = User & { teacherProfile: TeacherProfile | null };

export type TeacherWithClasses = TeacherWithProfile & { teacherClasses?: TeacherClass[] };
