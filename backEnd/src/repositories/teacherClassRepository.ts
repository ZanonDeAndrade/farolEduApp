import { TeacherClass } from "./models";

export interface CreateTeacherClassInput {
  teacherId: number;
  title: string;
  description?: string | null;
  subject?: string | null;
  modality?: string;
  startTime?: Date | null;
  durationMinutes?: number;
  price?: number | null;
  priceCents?: number | null;
  location?: string | null;
  active?: boolean;
}

export interface PublicTeacherClassFilters {
  query?: string;
  modality?: string;
  city?: string;
  take?: number;
  teacherId?: number;
  teacherName?: string;
}

export interface ITeacherClassRepository {
  createTeacherClass(input: CreateTeacherClassInput): Promise<TeacherClass>;
  updateTeacherClassByTeacher(
    teacherId: number,
    classId: number,
    data: Partial<CreateTeacherClassInput>,
  ): Promise<TeacherClass | null>;
  deleteTeacherClassByTeacher(teacherId: number, classId: number): Promise<boolean | null>;
  getTeacherClassesByTeacher(teacherId: number): Promise<TeacherClass[]>;
  getPublicTeacherClasses(filters: PublicTeacherClassFilters): Promise<Array<TeacherClass & {
    teacher?: { id: number; name: string; email: string; photoUrl?: string | null; teacherProfile?: any | null } | null;
  }>>;
}
