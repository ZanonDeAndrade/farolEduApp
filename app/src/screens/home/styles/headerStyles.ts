import { StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/colors';

export const headerStyles = StyleSheet.create({
  outer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120, 113, 198, 0.16)',
    shadowColor: 'rgba(17, 24, 39, 0.08)',
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.heading,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  navLink: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  navLinkText: {
    fontSize: 14,
    color: COLORS.heading,
    fontWeight: '500',
  },
  ctas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  ghostButton: {
    minWidth: 90,
    borderRadius: 999,
    overflow: 'hidden',
  },
  ghostButtonGradient: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    alignItems: 'center',
  },
  ghostButtonText: {
    color: COLORS.heading,
    fontWeight: '600',
  },
  primaryButton: {
    minWidth: 130,
    borderRadius: 999,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});
