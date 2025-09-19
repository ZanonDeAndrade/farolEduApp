// Application constants
export const APP_NAME = 'FarolEdu';
export const APP_DESCRIPTION = 'Conectamos alunos e professores em qualquer lugar do Brasil';

// Navigation items
export const NAV_ITEMS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Oferecer Aula', href: '#oferecer-aula' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Contato', href: '#contato' }
] as const;

// Social media links
export const SOCIAL_LINKS = {
  facebook: '#',
  twitter: '#',
  linkedin: '#'
} as const;

// Form validation
export const FORM_VALIDATION = {
  name: {
    minLength: 2,
    maxLength: 50
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  message: {
    minLength: 10,
    maxLength: 500
  }
} as const;