import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.sageCardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.sageCardBorder,
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accentStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    zIndex: 2,
  },
  freeAccentStripe: {
    backgroundColor: '#1E482C',
  },
  busyAccentStripe: {
    backgroundColor: '#E57373',
  },
  unknownAccentStripe: {
    backgroundColor: '#7A8C7F',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 14,
  },
  avatarWrapper: {
    marginRight: 12,
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: COLORS.avatarCircleBorder,
  },
  initialsAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.avatarCircleBg,
    borderWidth: 1.5,
    borderColor: COLORS.avatarCircleBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.darkGreen,
  },
  infoWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  friendName: {
    fontFamily: FONTS.bold,
    fontSize: 15.5,
    color: '#0F1812',
    marginBottom: 2,
  },
  subtext: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#213024',
    marginBottom: 6,
  },
  badge: {
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  vacantBadge: {
    backgroundColor: COLORS.vacantBadgeBg,
    borderColor: COLORS.vacantBadgeBorder,
  },
  vacantBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.vacantBadgeText,
  },
  busyBadge: {
    backgroundColor: COLORS.busyBadgeBg,
    borderColor: COLORS.busyBadgeBorder,
  },
  busyBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.busyBadgeText,
  },
  unknownBadge: {
    backgroundColor: '#E2E8DE',
    borderColor: '#97A89B',
  },
  unknownBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#3B4E3E',
  },
  rightActionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  greenCircleIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.freeIndicatorGreen,
    marginRight: 8,
  },
  redSquareIndicator: {
    width: 20,
    height: 20,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: COLORS.busyIndicatorRed,
    marginRight: 8,
  },
  unknownIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7A8C7F',
    marginRight: 8,
  },
  chevronText: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#1A291E',
    lineHeight: 22,
  },
});
