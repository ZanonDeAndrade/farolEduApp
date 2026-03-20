import { TeacherAvailability } from "./models";

export interface CreateAvailabilityInput {
  teacherId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export interface IAvailabilityRepository {
  createAvailability(input: CreateAvailabilityInput): Promise<TeacherAvailability>;
  getByTeacher(teacherId: number): Promise<TeacherAvailability[]>;
  getByTeacherAndDay(teacherId: number, dayOfWeek: number): Promise<TeacherAvailability[]>;
  deleteAvailability(id: string): Promise<boolean>;
}
