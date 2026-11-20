import { StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: '#82997E',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 40 : 26,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.18)',
      },
    }),
  },
  dragHandleBar: {
    width: 38,
    height: 4.5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetCloseButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  sheetCloseButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#151F17',
  },
  sheetTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#151F17',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginVertical: 8,
  },
  sheetSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#243326',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
  },

  /* Form Inputs (Figma PS-02 Match) */
  formContainer: {
    marginTop: 8,
    marginBottom: 18,
    gap: 12,
  },
  inputWrapper: {
    width: '100%',
  },
  inputLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#1D2A1F',
    marginBottom: 4,
    marginLeft: 4,
  },
  inputCard: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: '#151F17',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 1.5,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  inputCardError: {
    borderWidth: 1.5,
    borderColor: '#9E2424',
    backgroundColor: '#FFF8F8',
  },
  fieldErrorText: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: '#421414',
    marginTop: 4,
    marginLeft: 4,
  },

  /* Primary Action Button (SAVE) */
  primaryActionBtn: {
    height: 52,
    backgroundColor: '#3C4E3D',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  primaryActionBtnDisabled: {
    opacity: 0.65,
  },
  primaryActionBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },

  /* Feedback Messages */
  feedbackBanner: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  successBanner: {
    backgroundColor: '#354837',
  },
  errorBanner: {
    backgroundColor: '#7A2424',
  },
  feedbackText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  /* Privacy Visibility Option Cards */
  optionsList: {
    gap: 10,
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#304231',
    backgroundColor: '#F8FAF6',
  },
  optionInfo: {
    flex: 1,
    marginRight: 10,
  },
  optionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: '#151F17',
    marginBottom: 2,
  },
  optionDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#556557',
    lineHeight: 16,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#7F9381',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#304231',
  },
  radioInnerDot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#304231',
  },

  /* Shared Links Card */
  linkDisplayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkText: {
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    color: '#1B2C1E',
    flex: 1,
    marginRight: 8,
  },
  copyBtn: {
    backgroundColor: '#354837',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  toggleLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#151F17',
  },
  switchPill: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#354837',
    padding: 2,
    justifyContent: 'center',
  },
  switchPillOff: {
    backgroundColor: '#B5C4B4',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-end',
  },
  switchThumbOff: {
    alignSelf: 'flex-start',
  },

  /* Dropzone for Import Schedule */
  dropzone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4A614C',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  dropzoneIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3C4E3D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dropzoneTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#151F17',
    marginBottom: 4,
  },
  dropzoneSub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#344536',
    textAlign: 'center',
    lineHeight: 16,
  },

  /* Figma Schedule Visibility Styles (PS-09) */
  figmaHeaderContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  figmaSheetTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: '#151F17',
    letterSpacing: -0.4,
    textAlign: 'left',
    marginBottom: 4,
  },
  figmaSheetSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: '#233225',
    textAlign: 'left',
    lineHeight: 18,
  },
  figmaDarkCard: {
    backgroundColor: '#526653',
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 16,
  },
  figmaOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  figmaBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 175,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1.5,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  figmaBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#151F17',
  },
  figmaTriangleIcon: {
    marginLeft: 7,
  },
  figmaRadioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.2,
    borderColor: '#1D2A1F',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  figmaRadioCircleSelected: {
    backgroundColor: '#151F17',
    borderColor: '#151F17',
  },
  selectedFriendsSummaryPill: {
    backgroundColor: '#D1EFE0',
    borderWidth: 1.5,
    borderColor: '#32B368',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedFriendsSummaryText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#0F4D24',
    flex: 1,
  },
  selectedFriendsEditAction: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: '#1A5A31',
    marginLeft: 8,
  },
  subViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subViewBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: 10,
  },
  subViewBackText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#151F17',
    marginLeft: 2,
  },
  subViewTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#151F17',
    letterSpacing: -0.3,
  },
  subViewSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#243326',
    marginBottom: 12,
    lineHeight: 17,
  },
  subViewSearchInput: {
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: '#151F17',
    marginBottom: 12,
  },
  subViewSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#6D8269',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  subViewSegmentBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  subViewSegmentBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  subViewSegmentText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#E4EDE2',
  },
  subViewSegmentTextActive: {
    fontFamily: FONTS.bold,
    color: '#151F17',
  },
  subViewShortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  subViewCountText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#243326',
  },
  subViewShortcutBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  subViewShortcutBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#151F17',
    textDecorationLine: 'underline',
  },
  subViewItemList: {
    maxHeight: 280,
    marginBottom: 14,
  },
  subViewItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  subViewItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  subViewAvatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#A0B49F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  subViewAvatarInitials: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: '#151F17',
  },
  subViewItemTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: '#151F17',
  },
  subViewItemSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: '#556557',
    marginTop: 1,
  },
  subViewCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#7F9381',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subViewCheckboxChecked: {
    backgroundColor: '#1A5A31',
    borderColor: '#1A5A31',
  },

  /* Figma Shared Link Permissions & Expiration Styles (PS-10 / UI-43) */
  shareScheduleTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: '#151F17',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 4,
  },
  shareScheduleSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: '#243326',
    textAlign: 'center',
    marginBottom: 16,
  },
  shareUrlPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#4E614F',
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 1.5,
      },
      web: {
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  shareUrlText: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: '#1E2B20',
    flex: 1,
    marginRight: 8,
  },
  shareUrlCopyBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareCard: {
    backgroundColor: '#526653',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  shareCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: '#FFFFFF',
    marginBottom: 14,
  },
  shareOptionsStack: {
    gap: 14,
  },
  shareOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shareBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 16,
    minWidth: 175,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1.5,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  shareBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#151F17',
  },
  shareRadioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.2,
    borderColor: '#1D2A1F',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareRadioCircleSelected: {
    backgroundColor: '#151F17',
    borderColor: '#151F17',
  },
  dropdownTrigger: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    height: 46,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1.5,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  dropdownTriggerText: {
    fontFamily: FONTS.bold,
    fontSize: 15.5,
    color: '#151F17',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DFE5DE',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3EF',
  },
  dropdownItemText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#151F17',
  },
  dropdownItemTextSelected: {
    fontFamily: FONTS.bold,
    color: '#1A5A31',
  },
  specificHoursSubCard: {
    backgroundColor: '#617562',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    gap: 10,
  },
  specificHoursHeader: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  specificHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  specificHoursInputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flex: 1,
    alignItems: 'center',
  },
  specificHoursInputText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#151F17',
  },
  specificHoursToText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  specificHoursDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  specificHoursDayChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  specificHoursDayChipActive: {
    backgroundColor: '#151F17',
  },
  specificHoursDayText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#151F17',
  },
  specificHoursDayTextActive: {
    color: '#FFFFFF',
  },
  shareBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  shareButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 6,
    marginBottom: 12,
  },
  shareCancelBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    minWidth: 120,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  shareCancelBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15.5,
    color: '#151F17',
  },
  shareSaveBtn: {
    backgroundColor: '#526653',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 36,
    minWidth: 120,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  shareSaveBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15.5,
    color: '#FFFFFF',
  },
});
