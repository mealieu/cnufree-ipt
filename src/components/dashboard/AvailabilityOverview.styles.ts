import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';

export const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 18,
    marginTop: 2,
    marginBottom: 8,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(35, 50, 38, 0.12)',
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(35, 50, 38, 0.08)',
    paddingBottom: 8,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.textDark,
    letterSpacing: 0.2,
  },
  statusContext: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: COLORS.textSubtle,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(35, 50, 38, 0.1)',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  totalDot: {
    backgroundColor: COLORS.textMuted,
  },
  freeDot: {
    backgroundColor: COLORS.freeIndicatorGreen,
  },
  occupiedDot: {
    backgroundColor: COLORS.busyIndicatorRed,
    borderRadius: 2,
  },
  unknownDot: {
    backgroundColor: '#8E9E92',
  },
  statCount: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.textDark,
    lineHeight: 20,
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textSubtle,
    letterSpacing: 0.1,
  },
  loadingContainer: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    marginLeft: 8,
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: COLORS.textSubtle,
  },
  emptyContainer: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: COLORS.textSubtle,
  },
});
