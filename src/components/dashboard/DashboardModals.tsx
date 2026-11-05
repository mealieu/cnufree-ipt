import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { FriendAvailability, ScheduleActivity, BestWindow } from '../../types/dashboard';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { UserAvatarSilhouette } from '../icons/NavIcons';

// ================= FULL DAY SCHEDULE MODAL =================
interface FullDayScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  activities: ScheduleActivity[];
  dateString: string;
}

export const FullDayScheduleModal: React.FC<FullDayScheduleModalProps> = ({
  visible,
  onClose,
  activities,
  dateString,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheetContainer}>
          <View style={modalStyles.dragIndicator} />

          <View style={modalStyles.headerRow}>
            <View>
              <Text style={modalStyles.sheetTitle}>Today’s Schedule</Text>
              <Text style={modalStyles.sheetSubtitle}>{dateString}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={modalStyles.closeButton}
              activeOpacity={0.7}
            >
              <Text style={modalStyles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.modalScroll}>
            {activities.map((act) => (
              <View
                key={act.id}
                style={[
                  modalStyles.scheduleItem,
                  act.isBusy ? modalStyles.scheduleItemBusy : modalStyles.scheduleItemFree,
                ]}
              >
                <View style={modalStyles.itemTimeCol}>
                  <Text style={modalStyles.timeText}>{act.startTime}</Text>
                  <Text style={modalStyles.timeEndText}>{act.endTime}</Text>
                </View>

                <View style={modalStyles.itemDivider} />

                <View style={modalStyles.itemDetailCol}>
                  <Text style={modalStyles.itemTitle}>{act.title}</Text>
                  {act.room && (
                    <Text style={modalStyles.itemRoom}>📍 Room: {act.room}</Text>
                  )}
                  <View
                    style={[
                      modalStyles.statusBadgeMini,
                      act.isBusy ? modalStyles.badgeBusyMini : modalStyles.badgeVacantMini,
                    ]}
                  >
                    <Text
                      style={[
                        modalStyles.badgeTextMini,
                        act.isBusy ? modalStyles.textBusyMini : modalStyles.textVacantMini,
                      ]}
                    >
                      {act.isBusy ? 'Busy • Class/Commitment' : 'Free • Open Time'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={modalStyles.primarySheetButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={modalStyles.primarySheetButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ================= FRIEND DETAIL MODAL =================
interface FriendDetailModalProps {
  friend: FriendAvailability | null;
  visible: boolean;
  onClose: () => void;
  onCompareTimetable?: (friend: FriendAvailability) => void;
}

export const FriendDetailModal: React.FC<FriendDetailModalProps> = ({
  friend,
  visible,
  onClose,
  onCompareTimetable,
}) => {
  if (!friend) return null;

  const isFree = friend.status === 'free';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheetContainer}>
          <View style={modalStyles.dragIndicator} />

          <View style={modalStyles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <UserAvatarSilhouette size={48} color="#758A78" />
              <View style={{ marginLeft: 12 }}>
                <Text style={modalStyles.sheetTitle}>{friend.name}</Text>
                <Text style={modalStyles.sheetSubtitle}>
                  Groups: {friend.groups.map((g) => g.toUpperCase()).join(' • ')}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={modalStyles.closeButton}
              activeOpacity={0.7}
            >
              <Text style={modalStyles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={modalStyles.detailCard}>
            <View style={modalStyles.statusRow}>
              <View
                style={[
                  modalStyles.statusBadgeMini,
                  isFree ? modalStyles.badgeVacantMini : modalStyles.badgeBusyMini,
                ]}
              >
                <Text
                  style={[
                    modalStyles.badgeTextMini,
                    isFree ? modalStyles.textVacantMini : modalStyles.textBusyMini,
                  ]}
                >
                  {isFree ? '● VACANT NOW' : '■ CURRENTLY BUSY'}
                </Text>
              </View>
              <Text style={modalStyles.untilText}>
                Until {friend.untilTime}
              </Text>
            </View>

            {friend.currentActivity && (
              <View style={modalStyles.infoBlock}>
                <Text style={modalStyles.infoLabel}>Current Activity</Text>
                <Text style={modalStyles.infoValue}>{friend.currentActivity}</Text>
              </View>
            )}

            {friend.nextActivity && (
              <View style={modalStyles.infoBlock}>
                <Text style={modalStyles.infoLabel}>Next Scheduled Slot</Text>
                <Text style={modalStyles.infoValue}>{friend.nextActivity}</Text>
              </View>
            )}

            {friend.scheduleNotes && (
              <View style={modalStyles.infoBlock}>
                <Text style={modalStyles.infoLabel}>Note</Text>
                <Text style={modalStyles.infoValue}>{friend.scheduleNotes}</Text>
              </View>
            )}
          </View>

          <View style={modalStyles.actionButtonsRow}>
            <TouchableOpacity
              style={modalStyles.secondaryButton}
              onPress={() => {
                onClose();
                onCompareTimetable?.(friend);
              }}
              activeOpacity={0.8}
            >
              <Text style={modalStyles.secondaryButtonText}>Compare Schedules</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={modalStyles.primaryActionButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={modalStyles.primaryActionButtonText}>Send Ping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ================= BEST WINDOW MODAL =================
interface BestWindowModalProps {
  bestWindow: BestWindow | null;
  visible: boolean;
  onClose: () => void;
}

export const BestWindowModal: React.FC<BestWindowModalProps> = ({
  bestWindow,
  visible,
  onClose,
}) => {
  if (!bestWindow) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheetContainer}>
          <View style={modalStyles.dragIndicator} />

          <View style={modalStyles.headerRow}>
            <View>
              <Text style={modalStyles.sheetEyebrow}>RECOMMENDED WINDOW</Text>
              <Text style={modalStyles.sheetTitle}>{bestWindow.timeRange}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={modalStyles.closeButton}
              activeOpacity={0.7}
            >
              <Text style={modalStyles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={modalStyles.detailCard}>
            <Text style={modalStyles.windowHeadline}>
              {bestWindow.freeCount} people have zero conflicting classes:
            </Text>
            <Text style={modalStyles.windowDescription}>
              {bestWindow.description}
            </Text>

            <View style={modalStyles.suggestedBox}>
              <Text style={modalStyles.suggestedBoxLabel}>💡 Suggested Plan</Text>
              <Text style={modalStyles.suggestedBoxText}>
                {bestWindow.suggestedActivity}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={modalStyles.primarySheetButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={modalStyles.primarySheetButtonText}>Propose to Friends</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    maxHeight: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  dragIndicator: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#BAC5B6',
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sheetEyebrow: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#344E3B',
    letterSpacing: 0.8,
  },
  sheetTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: '#121D15',
  },
  sheetSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#4B6050',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#26382C',
  },
  modalScroll: {
    maxHeight: 380,
    marginBottom: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  scheduleItemFree: {
    backgroundColor: '#E8F5ED',
    borderColor: '#78CBA0',
  },
  scheduleItemBusy: {
    backgroundColor: '#F3E4E4',
    borderColor: '#EAA6A6',
  },
  itemTimeCol: {
    width: 72,
  },
  timeText: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: '#162319',
  },
  timeEndText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: '#425747',
  },
  itemDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(35, 50, 38, 0.15)',
    marginHorizontal: 10,
  },
  itemDetailCol: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: '#101912',
    marginBottom: 2,
  },
  itemRoom: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: '#3A4E3F',
    marginBottom: 4,
  },
  statusBadgeMini: {
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  badgeVacantMini: {
    backgroundColor: COLORS.vacantBadgeBg,
    borderWidth: 1,
    borderColor: COLORS.vacantBadgeBorder,
  },
  badgeBusyMini: {
    backgroundColor: COLORS.busyBadgeBg,
    borderWidth: 1,
    borderColor: COLORS.busyBadgeBorder,
  },
  badgeTextMini: {
    fontFamily: FONTS.bold,
    fontSize: 10,
  },
  textVacantMini: {
    color: COLORS.vacantBadgeText,
  },
  textBusyMini: {
    color: COLORS.busyBadgeText,
  },
  detailCard: {
    backgroundColor: COLORS.sageCardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.sageCardBorder,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  untilText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#131F16',
  },
  infoBlock: {
    marginTop: 10,
  },
  infoLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#283E2F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#0E1711',
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#E1E9D7',
    borderWidth: 1,
    borderColor: '#38533F',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#182C1E',
  },
  primaryActionButton: {
    flex: 1,
    backgroundColor: COLORS.darkGreen,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryActionButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.white,
  },
  primarySheetButton: {
    backgroundColor: COLORS.darkGreen,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  primarySheetButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.white,
  },
  windowHeadline: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: '#101B13',
    marginBottom: 4,
  },
  windowDescription: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#213024',
    marginBottom: 12,
  },
  suggestedBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(35, 50, 38, 0.15)',
  },
  suggestedBoxLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#162C1D',
    marginBottom: 3,
  },
  suggestedBoxText: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: '#213326',
    lineHeight: 18,
  },
});
