import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { FONTS } from '../../constants/typography';
import { WeeklyScheduleDay, WeeklyScheduleSlot } from '../../types/personalSchedule';

export interface DailyScheduleDetailModalProps {
  visible: boolean;
  day: WeeklyScheduleDay | null;
  selectedSlot?: WeeklyScheduleSlot | null;
  onClose: () => void;
  onOpenDailyView: (dayKey: string) => void;
}

export const DailyScheduleDetailModal: React.FC<DailyScheduleDetailModalProps> = ({
  visible,
  day,
  selectedSlot,
  onClose,
  onOpenDailyView,
}) => {
  if (!day) return null;

  const activityCount = day.slots.filter((s) => s.status === 'ACTIVITY').length;
  const freeCount = day.slots.filter((s) => s.status === 'FREE').length;

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
          accessibilityLabel="Dismiss daily schedule details"
        />

        <View style={styles.sheetContainer}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Header: Day Badge & Date */}
            <View style={styles.headerRow}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>{day.dayName}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close daily schedule details"
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fullDateHeading}>{day.fullDateString}</Text>

            {/* Quick Stat Bar */}
            <View style={styles.statBar}>
              <View style={styles.statItem}>
                <View style={styles.busyDot} />
                <Text style={styles.statText}>{activityCount} Activity Periods</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.freeDot} />
                <Text style={styles.statText}>{freeCount} Free Slots</Text>
              </View>
            </View>

            {/* Highlighted Selected Slot (if tapped directly) */}
            {selectedSlot && (
              <View style={styles.highlightSlotCard}>
                <View style={styles.highlightTopRow}>
                  <Text style={styles.highlightTime}>{selectedSlot.time}</Text>
                  <View
                    style={[
                      styles.highlightBadge,
                      selectedSlot.status === 'ACTIVITY'
                        ? styles.highlightBadgeActivity
                        : styles.highlightBadgeFree,
                    ]}
                  >
                    <Text
                      style={[
                        styles.highlightBadgeText,
                        selectedSlot.status === 'ACTIVITY'
                          ? styles.highlightBadgeTextActivity
                          : styles.highlightBadgeTextFree,
                      ]}
                    >
                      {selectedSlot.status === 'ACTIVITY' ? 'Occupied Class' : 'Available Free Slot'}
                    </Text>
                  </View>
                </View>

                {selectedSlot.activityTitle && (
                  <Text style={styles.highlightTitle}>{selectedSlot.activityTitle}</Text>
                )}
                {selectedSlot.room && (
                  <Text style={styles.highlightRoom}>Room: {selectedSlot.room}</Text>
                )}
                {selectedSlot.notes && (
                  <Text style={styles.highlightNotes}>{selectedSlot.notes}</Text>
                )}
              </View>
            )}

            {/* Complete Day Breakdown List */}
            <Text style={styles.breakdownSectionTitle}>Hourly Schedule Breakdown</Text>
            <View style={styles.slotsListContainer}>
              {day.slots.map((slot, index) => {
                const isSelected = selectedSlot?.time === slot.time;
                const isFree = slot.status === 'FREE';

                return (
                  <View
                    key={`${slot.time}-${index}`}
                    style={[
                      styles.slotRow,
                      isSelected && styles.slotRowSelected,
                    ]}
                  >
                    <View style={styles.slotTimeCol}>
                      <Text style={styles.slotTimeText}>{slot.time}</Text>
                    </View>

                    <View style={styles.slotDetailCol}>
                      <View style={styles.slotStatusRow}>
                        <View
                          style={[
                            styles.statusIndicator,
                            isFree ? styles.freeIndicator : styles.busyIndicator,
                          ]}
                        />
                        <Text style={styles.slotTitleText}>
                          {slot.activityTitle || (isFree ? 'Free Time' : 'Class Activity')}
                        </Text>
                      </View>
                      {slot.room && (
                        <Text style={styles.slotRoomText}>{slot.room}</Text>
                      )}
                    </View>

                    <View
                      style={[
                        styles.slotPillTag,
                        isFree ? styles.slotPillFree : styles.slotPillActivity,
                      ]}
                    >
                      <Text
                        style={[
                          styles.slotPillTagText,
                          isFree ? styles.slotPillFreeText : styles.slotPillActivityText,
                        ]}
                      >
                        {slot.status}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.openDailyViewBtn}
              onPress={() => {
                onClose();
                onOpenDailyView(day.dayKey);
              }}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Open this day in daily schedule view"
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={styles.btnIcon}>
                <Path
                  d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.openDailyViewBtnText}>
                Open Daily View & Edit Actions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dismissBtn}
              onPress={onClose}
              activeOpacity={0.78}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={styles.dismissBtnText}>Back to Weekly View</Text>
            </TouchableOpacity>
          </ScrollView>
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
    maxHeight: '90%',
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
    marginBottom: 12,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dayBadge: {
    backgroundColor: '#ACC5A6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  dayBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#151F17',
    letterSpacing: 0.5,
  },
  closeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeBtnText: {
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    color: '#151F17',
  },
  fullDateHeading: {
    fontFamily: FONTS.bold,
    fontSize: 19,
    color: '#151F17',
    letterSpacing: -0.2,
    marginVertical: 4,
  },
  statBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3D5549',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 10,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  busyDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#E84746',
  },
  freeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#48F504',
  },
  statText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#7C9276',
  },
  highlightSlotCard: {
    backgroundColor: '#3D5549',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#C7D8CB',
    borderStyle: 'dashed',
    padding: 12,
    marginBottom: 12,
  },
  highlightTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  highlightTime: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  highlightBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  highlightBadgeActivity: {
    backgroundColor: '#FEE5E5',
  },
  highlightBadgeFree: {
    backgroundColor: '#D6EFE0',
  },
  highlightBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
  },
  highlightBadgeTextActivity: {
    color: '#991B1B',
  },
  highlightBadgeTextFree: {
    color: '#156534',
  },
  highlightTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  highlightRoom: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#B5CEBC',
    marginBottom: 2,
  },
  highlightNotes: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#DEE8E0',
    lineHeight: 16,
  },
  breakdownSectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#151F17',
    marginTop: 6,
    marginBottom: 8,
  },
  slotsListContainer: {
    backgroundColor: '#7C9276',
    borderRadius: 12,
    padding: 8,
    gap: 6,
    marginBottom: 14,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F1D8',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  slotRowSelected: {
    borderWidth: 1.5,
    borderColor: '#151F17',
  },
  slotTimeCol: {
    width: 68,
  },
  slotTimeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#1A251D',
  },
  slotDetailCol: {
    flex: 1,
  },
  slotStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
  },
  freeIndicator: {
    borderRadius: 4,
    backgroundColor: '#27AE60',
  },
  busyIndicator: {
    borderRadius: 2,
    backgroundColor: '#C0392B',
  },
  slotTitleText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#151F17',
  },
  slotRoomText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: '#425547',
    marginLeft: 14,
  },
  slotPillTag: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  slotPillActivity: {
    backgroundColor: '#5C7057',
  },
  slotPillFree: {
    backgroundColor: '#C5D6C7',
  },
  slotPillTagText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
  },
  slotPillActivityText: {
    color: '#FFFFFF',
  },
  slotPillFreeText: {
    color: '#1A251D',
  },
  openDailyViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#354837',
    borderRadius: 10,
    paddingVertical: 13,
    marginBottom: 8,
  },
  btnIcon: {
    marginRight: 8,
  },
  openDailyViewBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  dismissBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissBtnText: {
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    color: '#151F17',
  },
});
