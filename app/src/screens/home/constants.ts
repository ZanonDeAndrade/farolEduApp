import type { SearchFilters } from './types';

export const HERO_COPY = {
  eyebrow: 'Aprendizado iluminado por bons encontros',
  titleHighlight: 'FarolEdu',
  title: 'Dê o próximo passo no seu aprendizado com o',
  subtitle:
    'Conectamos alunos e professores particulares em todo o Brasil, com aulas presenciais e online que se encaixam na sua rotina.',
  highlights: [
    'Professores em mais de 100 cidades',
    'Todas as matérias: escolar, idiomas, música e mais',
    'Aulas personalizadas para todo nível e orçamento',
  ],
  filters: {
    nearby: 'Perto de mim',
    online: 'Online',
  },
  placeholders: {
    subject: 'Busque Matemática, inglês, música...',
    location: 'Local das aulas ou online',
  },
  cta: 'Pesquisar',
};

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  subject: '',
  location: '',
  nearby: false,
  online: false,
};

export const ABOUT_STATS = [
  { value: '35 mil+', label: 'alunos impactados' },
  { value: '2.800', label: 'professores cadastrados' },
  { value: '120', label: 'cidades com aulas' },
] as const;

export const TEACHERS: never[] = [];
