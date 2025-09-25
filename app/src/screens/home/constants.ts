import type { Teacher } from './types';

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
  },
  {
    id: '2',
    name: 'Carlos Lima',
    subject: 'Inglês',
    description: 'Conversação e exames',
  },
  {
    id: '3',
    name: 'Joana Pereira',
    subject: 'Música',
    description: 'Violão e teoria musical',
  },
];
