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
});
