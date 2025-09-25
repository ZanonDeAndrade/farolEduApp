export type SectionKey = 'inicio' | 'sobre' | 'oferecer-aula' | 'rodape';

export type Teacher = {
  id: string;
  name: string;
  subject: string;
  level?: string;
  description?: string;
};
