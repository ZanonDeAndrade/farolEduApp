export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  TeacherDashboard: undefined;
  SearchProfessors: undefined;
  ProfessorDetail: {
    teacherId: number;
  };
  Schedule: {
    teacherId: number;
    teacherName?: string;
  };
  ScheduledClasses: undefined;
};
