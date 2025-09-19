// Mock data for development and testing

import type { Teacher } from '../types/teacher';
import type { User } from '../hooks/useAuth';

/**
 * Mock teachers data
 */
export const mockTeachers: Teacher[] = [
  {
    id: '1',
    name: 'Ana Souza',
    subject: 'Matemática',
    level: 'Ensino Médio',
    description: 'Especialista em Álgebra e Geometria com 10 anos de experiência',
    image: '/images/teacher-profiles/ana-souza.jpg',
    profileUrl: '/professor/ana-souza'
  },
  {
    id: '2',
    name: 'Carlos Lima',
    subject: 'Inglês',
    description: 'Professor certificado com fluência nativa',
    image: '/images/teacher-profiles/carlos-lima.jpg',
    profileUrl: '/professor/carlos-lima'
  },
  {
    id: '3',
    name: 'Joana Pereira',
    subject: 'Música',
    description: 'Professora de piano e teoria musical',
    image: '/images/teacher-profiles/joana-pereira.jpg',
    profileUrl: '/professor/joana-pereira'
  },
  {
    id: '4',
    name: 'Roberto Silva',
    subject: 'Física',
    level: 'Ensino Médio e Superior',
    description: 'Doutor em Física com foco em mecânica quântica',
    image: '/images/teacher-profiles/roberto-silva.jpg',
    profileUrl: '/professor/roberto-silva'
  },
  {
    id: '5',
    name: 'Maria Santos',
    subject: 'Português',
    level: 'Fundamental e Médio',
    description: 'Especialista em literatura brasileira e redação',
    image: '/images/teacher-profiles/maria-santos.jpg',
    profileUrl: '/professor/maria-santos'
  },
  {
    id: '6',
    name: 'Pedro Oliveira',
    subject: 'Química',
    level: 'Ensino Médio',
    description: 'Professor com 15 anos de experiência em química orgânica',
    image: '/images/teacher-profiles/pedro-oliveira.jpg',
    profileUrl: '/professor/pedro-oliveira'
  }
];

/**
 * Mock users data
 */
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    role: 'student',
    avatar: '/images/avatars/joao.jpg',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Ana Souza',
    email: 'ana@example.com',
    role: 'teacher',
    avatar: '/images/teacher-profiles/ana-souza.jpg',
    createdAt: '2024-01-10T08:00:00Z'
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@faroledu.com',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

/**
 * Mock subjects for search suggestions
 */
export const mockSubjects = [
  'Matemática',
  'Português',
  'Inglês',
  'Física',
  'Química',
  'Biologia',
  'História',
  'Geografia',
  'Filosofia',
  'Sociologia',
  'Música',
  'Artes',
  'Educação Física',
  'Informática',
  'Espanhol',
  'Francês'
];

/**
 * Mock teaching levels
 */
export const mockLevels = [
  'Ensino Fundamental I',
  'Ensino Fundamental II',
  'Ensino Médio',
  'Pré-vestibular',
  'Ensino Superior',
  'Pós-graduação',
  'Concursos',
  'Idiomas',
  'Técnico'
];

/**
 * Mock testimonials
 */
export const mockTestimonials = [
  {
    id: '1',
    studentName: 'Lucas Martins',
    teacherName: 'Ana Souza',
    subject: 'Matemática',
    rating: 5,
    comment: 'Excelente professora! Me ajudou muito a entender álgebra.',
    date: '2024-02-15'
  },
  {
    id: '2',
    studentName: 'Carla Ferreira',
    teacherName: 'Carlos Lima',
    subject: 'Inglês',
    rating: 5,
    comment: 'Aulas dinâmicas e professor muito paciente.',
    date: '2024-02-10'
  },
  {
    id: '3',
    studentName: 'Rafael Costa',
    teacherName: 'Joana Pereira',
    subject: 'Música',
    rating: 4,
    comment: 'Aprendi muito sobre teoria musical. Recomendo!',
    date: '2024-02-08'
  }
];

/**
 * Mock lesson formats
 */
export const mockLessonFormats = [
  {
    id: 'online',
    name: 'Online',
    description: 'Aulas por videoconferência',
    icon: '💻'
  },
  {
    id: 'presential',
    name: 'Presencial',
    description: 'Aulas no local do professor ou aluno',
    icon: '🏠'
  },
  {
    id: 'hybrid',
    name: 'Híbrido',
    description: 'Combinação de online e presencial',
    icon: '🔄'
  }
];

/**
 * Mock pricing plans
 */
export const mockPricingPlans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 0,
    features: [
      'Perfil de professor',
      'Até 5 alunos',
      'Suporte por email'
    ],
    popular: false
  },
  {
    id: 'pro',
    name: 'Profissional',
    price: 29.90,
    features: [
      'Perfil destacado',
      'Alunos ilimitados',
      'Agendamento automático',
      'Relatórios detalhados',
      'Suporte prioritário'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 59.90,
    features: [
      'Todos os recursos Pro',
      'Marketing personalizado',
      'Integração com calendário',
      'API personalizada',
      'Suporte 24/7'
    ],
    popular: false
  }
];

/**
 * Mock frequently asked questions
 */
export const mockFAQs = [
  {
    id: '1',
    question: 'Como funciona o FarolEdu?',
    answer: 'O FarolEdu conecta alunos e professores de forma simples. Os professores criam perfis com suas especialidades e os alunos podem buscar e entrar em contato diretamente.'
  },
  {
    id: '2',
    question: 'Como posso me cadastrar como professor?',
    answer: 'Basta clicar em "Oferecer Aula" na página inicial, preencher seus dados, especialidades e criar seu perfil. É rápido e gratuito!'
  },
  {
    id: '3',
    question: 'As aulas são pagas?',
    answer: 'O FarolEdu não cobra pelas aulas. Os valores são acordados diretamente entre professor e aluno. Nossa plataforma apenas facilita o encontro.'
  },
  {
    id: '4',
    question: 'Posso dar aulas online e presenciais?',
    answer: 'Sim! Você pode escolher oferecer aulas online, presenciais ou ambas as modalidades em seu perfil.'
  },
  {
    id: '5',
    question: 'Como entro em contato com um professor?',
    answer: 'Cada perfil de professor tem um botão "Ver Aula" que leva para a página com informações de contato e agendamento.'
  }
];