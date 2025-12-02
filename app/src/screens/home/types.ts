export type SectionKey = 'inicio' | 'aulas' | 'sobre' | 'oferecer-aula' | 'rodape';

export type TeacherClassPreview = {
  id: number;
  teacherId?: number | null;
  title: string;
  subject?: string | null;
  description?: string | null;
  modality: string;
  price?: number | null;
  teacherName?: string | null;
  city?: string | null;
};

export type SearchFilters = {
  subject: string;
  location: string;
  nearby: boolean;
  online: boolean;
};
