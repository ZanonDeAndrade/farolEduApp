import { StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/colors';

export const teacherStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 24,
  },
  copy: {
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
    color: COLORS.accentSecondary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.heading,
  },
  titleHighlight: {
    color: COLORS.accentWarmAlt,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.text,
  },
  highlights: {
    gap: 12,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highlightText: {
    fontSize: 14,
    color: COLORS.heading,
  },
  highlightBadge: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  ctaWrapper: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: 'rgba(249, 115, 22, 0.25)',
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  cta: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: 20,
    shadowColor: 'rgba(15, 23, 42, 0.14)',
    shadowOpacity: 1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  cardAvatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardAvatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.heading,
  },
  cardSubject: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  cardBody: {
    gap: 12,
  },
  cardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardStatText: {
    fontSize: 14,
    color: COLORS.heading,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSubtle,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.accentWarmAlt,
  },
  cardPriceCaption: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  cardButtonWrapper: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: 'rgba(124, 58, 237, 0.24)',
    shadowOpacity: 1,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  cardButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  cardButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});
