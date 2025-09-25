import { StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/colors';

export const aboutStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 28,
  },
  intro: {
    gap: 16,
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  eyebrowText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.accentPrimary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.heading,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.text,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stat: {
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: 'rgba(148, 163, 184, 0.2)',
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accentPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  cards: {
    gap: 16,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    shadowColor: 'rgba(15, 23, 42, 0.12)',
    shadowOpacity: 1,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.heading,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSubtle,
    lineHeight: 20,
  },
});
