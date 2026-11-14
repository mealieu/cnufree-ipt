import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { FONTS } from '../../constants/typography';
import { COLORS } from '../../constants/colors';
import {
  CommonFreeTimeModalProps,
  SharedCalendarFriend,
} from '../../types/sharedSchedule';
import { formatDateKey } from '../../mock/sharedScheduleData';

export const CommonFreeTimeModal: React.FC<CommonFreeTimeModalProps> = ({
  visible,
  onClose,
  window,
  friends,
  date,
  isEmptyState = false,
  onSwitchToWeek,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Formatted date string (e.g. "Monday, Oct 19, 2026")
  const fullDateLabel = useMemo(() => {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const dayNum = date.getDate();
    const year = date.getFullYear();
    return `${dayName}, ${monthName} ${dayNum}, ${year}`;
  }, [date]);

  // Short date string for empty state (e.g. "Wed, Oct 21")
  const shortDateLabel = useMemo(() => {
    const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${daysShort[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  }, [date]);

  // Duration label (e.g. "2 hr", "1 hr 30 min", "45 min")
  const durationLabel = useMemo(() => {
    if (!window) return '';
    const diff = window.endHour - window.startHour;
    if (diff === 1) return '1 hr';
    if (diff === Math.floor(diff)) return `${diff} hr`;
    const hrs = Math.floor(diff);
    const mins = Math.round((diff - hrs) * 60);
    if (hrs === 0) return `${mins} min`;
    return `${hrs} hr ${mins} min`;
  }, [window]);

  // Date key for looking up friend schedules
  const dateKey = useMemo(() => formatDateKey(date), [date]);

  // Inspect each friend's status during this free window
  const friendStatuses = useMemo(() => {
    if (!window) return [];
    return friends.map((friend) => {
      const schedule = friend.scheduleByDate[dateKey] || [];
      const overlappingItem = schedule.find(
        (item) =>
          item.isBusy &&
          item.startHour < window.endHour &&
          item.endHour > window.startHour
      );

      return {
        friend,
        isFree: !overlappingItem,
        isPrivate: friend.isPrivate || overlappingItem?.isPrivate,
        busyTitle: overlappingItem?.title,
      };
    });
  }, [friends, window, dateKey]);

  // Notice text dynamically mentioning private friends matching Figma
  const noticeText = useMemo(() => {
    const privateFriends = friends.filter((f) => f.isPrivate);
    if (privateFriends.length > 0) {
      const names = privateFriends
        .map((f) => f.nickname || f.name.split(' ')[0])
        .join(' and ');
      const verb = privateFriends.length === 1 ? 'shares' : 'share';
      return `Sample data. ${names} ${verb} availability only; event details stay hidden. Viewing a free window doesn't create an event.`;
    }
    return "Sample data. Chloe shares availability only; event details stay hidden. Viewing a free window doesn't create an event.";
  }, [friends]);

  // Handle copy time action
  const handleCopyTime = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.sheetContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Top Pill Handle */}
          <View style={styles.handleBar} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Subtitle & Date */}
            <Text style={styles.subHeader}>Common free time</Text>
            <Text style={styles.dateLabel}>{fullDateLabel}</Text>

            {!isEmptyState && window ? (
              <>
                {/* Large Main Time Display */}
                <Text style={styles.mainTimeRange}>{window.timeRange}</Text>

                {/* Badges Row */}
                <View style={styles.badgesRow}>
                  {/* Left Pill: White Checkmark Pill */}
                  <View style={styles.allFreePill}>
                    <Svg
                      width={12}
                      height={12}
                      viewBox="0 0 24 24"
                      fill="none"
                      style={styles.checkIcon}
                    >
                      <Path
                        d="M20 6L9 17L4 12"
                        stroke="#2B4A33"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                    <Text style={styles.allFreePillText}>{window.label}</Text>
                  </View>

                  {/* Right Badge: Duration */}
                  {durationLabel ? (
                    <Text style={styles.durationText}>{durationLabel}</Text>
                  ) : null}
                </View>

                {/* Included Friends Section */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>Included friends</Text>
                </View>

                <View style={styles.friendsList}>
                  {friendStatuses.map(
                    ({ friend, isFree, isPrivate, busyTitle }) => (
                      <View key={friend.id} style={styles.friendRow}>
                        {/* Initials Avatar */}
                        <View style={styles.avatarCircle}>
                          <Text style={styles.avatarInitials}>
                            {friend.initials}
                          </Text>
                        </View>

                        {/* Friend Name */}
                        <Text style={styles.friendNameText} numberOfLines={1}>
                          {friend.name}
                        </Text>

                        {/* Status Indicator */}
                        <View style={styles.statusIndicatorContainer}>
                          {isPrivate && isFree ? (
                            <View style={styles.lockStatusRow}>
                              <Svg
                                width={12}
                                height={12}
                                viewBox="0 0 24 24"
                                fill="none"
                                style={styles.smallLockIcon}
                              >
                                <Rect
                                  x="3"
                                  y="11"
                                  width="18"
                                  height="11"
                                  rx="2"
                                  ry="2"
                                  stroke="#36503C"
                                  strokeWidth="2.2"
                                />
                                <Path
                                  d="M7 11V7a5 5 0 0 1 10 0v4"
                                  stroke="#36503C"
                                  strokeWidth="2.2"
                                  strokeLinecap="round"
                                />
                              </Svg>
                              <Text style={styles.availabilityOnlyText}>
                                availability only
                              </Text>
                            </View>
                          ) : isFree ? (
                            <View style={styles.freeStatusRow}>
                              <Svg
                                width={12}
                                height={12}
                                viewBox="0 0 24 24"
                                fill="none"
                                style={{ marginRight: 4 }}
                              >
                                <Path
                                  d="M20 6L9 17L4 12"
                                  stroke="#28442F"
                                  strokeWidth={2.8}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </Svg>
                              <Text style={styles.freeStatusText}>Free</Text>
                            </View>
                          ) : (
                            <View style={styles.busyStatusRow}>
                              <Text style={styles.busyStatusText}>
                                {busyTitle || 'Busy'}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    )
                  )}
                </View>

                {/* Info / Notice Card */}
                <View style={styles.noticeCard}>
                  <Text style={styles.noticeText}>{noticeText}</Text>
                </View>

                {/* Bottom Action Buttons */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.copyButton,
                      copied && styles.copyButtonActive,
                    ]}
                    onPress={handleCopyTime}
                    activeOpacity={0.8}
                    accessibilityLabel="Copy common free time"
                    accessibilityRole="button"
                  >
                    <Svg
                      width={15}
                      height={15}
                      viewBox="0 0 24 24"
                      fill="none"
                      style={styles.copyIcon}
                    >
                      {copied ? (
                        <Path
                          d="M20 6L9 17L4 12"
                          stroke="#1A3320"
                          strokeWidth={2.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ) : (
                        <>
                          <Rect
                            x="9"
                            y="9"
                            width="13"
                            height="13"
                            rx="2"
                            stroke="#1A3320"
                            strokeWidth={2}
                          />
                          <Path
                            d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
                            stroke="#1A3320"
                            strokeWidth={2}
                            strokeLinecap="round"
                          />
                        </>
                      )}
                    </Svg>
                    <Text style={styles.copyButtonText}>
                      {copied ? 'Copied!' : 'Copy time'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    activeOpacity={0.8}
                    accessibilityLabel="Close common free time dialog"
                    accessibilityRole="button"
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              /* Empty State (SS-04 Right Screen Context) */
              <>
                <Text style={styles.mainTimeRangeEmpty}>
                  None found for {shortDateLabel}
                </Text>

                <View style={styles.emptyNoticeBox}>
                  <Text style={styles.emptyNoticeHeading}>
                    No Overlapping Free Window
                  </Text>
                  <Text style={styles.emptyNoticeBody}>
                    All {friends.length} group members have conflicting classes or
                    commitments on this date. You can switch to the Week view to
                    scan for open windows across the entire week.
                  </Text>
                </View>

                {/* Friends commitments breakdown */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>Group Members</Text>
                </View>

                <View style={styles.friendsList}>
                  {friends.map((friend) => {
                    const schedule =
                      friend.scheduleByDate[dateKey]?.filter(
                        (item) => item.isBusy
                      ) || [];
                    const summary =
                      schedule.length > 0
                        ? schedule.map((s) => s.title).join(', ')
                        : 'No classes';

                    return (
                      <View key={friend.id} style={styles.friendRow}>
                        <View style={styles.avatarCircle}>
                          <Text style={styles.avatarInitials}>
                            {friend.initials}
                          </Text>
                        </View>
                        <Text style={styles.friendNameText} numberOfLines={1}>
                          {friend.name}
                        </Text>
                        <Text style={styles.emptyFriendSummary} numberOfLines={1}>
                          {summary}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Bottom Action Buttons for Empty State */}
                <View style={styles.actionsRow}>
                  {onSwitchToWeek && (
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => {
                        onClose();
                        onSwitchToWeek();
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.copyButtonText}>View Week</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 26, 18, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#86A08A', // Sage green matching SS-04 Figma
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '85%',
  },
  handleBar: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  subHeader: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#28442E',
    marginBottom: 2,
  },
  dateLabel: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#132817',
    marginBottom: 8,
  },
  mainTimeRange: {
    fontFamily: FONTS.bold,
    fontSize: 25,
    color: '#102314',
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  mainTimeRangeEmpty: {
    fontFamily: FONTS.bold,
    fontSize: 21,
    color: '#102314',
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  allFreePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 16,
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#1A3320',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 2,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  checkIcon: {
    marginRight: 5,
  },
  allFreePillText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#2B4A33',
  },
  durationText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#243C29',
  },
  sectionHeaderRow: {
    marginTop: 4,
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    color: '#243D2A',
  },
  friendsList: {
    marginBottom: 16,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#596C5F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitials: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  friendNameText: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: '#16281A',
    flex: 1,
  },
  statusIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallLockIcon: {
    marginRight: 4,
  },
  availabilityOnlyText: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: '#36503C',
  },
  freeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freeStatusText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#28442F',
  },
  busyStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  busyStatusText: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: '#3D5442',
  },
  noticeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#172B1B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  noticeText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#3F5243',
    lineHeight: 17,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  copyButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#1B3120',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  copyButtonActive: {
    backgroundColor: '#EAF5EC',
  },
  copyIcon: {
    marginRight: 6,
  },
  copyButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#1E3322',
  },
  closeButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4B624F', // Dark moss green pill matching SS-04
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  emptyNoticeBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  emptyNoticeHeading: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#182C1C',
    marginBottom: 4,
  },
  emptyNoticeBody: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: '#3C4F40',
    lineHeight: 18,
  },
  emptyFriendSummary: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#344738',
    maxWidth: 140,
  },
});
