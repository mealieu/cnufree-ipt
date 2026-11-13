import { StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.cream,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : 0,
  },
  topHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: COLORS.cream,
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topHeaderTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.darkGreen,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 36,
  },
  headerHairline: {
    height: 1,
    backgroundColor: 'rgba(92, 112, 87, 0.22)',
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  scrollContent: {
    paddingBottom: 95,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingTop: 16,
  },
  sectionPill: {
    backgroundColor: COLORS.friendsGroupPillBg,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 22,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  sectionPillText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FAF8EF',
    letterSpacing: 0.1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(91, 105, 85, 0.15)',
    borderRadius: 10,
    height: 42,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIconWrapper: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#0F1711',
    paddingVertical: 6,
  },
  clearSearchButton: {
    padding: 4,
  },
  clearSearchText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.friendsOliveText,
  },
  listContainer: {
    marginTop: 4,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(91, 105, 85, 0.15)',
  },
  friendLeftTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.friendsAvatarBg,
    borderWidth: 1.5,
    borderColor: COLORS.friendsAvatarBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#2B3D2D',
  },
  friendInfo: {
    marginLeft: 14,
    flex: 1,
    justifyContent: 'center',
  },
  friendName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#0F1711',
    letterSpacing: -0.2,
  },
  friendHandle: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: '#3A4D3B',
    marginTop: 1,
  },
  availabilitySummary: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#526654',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleButton: {
    backgroundColor: COLORS.friendsScheduleBtnBg,
    borderWidth: 1,
    borderColor: COLORS.friendsScheduleBtnBorder,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: '#0F1711',
  },
  removeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8A9E8B',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#3A4D3B',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.friendsOliveText,
    textAlign: 'center',
  },
});
