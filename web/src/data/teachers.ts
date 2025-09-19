import type { Teacher } from '../types/teacher';

export const teachers: Teacher[] = [
  {
    id: '1',
    name: 'Ana Souza',
    subject: 'Matemática',
    level: 'Ensino Médio',
    image: '/images/teacher-profiles/ana-souza.jpg',
    profileUrl: '/professor/ana-souza'
  },
  {
    id: '2',
    name: 'Carlos Lima',
    subject: 'Inglês',
    description: 'Prof. Carlos Lima',
    image: '/images/teacher-profiles/carlos-lima.jpg',
    profileUrl: '/professor/carlos-lima'
  },
  {
    id: '3',
    name: 'Joana Pereira',
    subject: 'Música',
    description: 'Prof. Joana Ferreira',
    image: '/images/teacher-profiles/joana-pereira.jpg',
    profileUrl: '/professor/joana-pereira'
  }
];