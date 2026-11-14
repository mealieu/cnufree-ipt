import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { FriendAvailability } from '../types/dashboard';
import { SharedCalendarFriend } from '../types/sharedSchedule';
import {
  SAMPLE_FRIEND_MARIA_DEBORAH,
  MARIA_WEEKLY_SCHEDULE,
} from '../mock/dashboardData';
import {
  MOCK_TODAY_DATE,
  formatDateKey,
  findSharedFriendById,
  getChronologicalScheduleForDay,
  getWeekDaysForDate,
  formatWeekNavigationRange,
  SHARED_FRIEND_GROUPS,
  ChronologicalScheduleSlot,
} from '../mock/sharedScheduleData';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { TabId } from '../types/navigation';
import { styles } from './FriendScheduleScreen.styles';

export interface FriendScheduleScreenProps {
  friend?: FriendAvailability | SharedCalendarFriend | null;
  friendId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: TabId) => void;
  initialDate?: Date;
  sourceScreen?: 'shared' | 'home' | 'friends';
}

const HOUR_HEIGHT = 58;
const START_HOUR = 8.0;
const END_HOUR = 18.0;
const TOTAL_HOURS = END_HOUR - START_HOUR; // 10 hours

const TIMELINE_HOURS = [
  { hour: 8, label: '8 AM' },
  { hour: 9, label: '9 AM' },
  { hour: 10, label: '10 AM' },
  { hour: 11, label: '11 AM' },
  { hour: 12, label: '12 AM' }, // Matches exact Figma screenshot label "12 AM"
  { hour: 13, label: '1 PM' },
  { hour: 14, label: '2 PM' },
  { hour: 15, label: '3 PM' },
  { hour: 16, label: '4 PM' },
  { hour: 17, label: '5 PM' },
  { hour: 18, label: '6 PM' },
];

function formatHeaderDateTitle(date: Date): string {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const dayName = dayNames[date.getDay()];
  const monthName = monthNames[date.getMonth()];
  const dayNum = date.getDate();
  return `${dayName}, ${monthName} ${dayNum}`;
}

function formatHeaderDateSubtitle(date: Date): string {
  const isToday =
    date.getFullYear() === MOCK_TODAY_DATE.getFullYear() &&
    date.getMonth() === MOCK_TODAY_DATE.getMonth() &&
    date.getDate() === MOCK_TODAY_DATE.getDate();
  const year = date.getFullYear();
  return isToday ? `Today · ${year}` : `${year}`;
}

