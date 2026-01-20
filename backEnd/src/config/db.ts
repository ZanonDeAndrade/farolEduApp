export type UserRecord = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  authProvider: string;
  authProviderId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TeacherProfileRecord = {
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
};

export type TeacherClassRecord = {
  id: number;
  teacherId: number;
  title: string;
  description: string | null;
  subject: string | null;
  modality: string;
  startTime: Date | null;
  durationMinutes: number;
  price: number | null;
  priceCents: number | null;
  location: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ScheduleRecord = {
  id: number;
  offerId: number | null;
  studentId: number;
  teacherId: number;
  startTime: Date;
  endTime: Date;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  legacyDate?: Date | null;
};

type DbState = {
  users: UserRecord[];
  teacherProfiles: TeacherProfileRecord[];
  teacherClasses: TeacherClassRecord[];
  schedules: ScheduleRecord[];
};

const initialState = (): DbState => ({
  users: [],
  teacherProfiles: [],
  teacherClasses: [],
  schedules: [],
});

const idCounters = {
  user: 1,
  teacherProfile: 1,
  teacherClass: 1,
  schedule: 1,
};

export const memoryDb: DbState = initialState();

export const resetMemoryDb = () => {
  memoryDb.users.length = 0;
  memoryDb.teacherProfiles.length = 0;
  memoryDb.teacherClasses.length = 0;
  memoryDb.schedules.length = 0;
  idCounters.user = 1;
  idCounters.teacherProfile = 1;
  idCounters.teacherClass = 1;
  idCounters.schedule = 1;
};

export const nextId = (key: keyof typeof idCounters) => {
  const next = idCounters[key];
  idCounters[key] += 1;
  return next;
};
