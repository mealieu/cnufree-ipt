import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';

export const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 18,
    marginTop: 8,
    marginBottom: 10,
  },
  container: {
    backgroundColor: COLORS.filterContainerBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(35, 50, 38, 0.22)',
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  tab: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    minHeight: 36,
  },
  activeTab: {
    backgroundColor: COLORS.filterActiveBg,
    borderWidth: 1.5,
    borderColor: COLORS.filterActiveBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 0.1,
    maxWidth: 160,
  },
  activeTabText: {
    color: COLORS.filterActiveText,
    fontFamily: FONTS.bold,
  },
  inactiveTabText: {
    color: COLORS.filterInactiveText,
    fontFamily: FONTS.medium,
  },
  emptyState: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSubtle,
    fontFamily: FONTS.medium,
  },
});
