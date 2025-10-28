export type SectionKey = 'inicio' | 'aulas' | 'sobre' | 'oferecer-aula' | 'rodape';

export type Teacher = {
  id: string;
  name: string;
  subject: string;
  level?: string;
  description?: string;
  city?: string;
  modalities?: Array<'online' | 'presencial'>;
  distanceKm?: number;
};

export type SearchFilters = {
  subject: string;
  location: string;
  nearby: boolean;
  online: boolean;
};
