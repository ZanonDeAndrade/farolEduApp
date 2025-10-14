import { StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/colors';

export const availableStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 16,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.heading,
  },
  titleHighlight: {
    color: COLORS.accentPrimary,
  },
  list: {
    flexDirection: 'column',
    gap: 16,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    gap: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    shadowColor: 'rgba(148, 163, 184, 0.2)',
    shadowOpacity: 1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  subject: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.heading,
  },
  level: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSubtle,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.heading,
  },
  ctaContainer: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: 'rgba(20, 184, 166, 0.28)',
    shadowOpacity: 1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  actionWrapper: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: 'rgba(20, 184, 166, 0.28)',
    shadowOpacity: 1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  action: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  actionText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});
