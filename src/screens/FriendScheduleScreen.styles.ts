import { StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.cream,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : 0,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  scrollContent: {
    paddingBottom: 95, // Leaves space so bottom nav never overlaps schedule box
  },
  contentContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  /* 1. Legacy Header Styles (Home/Friends mode) */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 23,
    color: '#172019',
    letterSpacing: -0.2,
  },

  /* 2. Legacy Profile Section Styles (Home/Friends mode) */
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 16,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DEE5ED',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  friendName: {
    fontFamily: FONTS.bold,
    fontSize: 21,
    color: '#172019',
    letterSpacing: -0.2,
  },
  friendSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#4B594E',
    marginTop: 3,
  },

  /* 3. Legacy Date Display & Toggle Controls (Home/Friends mode) */
  dateDisplay: {
    fontFamily: FONTS.medium,
    fontSize: 14.5,
    color: '#344338',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#CCD7CA',
    borderRadius: 24,
    padding: 4,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      },
    }),
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOptionActive: {
    backgroundColor: '#1C231F',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.16,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 5px rgba(0,0,0,0.18)',
      },
    }),
  },
  toggleText: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
  toggleTextActive: {
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  toggleTextInactive: {
    fontFamily: FONTS.medium,
    color: '#2F3D32',
  },

  /* 4. Legacy Weekly Navigation Banner (Home/Friends mode) */
  weeklyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.weeklyBannerBg,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 3.5,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      },
    }),
  },
  bannerArrowBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyIndicatorPill: {
    backgroundColor: COLORS.weeklyBannerPillBg,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyIndicatorText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.weeklyBannerText,
    letterSpacing: 0.1,
  },

  /* 5. Legacy Day Selector Tabs (Home/Friends mode) */
  dayTabsWrapper: {
    marginBottom: 16,
  },
  dayTabsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    gap: 7,
  },
  dayTab: {
    width: 48,
    height: 56,
    borderRadius: 8,
    backgroundColor: COLORS.dayTabBg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.12,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1.5px 3.5px rgba(0,0,0,0.1)',
      },
    }),
  },
  dayTabActive: {
    backgroundColor: COLORS.dayTabActiveBg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
      },
    }),
  },
  dayAbbrevText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.dayTabTextSubtle,
    marginBottom: 2,
  },
  dayAbbrevTextActive: {
    color: '#DCE8DE',
  },
  dayNumberText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.dayTabTextDark,
  },
  dayNumberTextActive: {
    color: '#FFFFFF',
  },

  /* 6. Chronological Time Blocks (Timeline Container) */
  timelineBox: {
    flexDirection: 'row',
    borderWidth: 1.4,
    borderColor: COLORS.timelineContainerBorder,
    borderRadius: 14,
    backgroundColor: COLORS.timelineContainerBg,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#172B1E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 2px 8px rgba(23,43,30,0.04)',
      },
    }),
  },
  timeAxisColumn: {
    width: 44,
    position: 'relative',
    marginRight: 6,
  },
  timeAxisItem: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'flex-start',
  },
  timeAxisLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10.5,
    color: '#556858',
    letterSpacing: 0.1,
  },
  scheduleGridArea: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#DEE5DD',
    borderStyle: 'dashed',
  },

  /* Free Time Block (Figma Reference) */
  freeBlock: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderRadius: 14,
    borderWidth: 1.4,
    borderColor: COLORS.timelineFreeBorder,
    borderStyle: 'dashed',
    backgroundColor: COLORS.timelineFreeBg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  freeContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  freeCheckIcon: {
    marginRight: 2,
  },
  freeText: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: '#2A382C',
    letterSpacing: -0.1,
  },

  /* Busy/Class Time Block (Figma Reference) */
  busyBlock: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderRadius: 8,
    backgroundColor: COLORS.timelineBusyBg,
    borderLeftWidth: 4.5,
    borderLeftColor: COLORS.timelineBusyAccent,
    paddingHorizontal: 12,
    paddingVertical: 9,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      },
    }),
  },
  busyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  busyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: '#1B242C',
    flex: 1,
    marginRight: 8,
  },
  busyTimeRange: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: '#5B6874',
  },
  busyRoom: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#5B6874',
  },

  /* ========================================================================= */
  /* UI-30 INDIVIDUAL FRIEND SCHEDULE SCREEN (MATCHES FIGMA SCREENSHOT EXACTLY) */
  /* ========================================================================= */
  sharedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  sharedBackButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3EED9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sharedBackTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17.5,
    color: '#1B271E',
    letterSpacing: -0.2,
  },
  sharedProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
  },
  sharedAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#617065',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sharedAvatarText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  sharedProfileInfo: {
    flex: 1,
  },
  sharedFriendName: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: '#172019',
    letterSpacing: -0.3,
  },
  sharedFriendSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#5C6B5F',
    marginTop: 2,
  },
  sharedStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EED9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  sharedStatusBadgeText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#1B271E',
  },
  sharedDividerLine: {
    height: 1,
    backgroundColor: 'rgba(88, 107, 92, 0.22)',
    marginBottom: 16,
  },
  sharedDateNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  sharedDateTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#172019',
    letterSpacing: -0.4,
  },
  sharedDateSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#5C6B5F',
    marginTop: 2,
  },
  sharedDateNavControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sharedTodayButton: {
    backgroundColor: '#EBEFE5',
    paddingHorizontal: 15,
    paddingVertical: 7.5,
    borderRadius: 18,
  },
  sharedTodayButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#172019',
  },
  sharedNavArrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBEFE5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Segmented Day / Week Toggle (Matches Screenshot Exactly) */
  sharedToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#ECEEE6',
    borderRadius: 24,
    padding: 3,
    marginBottom: 16,
    height: 44,
    alignItems: 'center',
  },
  sharedToggleOption: {
    flex: 1,
    height: 38,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  sharedToggleOptionActive: {
    backgroundColor: '#FAF8EE',
    borderWidth: 1.5,
    borderColor: '#435445',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      },
    }),
  },
  sharedToggleText: {
    fontFamily: FONTS.medium,
    fontSize: 14.5,
    color: '#68776B',
  },
  sharedToggleTextActive: {
    fontFamily: FONTS.bold,
    color: '#172019',
  },
  sharedToggleTextInactive: {
    color: '#68776B',
  },

  /* Day View Timeline Blocks */
  sharedFreeBlock: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: '#B9C7B7',
    borderRadius: 10,
    backgroundColor: 'rgba(238, 242, 235, 0.65)',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  sharedFreeContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sharedFreeCheckIcon: {
    marginRight: 6,
  },
  sharedFreeText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#28362B',
  },
  sharedBusyBlock: {
    position: 'absolute',
    left: 4,
    right: 4,
    backgroundColor: '#D1D7CE',
    borderLeftWidth: 4,
    borderLeftColor: '#36473A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  sharedBusyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sharedBusyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: '#172019',
  },
  sharedBusyTimeRange: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#4A584D',
  },
  sharedBusyRoom: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: '#5C6B5F',
    marginTop: 2,
  },

  /* ========================================================================= */
  /* WEEK VIEW SCHEDULE STYLES */
  /* ========================================================================= */
  weekQuickStripWrapper: {
    marginBottom: 14,
  },
  weekQuickStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  weekQuickTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(235, 239, 229, 0.5)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  weekQuickTabActive: {
    backgroundColor: '#FAF8EE',
    borderColor: '#435445',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      },
    }),
  },
  weekQuickTabToday: {
    borderColor: '#27AE60',
  },
  weekQuickDayShort: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#657467',
    marginBottom: 2,
  },
  weekQuickDayShortActive: {
    color: '#172019',
    fontFamily: FONTS.bold,
  },
  weekQuickDayNumber: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#172019',
  },
  weekQuickTodayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#27AE60',
    marginTop: 3,
  },

  /* Horizontal Scrolling Week Calendar Grid */
  weekCalendarBox: {
    flexDirection: 'row',
    borderWidth: 1.4,
    borderColor: COLORS.timelineContainerBorder,
    borderRadius: 14,
    backgroundColor: COLORS.timelineContainerBg,
    marginBottom: 20,
    overflow: 'hidden',
  },
  weekTimeAxisCol: {
    width: 44,
    backgroundColor: '#F5F5E9',
    borderRightWidth: 1,
    borderRightColor: '#DEE5DD',
  },
  weekTimeAxisSpacer: {
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#DEE5DD',
    backgroundColor: '#ECEFE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekTimeAxisSpacerText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: '#657467',
  },
  weekTimeAxisItemsContainer: {
    position: 'relative',
    flex: 1,
  },
  weekHorizontalScrollView: {
    flex: 1,
  },
  weekDaysContainer: {
    flexDirection: 'row',
  },
  weekDayColumn: {
    width: 120,
    borderRightWidth: 1,
    borderRightColor: '#DEE5DD',
    position: 'relative',
  },
  weekDayColHeader: {
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#DEE5DD',
    backgroundColor: '#ECEFE5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  weekDayColHeaderActive: {
    backgroundColor: '#DEE5DA',
  },
  weekDayColShortText: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: '#556858',
  },
  weekDayColShortTextActive: {
    fontFamily: FONTS.bold,
    color: '#172019',
  },
  weekDayColNumText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#172019',
  },
  weekDayColNumTextActive: {
    color: '#172019',
  },
  weekDayGridContent: {
    position: 'relative',
  },
  weekBusyBlock: {
    position: 'absolute',
    left: 3,
    right: 3,
    backgroundColor: '#D1D7CE',
    borderLeftWidth: 3.5,
    borderLeftColor: '#36473A',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  weekBusyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    color: '#172019',
  },
  weekBusyTime: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: '#4A584D',
    marginTop: 1,
  },
  weekBusyRoom: {
    fontFamily: FONTS.regular,
    fontSize: 9.5,
    color: '#5C6B5F',
    marginTop: 1,
  },
  weekFreeBlock: {
    position: 'absolute',
    left: 3,
    right: 3,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#B9C7B7',
    borderRadius: 6,
    backgroundColor: 'rgba(238, 242, 235, 0.65)',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  weekFreeContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  weekFreeText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: '#28362B',
  },

  /* Unavailable / Missing Schedule Fallback */
  sharedUnavailableContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(230, 235, 227, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4DDD1',
    marginVertical: 24,
  },
  sharedUnavailableTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: '#172019',
    marginTop: 12,
    marginBottom: 6,
  },
  sharedUnavailableText: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: '#5C6B5F',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  sharedReturnButton: {
    backgroundColor: '#27382B',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sharedReturnButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    color: '#FFFFFF',
  },

  /* ========================================================================= */
  /* SS-06: FIGMA UI-31 SPECIAL STATES STYLES */
  /* ========================================================================= */

  /* Amber/Cream Status Badge (UI-31) */
  sharedStatusBadgeAmber: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFCB',
    borderWidth: 1,
    borderColor: '#E7DFB0',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
  },
  sharedStatusBadgeAmberText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#5C4A15',
  },

  /* Privacy Notice Card / Banner (UI-31 Privacy-Restricted) */
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EDE8D5',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD6BD',
    gap: 12,
  },
  privacyIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF7EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  privacyTextCol: {
    flex: 1,
  },
  privacyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: '#1A251D',
    letterSpacing: -0.2,
  },
  privacySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: '#5C6B5F',
    marginTop: 3,
    lineHeight: 18,
  },

  /* Privacy-Restricted Busy Blocks (UI-31) */
  sharedBusyPrivateBlock: {
    position: 'absolute',
    left: 4,
    right: 4,
    backgroundColor: '#D9DDE2',
    borderLeftWidth: 4.5,
    borderLeftColor: '#4B5563',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  sharedBusyPrivateTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sharedBusyPrivateLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sharedBusyPrivateTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: '#172019',
  },
  sharedBusyPrivateTimeRange: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#4B5563',
  },

  /* Center Empty/Error States (UI-31 Missing Schedule & Unavailable Data) */
  centerStateContainer: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  bigStateIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EDE8D5',
    borderWidth: 1.2,
    borderColor: '#DDD6BD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stateTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: '#1A251D',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  stateSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#5C6B5F',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 310,
    marginBottom: 24,
  },
  unknownAvailabilityCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#EDE8D5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDD6BD',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  unknownAvailabilityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  unknownAvailabilityTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: '#1A251D',
  },
  unknownAvailabilitySub: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: '#5C6B5F',
  },
  stateActionsContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  statePrimaryButton: {
    backgroundColor: '#334839',
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  statePrimaryButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  stateSecondaryButton: {
    backgroundColor: 'transparent',
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#334839',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stateSecondaryButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#334839',
  },
  feedbackBanner: {
    backgroundColor: '#D9EFE0',
    borderWidth: 1,
    borderColor: '#8FCFA4',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  feedbackBannerText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#154B24',
    textAlign: 'center',
  },

  /* Privacy Notice Detail Modal */
  privacyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  privacyModalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FAF7EE',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#DDD6BD',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
      },
    }),
  },
  privacyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  privacyModalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: '#172019',
  },
  privacyModalBody: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: '#4B584E',
    lineHeight: 20,
    marginBottom: 18,
  },
  privacyModalCloseBtn: {
    backgroundColor: '#334839',
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyModalCloseBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
});

