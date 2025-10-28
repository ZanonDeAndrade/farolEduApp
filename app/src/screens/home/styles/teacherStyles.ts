import { StyleSheet, type ViewStyle } from 'react-native';
import { COLORS } from '../../../theme/colors';

const sectionContainer: ViewStyle = {
  paddingHorizontal: 24,
  paddingVertical: 32,
  gap: 28,
  alignItems: 'center',
};

const copyColumn: ViewStyle = {
  width: '100%',
  maxWidth: 600,
  alignSelf: 'center',
  gap: 18,
};

const highlightBadge: ViewStyle = {
  width: '100%',
  maxWidth: 560,
  borderRadius: 20,
  paddingHorizontal: 18,
  paddingVertical: 14,
  borderWidth: 1,
  borderColor: COLORS.borderSoft,
  alignSelf: 'center',
};

const cardBase: ViewStyle = {
  borderRadius: 26,
  padding: 26,
  borderWidth: 1,
  borderColor: COLORS.borderStrong,
  gap: 22,
  shadowColor: 'rgba(15, 23, 42, 0.14)',
  shadowOpacity: 1,
  shadowRadius: 28,
  shadowOffset: { width: 0, height: 16 },
  elevation: 10,
  width: '100%',
  maxWidth: 380,
  alignSelf: 'center',
};

export const teacherStyles = StyleSheet.create({
  container: sectionContainer,
  containerCompact: {
    paddingHorizontal: 18,
    paddingVertical: 28,
    gap: 32,
  },
  copy: copyColumn,
  copyCompact: {
    width: '100%',
    maxWidth: 560,
    alignItems: 'center',
    gap: 20,
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  eyebrowCompact: {
    alignSelf: 'center',
  },
  eyebrowText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accentSecondary,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.heading,
    textAlign: 'left',
  },
  titleCompact: {
    textAlign: 'center',
  },
  titleHighlight: {
    color: COLORS.accentWarmAlt,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
    textAlign: 'left',
  },
  descriptionCompact: {
    textAlign: 'center',
  },
  highlights: {
    width: '100%',
    maxWidth: 560,
    gap: 12,
    alignSelf: 'center',
  },
  highlightsCompact: {
    alignItems: 'stretch',
  },
  highlightBadge,
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  highlightIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(106, 64, 180, 0.08)',
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.heading,
  },
  ctaWrapper: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: 'rgba(249, 115, 22, 0.25)',
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  ctaWrapperCompact: {
    alignSelf: 'stretch',
  },
  cta: {
    paddingHorizontal: 26,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  ctaCompact: {
    width: '100%',
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  card: cardBase,
  cardCompact: {
    marginTop: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  cardAvatar: {
    width: 58,
    height: 58,
    borderRadius: 22,
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
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  cardButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});
