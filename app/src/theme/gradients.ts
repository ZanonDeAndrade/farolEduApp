import type { ColorValue } from 'react-native';

export type GradientConfig = {
  colors: readonly [ColorValue, ColorValue, ...ColorValue[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
};

export const GRADIENTS = {
  header: {
    colors: ['#FFF7F4', '#FEF4FF', '#F3F4FF'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  heroSection: {
    colors: ['#FFF6F1', '#FDF3FF', '#EEF2FF'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  heroCard: {
    colors: ['rgba(255,255,255,0.96)', 'rgba(243,232,255,0.9)'] as const,
    start: { x: 0.1, y: 0 },
    end: { x: 1, y: 1 },
  },
  heroEyebrow: {
    colors: ['rgba(251,113,133,0.2)', 'rgba(249,115,22,0.16)'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  heroForm: {
    colors: ['rgba(255,255,255,0.92)', 'rgba(248,250,252,0.86)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  heroImageCard: {
    colors: ['rgba(255,255,255,0.9)', 'rgba(238,242,255,0.82)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  heroButton: {
    colors: ['#F97316', '#FB7185'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  heroFilterActive: {
    colors: ['rgba(124,58,237,0.12)', 'rgba(20,184,166,0.18)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  availableBackground: {
    colors: ['rgba(255,247,244,0.92)', 'rgba(255,255,255,0.94)', 'rgba(243,232,255,0.9)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  availableCard: {
    colors: ['rgba(255,255,255,0.96)', 'rgba(243,232,255,0.9)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  teacherCard: {
    colors: ['rgba(124,58,237,0.12)', 'rgba(20,184,166,0.16)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  teacherButton: {
    colors: ['rgba(124, 58, 237, 0.92)', 'rgba(20, 184, 166, 0.92)'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  teacherBackground: {
    colors: ['rgba(255,246,241,0.6)', 'rgba(253,243,255,0.8)', 'rgba(238,242,255,0.9)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  buttonSecondary: {
    colors: ['#14B8A6', '#0F766E'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  teacherEyebrow: {
    colors: ['rgba(20, 184, 166, 0.12)', 'rgba(124, 58, 237, 0.12)'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  aboutBackground: {
    colors: ['rgba(255,247,244,0.85)', 'rgba(253,243,255,0.95)', 'rgba(238,242,255,0.9)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  aboutEyebrow: {
    colors: ['rgba(124,58,237,0.18)', 'rgba(124,58,237,0.08)'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  aboutCard: {
    colors: ['rgba(255,255,255,0.94)', 'rgba(243,232,255,0.88)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  aboutCardIcon: {
    colors: ['rgba(124,58,237,0.22)', 'rgba(20,184,166,0.18)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  statPill: {
    colors: ['rgba(255,255,255,0.96)', 'rgba(248,250,252,0.9)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  footer: {
    colors: ['#0F172A', '#312E81', '#581C87'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  footerSocial: {
    colors: ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.08)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  teacherAvatar: {
    colors: ['#7C3AED', '#A855F7'] as const,
    start: { x: 0, y: 0.6 },
    end: { x: 1, y: 0.4 },
  },
  heroHighlightIcon: {
    colors: ['rgba(251,113,133,0.16)', 'rgba(124,58,237,0.12)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  teacherHighlight: {
    colors: ['rgba(255,255,255,0.86)', 'rgba(243,232,255,0.82)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  headerButtonWarm: {
    colors: ['#F97316', '#FB7185'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  headerButtonGhost: {
    colors: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} satisfies Record<string, GradientConfig>;

export type GradientName = keyof typeof GRADIENTS;
