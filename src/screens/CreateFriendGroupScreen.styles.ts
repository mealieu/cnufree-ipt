import { StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';

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
    marginBottom: 20,
  },
  sectionPillText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FAF8EF',
    letterSpacing: 0.1,
  },
  fieldSection: {
    marginBottom: 22,
  },
  fieldLabel: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: '#0F1711',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(91, 105, 85, 0.15)',
    borderRadius: 10,
    height: 46,
    paddingHorizontal: 14,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#0F1711',
  },
  inputErrorBorder: {
    borderWidth: 1.2,
    borderColor: COLORS.busyIndicatorRed,
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.busyBadgeText,
    marginTop: 6,
  },
  friendsSelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectFriendsLabel: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: '#0F1711',
  },
  selectedCountText: {
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    color: '#3A4D3B',
  },
  friendsList: {
    marginTop: 4,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(91, 105, 85, 0.12)',
  },
  friendRowSelected: {
    backgroundColor: 'rgba(91, 105, 85, 0.05)',
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 14,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    fontSize: 17,
    color: '#2B3D2D',
  },
  friendDetails: {
    marginLeft: 14,
    flex: 1,
    justifyContent: 'center',
  },
  friendName: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#0F1711',
  },
  friendHandle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#3A4D3B',
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.8,
    borderColor: '#5C7057',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#5C7057',
    borderColor: '#5C7057',
  },
  checkmarkText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 15,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: COLORS.friendsOliveText,
  },
  createButton: {
    backgroundColor: '#C2D8C5',
    borderWidth: 1,
    borderColor: '#92A995',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15.5,
    color: '#0F1711',
  },
});

