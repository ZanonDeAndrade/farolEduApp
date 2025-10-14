import { StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/colors';

const sectionBase = {
  position: 'relative' as const,
  paddingHorizontal: 24,
  paddingTop: 36,
  paddingBottom: 48,
};

const gradientFill = {
  position: 'absolute' as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const cardShell = {
  borderRadius: 28,
  overflow: 'hidden' as const,
  shadowColor: 'rgba(15, 23, 42, 0.14)',
  shadowOpacity: 1,
  shadowRadius: 28,
  shadowOffset: { width: 0, height: 18 },
  elevation: 10,
};

const copyColumn = {
  flex: 1,
  minWidth: 280,
  gap: 20,
};

const visualColumn = {
  flex: 1,
  minWidth: 240,
  justifyContent: 'center' as const,
};

const fieldBase = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 12,
  borderRadius: 16,
  paddingHorizontal: 16,
  paddingVertical: 14,
  backgroundColor: 'rgba(255,255,255,0.92)',
  borderWidth: 1,
  borderColor: COLORS.borderSoft,
};

export const heroStyles = StyleSheet.create({
  section: sectionBase,
  container: sectionBase,
  sectionGradient: gradientFill,
  cardWrapper: cardShell,
  card: cardShell,
  cardBackground: gradientFill,
  cardContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 28,
    padding: 28,
  },
  copyColumn,
  copy: copyColumn,
  visualColumn,
  heroVisual: visualColumn,
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  eyebrowText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accentHighlight,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.heading,
    lineHeight: 34,
  },
  titleHighlight: {
    color: COLORS.accentWarmAlt,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSubtle,
  },
  highlightList: {
    gap: 12,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highlightIcon: {
    width: 34,
    height: 34,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.heading,
    fontWeight: '500',
  },
  form: {
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  heroForm: {
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  field: fieldBase,
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.heading,
  },
  submitWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(249, 115, 22, 0.26)',
    shadowOpacity: 1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chipTouchable: {
    borderRadius: 999,
  },
  chipFill: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
  },
  chipFillActive: {
    borderColor: 'transparent',
  },
  chipFillInactive: {
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.chipBackground,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accentPrimary,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  visualCard: {
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  visualImage: {
    width: '100%',
    height: 280,
  },
});
