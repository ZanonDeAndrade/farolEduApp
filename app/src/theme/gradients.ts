import type { ColorValue } from 'react-native';

export type GradientConfig = {
  colors: readonly [ColorValue, ColorValue, ...ColorValue[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
};

export const GRADIENTS = {
  header: {
    colors: ['#F7F9FF', '#E9EFFF', '#D6DEFA'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  heroSection: {
    colors: ['#F7F9FF', '#E9EFFF', '#D4DDFA'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  heroCard: {
    colors: ['rgba(255,255,255,0.96)', 'rgba(230,237,255,0.88)'] as const,
    start: { x: 0.1, y: 0 },
    end: { x: 1, y: 1 },
  },
  heroEyebrow: {
    colors: ['rgba(247,232,163,0.36)', 'rgba(106,64,180,0.18)'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  heroForm: {
    colors: ['rgba(255,255,255,0.94)', 'rgba(247,249,255,0.85)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  heroImageCard: {
    colors: ['rgba(255,255,255,0.92)', 'rgba(230,237,255,0.82)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  heroButton: {
    colors: ['#6A40B4', '#8357D9'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  heroFilterActive: {
    colors: ['rgba(106,64,180,0.16)', 'rgba(183,203,245,0.38)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  availableBackground: {
    colors: ['rgba(247,249,255,0.92)', 'rgba(255,255,255,0.94)', 'rgba(230,237,255,0.9)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  availableCard: {
    colors: ['rgba(255,255,255,0.96)', 'rgba(230,237,255,0.86)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  teacherCard: {
    colors: ['rgba(106,64,180,0.18)', 'rgba(183,203,245,0.26)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  teacherButton: {
    colors: ['rgba(106, 64, 180, 0.92)', 'rgba(131, 87, 217, 0.9)'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  teacherBackground: {
    colors: ['rgba(247,249,255,0.72)', 'rgba(230,237,255,0.84)', 'rgba(212,221,250,0.9)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  buttonSecondary: {
    colors: ['#B7CBF5', '#A2BBEE'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  teacherEyebrow: {
    colors: ['rgba(247, 232, 163, 0.28)', 'rgba(106, 64, 180, 0.18)'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  aboutBackground: {
    colors: ['rgba(247,249,255,0.85)', 'rgba(230,237,255,0.94)', 'rgba(212,221,250,0.92)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  aboutEyebrow: {
    colors: ['rgba(247,232,163,0.3)', 'rgba(106,64,180,0.16)'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  aboutCard: {
    colors: ['rgba(255,255,255,0.95)', 'rgba(230,237,255,0.9)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  aboutCardIcon: {
    colors: ['rgba(106,64,180,0.22)', 'rgba(183,203,245,0.24)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  statPill: {
    colors: ['rgba(255,255,255,0.96)', 'rgba(247,249,255,0.9)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  footer: {
    colors: ['#4F2C96', '#6A40B4', '#B7CBF5'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  footerSocial: {
    colors: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.12)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  teacherAvatar: {
    colors: ['#6A40B4', '#8357D9'] as const,
    start: { x: 0, y: 0.6 },
    end: { x: 1, y: 0.4 },
  },
  heroHighlightIcon: {
    colors: ['rgba(247,232,163,0.22)', 'rgba(106,64,180,0.18)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  teacherHighlight: {
    colors: ['rgba(255,255,255,0.9)', 'rgba(230,237,255,0.86)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  headerButtonWarm: {
    colors: ['#F7E8A3', '#F1D86F'] as const,
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
