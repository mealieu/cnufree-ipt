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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110, // Prevent overlapping BottomNavBar
  },
  contentContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },

  /* Profile Avatar & Identity Header */
  profileHeader: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3.5,
    borderColor: '#151F17',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  avatarInitials: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: '#151F17',
    letterSpacing: 0.5,
  },
  profileName: {
    fontFamily: FONTS.bold,
    fontSize: 19,
    color: '#151F17',
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: -0.3,
  },
  profileHandle: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#526853',
    textAlign: 'center',
    marginTop: 3,
  },

  /* Integration Feedback Toast */
  toastContainer: {
    backgroundColor: '#354837',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 14,
    marginBottom: 4,
    alignItems: 'center',
  },
  toastText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
