import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { FONTS } from '../../constants/typography';
import { PersonalSchedulePeriod } from '../../types/personalSchedule';

export interface PeriodActionModalProps {
  visible: boolean;
  period: PersonalSchedulePeriod | null;
  onClose: () => void;
  onEdit: (period: PersonalSchedulePeriod) => void;
  onToggleStatus: (period: PersonalSchedulePeriod) => void;
  onDelete: (period: PersonalSchedulePeriod) => void;
}

export const PeriodActionModal: React.FC<PeriodActionModalProps> = ({
  visible,
  period,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  if (!period) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Dismiss period details"
        />

        <View style={styles.sheetContainer}>
          {/* Top Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.iconWrapper}>
              {period.isBusy ? (
                <View style={styles.busySquareIcon} />
              ) : (
                <View style={styles.freeCircleIcon} />
              )}
            </View>

            <View style={styles.headerInfo}>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.statusBadge,
                    period.isBusy ? styles.statusBadgeBusy : styles.statusBadgeFree,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      period.isBusy
                        ? styles.statusBadgeTextBusy
                        : styles.statusBadgeTextFree,
                    ]}
                  >
                    {period.isBusy ? 'Occupied Period' : 'Free Period'}
                  </Text>
                </View>
                {period.room && (
                  <View style={styles.roomBadge}>
                    <Text style={styles.roomBadgeText}>{period.room}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.periodTitle}>
                {period.title === 'Busy' || period.title === 'Free'
                  ? (period.isBusy ? 'Occupied Class / Event' : 'Free Available Slot')
                  : period.title}
              </Text>
              <Text style={styles.periodTime}>{period.timeRange}</Text>
              {period.notes && (
                <Text style={styles.periodNotes}>{period.notes}</Text>
              )}
            </View>
          </View>

          {/* Action Buttons Section */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEdit(period)}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Edit schedule entry"
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={styles.btnIcon}>
                <Path
                  d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.editButtonText}>Edit Schedule Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleStatusButton,
                period.isBusy ? styles.toggleToFreeBtn : styles.toggleToBusyBtn,
              ]}
              onPress={() => onToggleStatus(period)}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel={period.isBusy ? 'Mark as Free' : 'Mark as Occupied'}
            >
              <Text
                style={[
                  styles.toggleStatusText,
                  period.isBusy ? styles.toggleToFreeText : styles.toggleToBusyText,
                ]}
              >
                {period.isBusy ? 'Mark as Free Slot' : 'Mark as Occupied / Busy'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(period)}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Delete schedule entry"
            >
              <Text style={styles.deleteButtonText}>Delete Schedule Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.78}
              accessibilityRole="button"
              accessibilityLabel="Close action modal"
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 32, 22, 0.55)',
    justifyContent: 'flex-end',
  },
  backdrop: {
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
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  dragHandle: {
    width: 38,
    height: 4.5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#3D5549',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#C7D8CB',
    borderStyle: 'dashed',
    padding: 14,
    marginBottom: 16,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  freeCircleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2.2,
    borderColor: '#48F504',
  },
  busySquareIcon: {
    width: 18,
    height: 18,
    borderRadius: 2.5,
    borderWidth: 2.2,
    borderColor: '#E84746',
  },
  headerInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  statusBadgeFree: {
    backgroundColor: '#D6EFE0',
  },
  statusBadgeBusy: {
    backgroundColor: '#FEE5E5',
  },
  statusBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10.5,
    letterSpacing: 0.1,
  },
  statusBadgeTextFree: {
    color: '#156534',
  },
  statusBadgeTextBusy: {
    color: '#991B1B',
  },
  roomBadge: {
    backgroundColor: '#526959',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  roomBadgeText: {
    fontFamily: FONTS.medium,
    fontSize: 10.5,
    color: '#E8EFE9',
  },
  periodTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  periodTime: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#C8D7CD',
    marginBottom: 2,
  },
  periodNotes: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#DEE8E0',
    marginTop: 3,
    lineHeight: 16,
  },
  actionSection: {
    gap: 9,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#354837',
    borderRadius: 10,
    paddingVertical: 13,
  },
  btnIcon: {
    marginRight: 8,
  },
  editButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  toggleStatusButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleToFreeBtn: {
    backgroundColor: '#D6EFE0',
    borderWidth: 1,
    borderColor: '#4ADE80',
  },
  toggleToBusyBtn: {
    backgroundColor: '#FADBD8',
    borderWidth: 1,
    borderColor: '#E57373',
  },
  toggleStatusText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  toggleToFreeText: {
    color: '#135930',
  },
  toggleToBusyText: {
    color: '#9B2C2C',
  },
  deleteButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E57373',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#C0392B',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#151F17',
  },
});
