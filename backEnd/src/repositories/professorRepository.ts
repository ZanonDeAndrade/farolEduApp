import { TeacherClass, TeacherProfile, TeacherWithClasses, TeacherWithProfile, User } from "./models";

type AuthProviderValue = "EMAIL" | "GOOGLE" | "FACEBOOK" | string;

export interface CreateTeacherWithProfileInput {
  name: string;
  email: string;
  password: string;
  authProvider: AuthProviderValue;
  authProviderId?: string | null;
  profile: {
    phone: string;
    city: string;
    region?: string | null;
    experience?: string | null;
    profilePhoto?: string | null;
    wantsToAdvertise?: boolean;
    advertisesFromHome?: boolean;
    advertisesTravel?: boolean;
    advertisesOnline?: boolean;
  };
}

export interface IProfessorRepository {
  createTeacherWithProfile(data: CreateTeacherWithProfileInput): Promise<TeacherWithProfile>;
  getAllTeachers(): Promise<Array<User & { teacherProfile: TeacherProfile | null }>>;
  getTeacherById(id: number): Promise<User & { teacherProfile: TeacherProfile | null } | null>;
  getUserByEmailWithPassword(email: string): Promise<User & { teacherProfile: TeacherProfile | null } | null>;
  getTeacherWithClasses(id: number): Promise<TeacherWithClasses | null>;
}
