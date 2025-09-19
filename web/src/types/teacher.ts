export interface Teacher {
    id: string;
    name: string;
    subject: string;
    level?: string;
    description?: string;
    image: string;
    profileUrl: string;
  }
  
  export interface TeacherCardProps {
    teacher: Teacher;
  }