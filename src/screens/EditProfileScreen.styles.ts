import { StyleSheet, Platform } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: '#82997E',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.16,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 -4px 18px rgba(0, 0, 0, 0.16)',
      },
    }),
  },
  dragHandleBar: {
    width: 38,
    height: 4.5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  cancelButtonText: {
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
    marginVertical: 10,
  },

  /* Form Fields */
  formContainer: {
    marginTop: 12,
    marginBottom: 20,
    gap: 14,
  },
  inputWrapper: {
    width: '100%',
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
    borderColor: '#A82525',
    backgroundColor: '#FFF8F8',
  },
  fieldErrorText: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: '#4A1212',
    marginTop: 4,
    marginLeft: 4,
  },

  /* Feedback Messages */
  feedbackBanner: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
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

  /* Save Action Button */
  saveButton: {
    height: 52,
    backgroundColor: '#3C4E3D',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
});
