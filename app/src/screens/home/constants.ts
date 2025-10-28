import type { SearchFilters, Teacher } from './types';

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
  nearby: true,
  online: false,
};

export const ABOUT_STATS = [
  { value: '35 mil+', label: 'alunos impactados' },
  { value: '2.800', label: 'professores cadastrados' },
  { value: '120', label: 'cidades com aulas' },
] as const;

export const TEACHERS: Teacher[] = [
  {
    id: '1',
    name: 'Ana Souza',
    subject: 'Matemática',
    level: 'Ensino Médio',
    city: 'São Paulo · SP',
    modalities: ['presencial', 'online'],
    distanceKm: 4,
  },
  {
    id: '2',
    name: 'Carlos Lima',
    subject: 'Inglês',
    description: 'Conversação e exames',
    city: 'Recife · PE',
    modalities: ['online'],
  },
  {
    id: '3',
    name: 'Joana Pereira',
    subject: 'Música',
    description: 'Violão e teoria musical',
    city: 'Curitiba · PR',
    modalities: ['presencial'],
    distanceKm: 8,
  },
  {
    id: '4',
    name: 'Luiz Fernando',
    subject: 'Física',
    level: 'Pré-vestibular',
    city: 'Campinas · SP',
    modalities: ['presencial', 'online'],
    distanceKm: 20,
  },
  {
    id: '5',
    name: 'Marina Costa',
    subject: 'Programação',
    description: 'JavaScript, React e lógica',
    city: 'Online',
    modalities: ['online'],
  },
];
