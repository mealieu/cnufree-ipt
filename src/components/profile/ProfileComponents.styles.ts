import { StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';

export const styles = StyleSheet.create({
  /* Quick Actions (4 circular buttons row) */
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  quickActionItem: {
    alignItems: 'center',
    width: 76,
  },
  quickActionCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9FB198',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  quickActionLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#1A241C',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
  },

  /* Settings Section & Card */
  sectionWrapper: {
    marginTop: 18,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16.5,
    color: '#151F17',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  sectionCard: {
    backgroundColor: '#8FA489',
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingRowTitle: {
    fontFamily: FONTS.medium,
    fontSize: 14.5,
    color: '#151F17',
    flex: 1,
  },
  destructiveText: {
    color: '#341515',
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(21, 31, 23, 0.1)',
    marginHorizontal: 16,
  },

  /* Logout Confirmation Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#8FA489',
    borderRadius: 22,
    padding: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
      },
    }),
  },
  dialogTitle: {
    fontFamily: FONTS.bold,
    fontSize: 19,
    color: '#151F17',
    textAlign: 'center',
    marginBottom: 8,
  },
  dialogDescription: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: '#263629',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  dialogNoticeBox: {
    backgroundColor: 'rgba(244, 241, 216, 0.7)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(21, 31, 23, 0.15)',
  },
  dialogNoticeText: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: '#2E3D31',
    textAlign: 'center',
    lineHeight: 16,
  },
  dialogButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogCancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(244, 241, 216, 0.85)',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogCancelBtnText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#151F17',
  },
  dialogConfirmBtn: {
    flex: 1,
    backgroundColor: '#354837',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogConfirmBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
