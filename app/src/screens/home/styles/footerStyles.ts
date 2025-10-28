import { StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/colors';

export const footerStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    gap: 24,
  },
  content: {
    flexDirection: 'column',
    gap: 24,
  },
  brand: {
    gap: 12,
  },
  logoPill: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: 'rgba(15, 23, 42, 0.32)',
    shadowOpacity: 1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  logo: {
    width: 40,
    height: 40,
  },
  slogan: {
    color: COLORS.footerText,
    fontSize: 14,
    lineHeight: 20,
  },
  linksWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  links: {
    flexDirection: 'column',
    gap: 12,
  },
  linkText: {
    color: COLORS.footerText,
    fontSize: 14,
  },
  social: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(248, 250, 252, 0.24)',
    shadowColor: 'rgba(15, 23, 42, 0.24)',
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  socialButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    borderTopWidth: 1,
    borderTopColor: COLORS.footerBorder,
    paddingTop: 16,
    flexDirection: 'column',
    gap: 12,
  },
  copy: {
    color: COLORS.footerText,
    fontSize: 12,
  },
  legal: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
});