export const FriendScheduleScreen: React.FC<FriendScheduleScreenProps> = ({
  friend,
  friendId,
  onBack = () => console.log('Navigate back'),
  onNavigateTab,
  initialDate,
  sourceScreen = 'shared',
}) => {
  // Navigation & View Mode State
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialDate || MOCK_TODAY_DATE
  );
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const isWeekView = viewMode === 'week';

  // Resolve friend details
  const friendName =
    friend?.name ||
    (friend as any)?.displayName ||
    (friendId ? findSharedFriendById(friendId)?.name : null) ||
    'Ava Chen';

  const friendInitials =
    (friend as any)?.initials ||
    friendName
      .split(' ')
      .filter(Boolean)
      .map((w: string) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    'AC';

  const isPrivateSchedule =
    (friend as any)?.isPrivate === true ||
    (friend as any)?.scheduleState === 'privacy-restricted';
  const hasMissingSchedule =
    (friend as any)?.hasMissingSchedule === true ||
    (friend as any)?.scheduleState === 'missing';
  const isUnavailableData =
    (friend as any)?.isUnavailable === true ||
    (friend as any)?.scheduleState === 'unavailable';

  // SS-06 Interactive states
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<string>(
    (friend as any)?.lastChecked || (friend as any)?.errorMessage || 'sample error'
  );
  const [hasRequestedSchedule, setHasRequestedSchedule] = useState<boolean>(false);
  const [privateNoticeSlot, setPrivateNoticeSlot] =
    useState<ChronologicalScheduleSlot | null>(null);

  const handleRetryLoad = useCallback(() => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      setLastCheckedTime(`Checked at ${timeStr}: schedule service unreachable`);
    }, 700);
  }, []);

  const handleRequestSchedule = useCallback(() => {
    setHasRequestedSchedule(true);
  }, []);

  // Status Badge resolution
  const statusBadgeInfo = useMemo(() => {
    if (isUnavailableData) {
      return {
        text: 'Unavailable',
        type: 'unavailable',
      };
    }
    if (hasMissingSchedule) {
      return {
        text: 'Not shared',
        type: 'missing',
      };
    }
    if (isPrivateSchedule) {
      return {
        text: 'Availability only',
        type: 'privacy',
      };
    }
    return {
      text: 'Full schedule',
      type: 'full',
    };
  }, [isUnavailableData, hasMissingSchedule, isPrivateSchedule]);

  // Date and Week Range formatting
  const dateKey = formatDateKey(selectedDate);
  const weekDays = getWeekDaysForDate(selectedDate);
  const weekRange = formatWeekNavigationRange(selectedDate);

  const formattedDateTitle = isWeekView
    ? weekRange.main
    : formatHeaderDateTitle(selectedDate);

  const formattedDateSubtitle = isWeekView
    ? (weekRange.isCurrentWeek ? `This Week · ${weekRange.sub}` : `${weekRange.sub}`)
    : formatHeaderDateSubtitle(selectedDate);

  // Helper to fetch schedule slots for any date and friend
  const getSlotsForDate = useCallback(
    (targetDate: Date): ChronologicalScheduleSlot[] => {
      const targetDateKey = formatDateKey(targetDate);

      // 1. Direct SharedCalendarFriend
      if (friend && 'scheduleByDate' in friend) {
        return getChronologicalScheduleForDay(
          friend as SharedCalendarFriend,
          targetDateKey
        );
      }

      // 2. Lookup by id in shared groups
      const targetId =
        friendId || (friend && 'id' in friend ? (friend as any).id : undefined);
      if (targetId) {
        const match = findSharedFriendById(targetId);
        if (match) {
          return getChronologicalScheduleForDay(match, targetDateKey);
        }
      }

      // 3. Lookup by name in shared groups
      if (friend?.name) {
        for (const group of SHARED_FRIEND_GROUPS) {
          const match = group.members.find(
            (m) => m.name.toLowerCase() === friend.name.toLowerCase()
          );
          if (match) {
            return getChronologicalScheduleForDay(match, targetDateKey);
          }
        }
      }

      // 4. Maria Deborah or FriendAvailability with day-of-week schedule
      const dayOfWeek = targetDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const dayKey = dayKeys[dayOfWeek];

      const weeklyDay = MARIA_WEEKLY_SCHEDULE.find((d) => d.id === dayKey);
      if (weeklyDay && weeklyDay.items && weeklyDay.items.length > 0) {
        return weeklyDay.items.map((item, idx) => ({
          id: item.id || `slot-${dayKey}-${idx}`,
          title: item.title,
          startTime: item.startTime,
          endTime: item.endTime,
          timeRange: item.timeRange || `${item.startTime}–${item.endTime}`,
          startHour: item.startHour,
          endHour: item.endHour,
          room: item.room,
          isBusy: item.isBusy,
        }));
      }

      // 5. Fallback to Ava Chen
      const defaultAva = findSharedFriendById('shared-1');
      if (defaultAva) {
        return getChronologicalScheduleForDay(defaultAva, targetDateKey);
      }

      return [
        {
          id: `free-full-${targetDateKey}`,
          title: 'Free · 8:00 AM – 6:00 PM',
          startTime: '8:00 AM',
          endTime: '6:00 PM',
          timeRange: '8:00 AM – 6:00 PM',
          startHour: 8.0,
          endHour: 18.0,
          isBusy: false,
        },
      ];
    },
    [friend, friendId]
  );

  const chronologicalSlots = useMemo(
    () => getSlotsForDate(selectedDate),
    [getSlotsForDate, selectedDate]
  );

  // Navigation handlers
  const handlePrev = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - (isWeekView ? 7 : 1));
      return d;
    });
  };

  const handleNext = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + (isWeekView ? 7 : 1));
      return d;
    });
  };

  const handleToday = () => {
    setSelectedDate(MOCK_TODAY_DATE);
  };

  const handleSelectDayFromWeek = (targetDate: Date) => {
    setSelectedDate(targetDate);
    setViewMode('day');
  };

  const backTitle =
    sourceScreen === 'friends'
      ? 'Friends'
      : sourceScreen === 'home'
      ? 'Home'
      : 'Shared Tracker';

  const activeTab = sourceScreen || 'shared';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* Header: < Shared Tracker (or context title) */}
          <View style={styles.sharedHeaderRow}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.sharedBackButton}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel={`Back to ${backTitle}`}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15 19L8 12L15 5"
                  stroke="#1B271E"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.sharedBackTitle}>{backTitle}</Text>
          </View>

          {/* Profile Section: Avatar, Name, Subtitle, Full schedule badge */}
          <View style={styles.sharedProfileSection}>
            <View style={styles.sharedAvatarCircle}>
              <Text style={styles.sharedAvatarText}>{friendInitials}</Text>
            </View>

            <View style={styles.sharedProfileInfo}>
              <Text style={styles.sharedFriendName}>{friendName}</Text>
              <Text style={styles.sharedFriendSubtitle}>
                Individual schedule
              </Text>
            </View>

            {/* Status Badge (UI-31) */}
            {statusBadgeInfo.type !== 'full' ? (
              <View style={styles.sharedStatusBadgeAmber}>
                {statusBadgeInfo.type === 'privacy' && (
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                    <Rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      stroke="#5C4A15"
                      strokeWidth={2.4}
                    />
                    <Path
                      d="M7 11V7a5 5 0 0 1 10 0v4"
                      stroke="#5C4A15"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                    />
                  </Svg>
                )}
                {statusBadgeInfo.type === 'missing' && (
                  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke="#5C4A15" strokeWidth={2} />
                    <Path
                      d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"
                      stroke="#5C4A15"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
                {statusBadgeInfo.type === 'unavailable' && (
                  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke="#5C4A15" strokeWidth={2} />
                    <Path
                      d="M12 16v-4M12 8h.01"
                      stroke="#5C4A15"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                    />
                  </Svg>
                )}
                <Text style={styles.sharedStatusBadgeAmberText}>
                  {statusBadgeInfo.text}
                </Text>
              </View>
            ) : (
              <View style={styles.sharedStatusBadge}>
                <Svg
                  width={13}
                  height={13}
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ marginRight: 5 }}
                >
                  <Path
                    d="M3.5 8.5L6.5 11.5L12.5 4.5"
                    stroke="#1B271E"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.sharedStatusBadgeText}>
                  {statusBadgeInfo.text}
                </Text>
              </View>
            )}
          </View>

          {/* ========================================================= */}
          {/* STATE ROUTING (UI-31) */}
          {/* ========================================================= */}
          {isUnavailableData ? (
            /* ========================================================= */
            /* UI-31 UNAVAILABLE DATA STATE (MARCUS KIM) */
            /* ========================================================= */
            <View style={styles.centerStateContainer}>
              {/* Big Circular Info Icon */}
              <View style={styles.bigStateIconCircle}>
                <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" stroke="#48594C" strokeWidth={1.8} />
                  <Path
                    d="M12 16v-4M12 8h.01"
                    stroke="#48594C"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                  />
                </Svg>
              </View>

              {/* Title */}
              <Text style={styles.stateTitle}>
                Couldn't load {friendName}'s schedule
              </Text>

              {/* Subtitle */}
              <Text style={styles.stateSubtitle}>
                This isn't the same as being free. They aren't counted as available until it loads.
              </Text>

              {/* Unknown Availability Box */}
              <View style={styles.unknownAvailabilityCard}>
                <View style={styles.unknownAvailabilityHeaderRow}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke="#48594C" strokeWidth={2} />
                    <Path
                      d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"
                      stroke="#48594C"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <Text style={styles.unknownAvailabilityTitle}>
                    Unknown availability
                  </Text>
                </View>
                <Text style={styles.unknownAvailabilitySub}>
                  Last checked: {lastCheckedTime}
                </Text>
              </View>

              {/* Feedback Banner if retried */}
              {lastCheckedTime.includes('Checked at') && (
                <View style={styles.feedbackBanner}>
                  <Text style={styles.feedbackBannerText}>
                    Checked schedule server. Still temporarily unreachable.
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.stateActionsContainer}>
                <TouchableOpacity
                  style={styles.statePrimaryButton}
                  onPress={handleRetryLoad}
                  activeOpacity={0.8}
                  disabled={isRetrying}
                  accessibilityRole="button"
                  accessibilityLabel="Try again to load schedule"
                >
                  {isRetrying ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                        stroke="#FFFFFF"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <Path
                        d="M3 3v5h5"
                        stroke="#FFFFFF"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <Path
                        d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"
                        stroke="#FFFFFF"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <Path
                        d="M21 21v-5h-5"
                        stroke="#FFFFFF"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
                  <Text style={styles.statePrimaryButtonText}>
                    {isRetrying ? 'Checking...' : 'Try again'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.stateSecondaryButton}
                  onPress={onBack}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel="Back to Shared Tracker"
                >
                  <Text style={styles.stateSecondaryButtonText}>
                    Back to Shared Tracker
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : hasMissingSchedule ? (
            /* ========================================================= */
            /* UI-31 MISSING SCHEDULE STATE (PRIYA NAIR) */
            /* ========================================================= */
            <View style={styles.centerStateContainer}>
              {/* Big Circular Calendar Icon */}
              <View style={styles.bigStateIconCircle}>
                <Svg width={38} height={38} viewBox="0 0 24 24" fill="none">
                  <Rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="3"
                    stroke="#48594C"
                    strokeWidth={2}
                  />
                  <Path
                    d="M16 2v4M8 2v4M3 10h18"
                    stroke="#48594C"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </Svg>
              </View>

              {/* Title */}
              <Text style={styles.stateTitle}>
                {friendName} hasn't shared a schedule
              </Text>

              {/* Subtitle */}
              <Text style={styles.stateSubtitle}>
                We can't tell when {friendName} is free, so they aren't counted as available in the group.
              </Text>

              {/* Unknown Availability Box */}
              <View style={styles.unknownAvailabilityCard}>
                <View style={styles.unknownAvailabilityHeaderRow}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke="#48594C" strokeWidth={2} />
                    <Path
                      d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"
                      stroke="#48594C"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <Text style={styles.unknownAvailabilityTitle}>
                    Unknown availability
                  </Text>
                </View>
                <Text style={styles.unknownAvailabilitySub}>
                  Shown hatched, not free
                </Text>
              </View>

              {/* Feedback Banner if requested */}
              {hasRequestedSchedule && (
                <View style={styles.feedbackBanner}>
                  <Text style={styles.feedbackBannerText}>
                    ✓ Request sent to {friendName}! We'll notify you once they connect their schedule.
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.stateActionsContainer}>
                <TouchableOpacity
                  style={styles.statePrimaryButton}
                  onPress={handleRequestSchedule}
                  activeOpacity={0.8}
                  disabled={hasRequestedSchedule}
                  accessibilityRole="button"
                  accessibilityLabel={`Ask ${friendName} to share schedule`}
                >
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M22 2L11 13"
                      stroke="#FFFFFF"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M22 2L15 22L11 13L2 9L22 2Z"
                      stroke="#FFFFFF"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <Text style={styles.statePrimaryButtonText}>
                    {hasRequestedSchedule ? 'Schedule requested' : 'Ask to share schedule'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.stateSecondaryButton}
                  onPress={onBack}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel="Back to Shared Tracker"
                >
                  <Text style={styles.stateSecondaryButtonText}>
                    Back to Shared Tracker
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* ========================================================= */
            /* PRIVACY-RESTRICTED (CHLOE PARK) OR FULL SCHEDULE */
            /* ========================================================= */
            <>
              {/* Hairline Divider */}
              <View style={styles.sharedDividerLine} />

              {/* Date Navigation Row: Mon, Oct 19 / Today · 2026, [Today] [<] [>] */}
              <View style={styles.sharedDateNavRow}>
                <View>
                  <Text style={styles.sharedDateTitle}>{formattedDateTitle}</Text>
                  <Text style={styles.sharedDateSubtitle}>
                    {formattedDateSubtitle}
                  </Text>
                </View>

                <View style={styles.sharedDateNavControls}>
                  <TouchableOpacity
                    style={styles.sharedTodayButton}
                    onPress={handleToday}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Jump to today"
                  >
                    <Text style={styles.sharedTodayButtonText}>Today</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.sharedNavArrowButton}
                    onPress={handlePrev}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={isWeekView ? 'Previous week' : 'Previous day'}
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M15 18L9 12L15 6"
                        stroke="#172019"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.sharedNavArrowButton}
                    onPress={handleNext}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={isWeekView ? 'Next week' : 'Next day'}
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M9 6L15 12L9 18"
                        stroke="#172019"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Day / Week View Segmented Toggle (Matches Figma UI-30/31 screenshot) */}
              <View style={styles.sharedToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.sharedToggleOption,
                    !isWeekView && styles.sharedToggleOptionActive,
                  ]}
                  onPress={() => setViewMode('day')}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Day View"
                  accessibilityState={{ selected: !isWeekView }}
                >
                  <Text
                    style={[
                      styles.sharedToggleText,
                      !isWeekView
                        ? styles.sharedToggleTextActive
                        : styles.sharedToggleTextInactive,
                    ]}
                  >
                    Day
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sharedToggleOption,
                    isWeekView && styles.sharedToggleOptionActive,
                  ]}
                  onPress={() => setViewMode('week')}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Week View"
                  accessibilityState={{ selected: isWeekView }}
                >
                  <Text
                    style={[
                      styles.sharedToggleText,
                      isWeekView
                        ? styles.sharedToggleTextActive
                        : styles.sharedToggleTextInactive,
                    ]}
                  >
                    Week
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Privacy-Restricted Banner (UI-31 Chloe Park) */}
              {isPrivateSchedule && (
                <View style={styles.privacyBanner}>
                  <View style={styles.privacyIconBox}>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        stroke="#1A251D"
                        strokeWidth={2.2}
                      />
                      <Path
                        d="M7 11V7a5 5 0 0 1 10 0v4"
                        stroke="#1A251D"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                      />
                    </Svg>
                  </View>
                  <View style={styles.privacyTextCol}>
                    <Text style={styles.privacyTitle}>
                      {(friend as any)?.privacyNotice || `${friendName} limits what she shares`}
                    </Text>
                    <Text style={styles.privacySubtitle}>
                      {(friend as any)?.privacyNoticeSub ||
                        'You can see busy and free times. Titles and rooms are hidden.'}
                    </Text>
                  </View>
                </View>
              )}

              {/* View Rendering: Week View vs Day View */}
              {isWeekView ? (
                /* ========================================================= */
                /* WEEK VIEW: COMPLETE MONDAY–SUNDAY WEEKLY SCHEDULE */
                /* ========================================================= */
                <>
              {/* 1. Quick Day Strip across Monday–Sunday */}
              <View style={styles.weekQuickStripWrapper}>
                <View style={styles.weekQuickStrip}>
                  {weekDays.map((day) => {
                    const isSelected = day.dateKey === dateKey;
                    return (
                      <TouchableOpacity
                        key={day.dateKey}
                        style={[
                          styles.weekQuickTab,
                          isSelected && styles.weekQuickTabActive,
                          day.isToday && !isSelected && styles.weekQuickTabToday,
                        ]}
                        onPress={() => handleSelectDayFromWeek(day.date)}
                        activeOpacity={0.75}
                        accessibilityRole="button"
                        accessibilityLabel={`${day.fullLabel}, tap to view day`}
                      >
                        <Text
                          style={[
                            styles.weekQuickDayShort,
                            isSelected && styles.weekQuickDayShortActive,
                          ]}
                        >
                          {day.dayShort}
                        </Text>
                        <Text style={styles.weekQuickDayNumber}>
                          {day.dayNumber}
                        </Text>
                        {day.isToday && (
                          <View style={styles.weekQuickTodayDot} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 2. Horizontally-scrollable 7-Day Timetable Grid */}
              <View style={styles.weekCalendarBox}>
                {/* Left Column: Fixed Time Axis */}
                <View style={styles.weekTimeAxisCol}>
                  <View style={styles.weekTimeAxisSpacer}>
                    <Text style={styles.weekTimeAxisSpacerText}>TIME</Text>
                  </View>
                  <View
                    style={[
                      styles.weekTimeAxisItemsContainer,
                      { height: TOTAL_HOURS * HOUR_HEIGHT },
                    ]}
                  >
                    {TIMELINE_HOURS.map((item, index) => (
                      <View
                        key={item.hour}
                        style={[
                          styles.timeAxisItem,
                          { top: index * HOUR_HEIGHT - 7, left: 4 },
                        ]}
                      >
                        <Text style={styles.timeAxisLabel}>{item.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Horizontal Scroll Area: 7 Columns for Mon - Sun */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.weekHorizontalScrollView}
                >
                  <View style={styles.weekDaysContainer}>
                    {weekDays.map((day) => {
                      const isSelected = day.dateKey === dateKey;
                      const daySlots = getSlotsForDate(day.date);

                      return (
                        <View key={day.dateKey} style={styles.weekDayColumn}>
                          {/* Column Header (tap to open day view) */}
                          <TouchableOpacity
                            style={[
                              styles.weekDayColHeader,
                              isSelected && styles.weekDayColHeaderActive,
                            ]}
                            onPress={() => handleSelectDayFromWeek(day.date)}
                            activeOpacity={0.75}
                            accessibilityRole="button"
                            accessibilityLabel={`Open Day View for ${day.fullLabel}`}
                          >
                            <Text
                              style={[
                                styles.weekDayColShortText,
                                isSelected && styles.weekDayColShortTextActive,
                              ]}
                            >
                              {day.dayShort}
                            </Text>
                            <Text
                              style={[
                                styles.weekDayColNumText,
                                isSelected && styles.weekDayColNumTextActive,
                              ]}
                            >
                              {day.dayNumber}
                            </Text>
                            {day.isToday && (
                              <View style={styles.weekQuickTodayDot} />
                            )}
                          </TouchableOpacity>

                          {/* Column Schedule Blocks */}
                          <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => handleSelectDayFromWeek(day.date)}
                            style={[
                              styles.weekDayGridContent,
                              { height: TOTAL_HOURS * HOUR_HEIGHT },
                            ]}
                          >
                            {/* Hour grid lines */}
                            {TIMELINE_HOURS.map((item, index) => (
                              <View
                                key={`grid-${day.dateKey}-${item.hour}`}
                                style={[
                                  styles.gridLine,
                                  { top: index * HOUR_HEIGHT },
                                ]}
                              />
                            ))}

                            {/* Chronological blocks for this day */}
                            {daySlots.map((item) => {
                              const clampedStart = Math.max(
                                START_HOUR,
                                item.startHour
                              );
                              const clampedEnd = Math.min(
                                END_HOUR,
                                item.endHour
                              );
                              const duration = Math.max(
                                0.5,
                                clampedEnd - clampedStart
                              );
                              const blockTop =
                                (clampedStart - START_HOUR) * HOUR_HEIGHT + 2;
                              const blockHeight =
                                duration * HOUR_HEIGHT - 4;

                              if (item.isBusy) {
                                if (isPrivateSchedule || item.isPrivate) {
                                  return (
                                    <TouchableOpacity
                                      key={item.id}
                                      style={[
                                        styles.weekBusyBlock,
                                        {
                                          top: blockTop,
                                          height: blockHeight,
                                          backgroundColor: '#D9DDE2',
                                          borderLeftColor: '#4B5563',
                                        },
                                      ]}
                                      onPress={() => setPrivateNoticeSlot(item)}
                                      activeOpacity={0.8}
                                      accessibilityLabel="Busy (Private Event)"
                                    >
                                      <View
                                        style={{
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                          gap: 3,
                                        }}
                                      >
                                        <Svg
                                          width={9}
                                          height={9}
                                          viewBox="0 0 24 24"
                                          fill="none"
                                        >
                                          <Rect
                                             x="3"
                                             y="11"
                                             width="18"
                                             height="11"
                                             rx="2"
                                             stroke="#172019"
                                             strokeWidth={2.4}
                                          />
                                          <Path
                                             d="M7 11V7a5 5 0 0 1 10 0v4"
                                             stroke="#172019"
                                             strokeWidth={2.4}
                                             strokeLinecap="round"
                                          />
                                        </Svg>
                                        <Text
                                          style={styles.weekBusyTitle}
                                          numberOfLines={1}
                                        >
                                          Busy
                                        </Text>
                                      </View>
                                      <Text
                                        style={styles.weekBusyTime}
                                        numberOfLines={1}
                                      >
                                        {item.timeRange ||
                                          `${item.startTime}–${item.endTime}`}
                                      </Text>
                                    </TouchableOpacity>
                                  );
                                }

                                return (
                                  <TouchableOpacity
                                    key={item.id}
                                    style={[
                                      styles.weekBusyBlock,
                                      {
                                        top: blockTop,
                                        height: blockHeight,
                                      },
                                    ]}
                                    onPress={() =>
                                      handleSelectDayFromWeek(day.date)
                                    }
                                    activeOpacity={0.8}
                                  >
                                    <Text
                                      style={styles.weekBusyTitle}
                                      numberOfLines={1}
                                    >
                                      {item.title}
                                    </Text>
                                    <Text
                                      style={styles.weekBusyTime}
                                      numberOfLines={1}
                                    >
                                      {item.timeRange ||
                                        `${item.startTime}–${item.endTime}`}
                                    </Text>
                                    {item.room && (
                                      <Text
                                        style={styles.weekBusyRoom}
                                        numberOfLines={1}
                                      >
                                        {item.room}
                                      </Text>
                                    )}
                                  </TouchableOpacity>
                                );
                              }

                              return (
                                <TouchableOpacity
                                  key={item.id}
                                  style={[
                                    styles.weekFreeBlock,
                                    {
                                      top: blockTop,
                                      height: blockHeight,
                                    },
                                  ]}
                                  onPress={() =>
                                    handleSelectDayFromWeek(day.date)
                                  }
                                  activeOpacity={0.8}
                                >
                                  <View style={styles.weekFreeContentRow}>
                                    <Svg
                                      width={10}
                                      height={10}
                                      viewBox="0 0 16 16"
                                      fill="none"
                                    >
                                      <Path
                                        d="M3.5 8.5L6.5 11.5L12.5 4.5"
                                        stroke="#2C3A2E"
                                        strokeWidth={2.4}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </Svg>
                                    <Text
                                      style={styles.weekFreeText}
                                      numberOfLines={1}
                                    >
                                      Free
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </>
          ) : (
            /* ========================================================= */
            /* DAY VIEW: DAILY CHRONOLOGICAL TIMELINE (FIGMA UI-30) */
            /* ========================================================= */
            <View style={styles.timelineBox}>
              {/* Left Column: Vertical Time Axis */}
              <View style={styles.timeAxisColumn}>
                {TIMELINE_HOURS.map((item, index) => (
                  <View
                    key={item.hour}
                    style={[
                      styles.timeAxisItem,
                      { top: index * HOUR_HEIGHT - 7 },
                    ]}
                  >
                    <Text style={styles.timeAxisLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>

              {/* Right Column: Grid Lines and Blocks */}
              <View
                style={[
                  styles.scheduleGridArea,
                  { height: TOTAL_HOURS * HOUR_HEIGHT },
                ]}
              >
                {TIMELINE_HOURS.map((item, index) => (
                  <View
                    key={`line-${item.hour}`}
                    style={[styles.gridLine, { top: index * HOUR_HEIGHT }]}
                  />
                ))}

                {chronologicalSlots.map((item) => {
                  const clampedStart = Math.max(START_HOUR, item.startHour);
                  const clampedEnd = Math.min(END_HOUR, item.endHour);
                  const duration = Math.max(0.5, clampedEnd - clampedStart);
                  const blockTop =
                    (clampedStart - START_HOUR) * HOUR_HEIGHT + 2;
                  const blockHeight = duration * HOUR_HEIGHT - 4;

                  if (item.isBusy) {
                    if (isPrivateSchedule || item.isPrivate) {
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.sharedBusyPrivateBlock,
                            {
                              top: blockTop,
                              height: blockHeight,
                            },
                          ]}
                          onPress={() => setPrivateNoticeSlot(item)}
                          activeOpacity={0.8}
                          accessibilityLabel="Busy (Private Event)"
                        >
                          <View style={styles.sharedBusyPrivateTopRow}>
                            <View style={styles.sharedBusyPrivateLeftRow}>
                              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                <Rect
                                  x="3"
                                  y="11"
                                  width="18"
                                  height="11"
                                  rx="2"
                                  stroke="#172019"
                                  strokeWidth={2.4}
                                />
                                <Path
                                  d="M7 11V7a5 5 0 0 1 10 0v4"
                                  stroke="#172019"
                                  strokeWidth={2.4}
                                  strokeLinecap="round"
                                />
                              </Svg>
                              <Text style={styles.sharedBusyPrivateTitle}>
                                Busy
                              </Text>
                            </View>
                            <Text style={styles.sharedBusyPrivateTimeRange}>
                              {item.timeRange ||
                                `${item.startTime}–${item.endTime}`}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    }

                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.sharedBusyBlock,
                          {
                            top: blockTop,
                            height: blockHeight,
                          },
                        ]}
                      >
                        <View style={styles.sharedBusyTopRow}>
                          <Text
                            style={styles.sharedBusyTitle}
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>
                          <Text style={styles.sharedBusyTimeRange}>
                            {item.timeRange ||
                              `${item.startTime}–${item.endTime}`}
                          </Text>
                        </View>
                        {item.room && (
                          <Text
                            style={styles.sharedBusyRoom}
                            numberOfLines={1}
                          >
                            {item.room}
                          </Text>
                        )}
                      </View>
                    );
                  }

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.sharedFreeBlock,
                        {
                          top: blockTop,
                          height: blockHeight,
                        },
                      ]}
                    >
                      <View style={styles.sharedFreeContentRow}>
                        <Svg
                          width={14}
                          height={14}
                          viewBox="0 0 16 16"
                          fill="none"
                          style={styles.sharedFreeCheckIcon}
                        >
                          <Path
                            d="M3.5 8.5L6.5 11.5L12.5 4.5"
                            stroke="#2C3A2E"
                            strokeWidth={2.2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                        <Text
                          style={styles.sharedFreeText}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </>
      )}
        </View>
      </ScrollView>

      {/* Privacy Notice Detail Modal (UI-31) */}
      <Modal
        visible={!!privateNoticeSlot}
        transparent
        animationType="fade"
        onRequestClose={() => setPrivateNoticeSlot(null)}
      >
        <Pressable
          style={styles.privacyModalOverlay}
          onPress={() => setPrivateNoticeSlot(null)}
        >
          <Pressable style={styles.privacyModalContainer}>
            <View style={styles.privacyModalHeader}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                  stroke="#1A251D"
                  strokeWidth={2.2}
                />
                <Path
                  d="M7 11V7a5 5 0 0 1 10 0v4"
                  stroke="#1A251D"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={styles.privacyModalTitle}>Privacy-Restricted Event</Text>
            </View>
            <Text style={styles.privacyModalBody}>
              {friendName} has set their schedule privacy to "Availability only". Event titles, room locations, and course codes are hidden to protect privacy.
            </Text>
            <TouchableOpacity
              style={styles.privacyModalCloseBtn}
              onPress={() => setPrivateNoticeSlot(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.privacyModalCloseBtnText}>Got it</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Bottom Nav Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === activeTab) {
            onBack?.();
          } else {
            onNavigateTab?.(tab);
          }
        }}
        notificationBadgeCount={0}
      />
    </SafeAreaView>
  );
};
