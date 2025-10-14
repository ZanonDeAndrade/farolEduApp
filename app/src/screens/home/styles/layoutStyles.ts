import { StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/colors';

export const layoutStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingTop: 8,
    paddingBottom: 48,
  },
});
