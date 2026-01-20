import type { NavigatorScreenParams } from '@react-navigation/native';

export type SearchProfessorsParams = {
  q?: string;
};

export type ScheduleParams = {
  offerId: number;
  teacherId: number;
  teacherName?: string;
  offerTitle?: string;
  durationMinutes?: number;
};

export type StudentStackParamList = {
  StudentHome: undefined;
  SearchProfessors: SearchProfessorsParams | undefined;
  ProfessorDetail: {
    teacherId: number;
  };
  Schedule: ScheduleParams;
  ScheduledClasses: undefined;
  Calendar: undefined;
};

export type RootStackParamList = {
  Home: undefined;
  StudentHome: NavigatorScreenParams<StudentStackParamList> | undefined;
  Login: undefined;
  Register: undefined;
  TeacherDashboard: undefined;
  SearchProfessors: SearchProfessorsParams | undefined;
  ProfessorDetail: {
    teacherId: number;
  };
  Schedule: ScheduleParams;
  ScheduledClasses: undefined;
  Calendar: undefined;
};
