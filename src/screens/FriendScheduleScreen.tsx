import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { FriendAvailability, FriendScheduleItem } from '../types/dashboard';
import { SharedCalendarFriend } from '../types/sharedSchedule';
import { COLORS } from '../constants/colors';
import { UserAvatarSilhouette } from '../components/icons/NavIcons';
import {
  SAMPLE_FRIEND_MARIA_DEBORAH,
  DayScheduleTab,
  getWeeklySchedule,
} from '../mock/dashboardData';
import {
  MOCK_TODAY_DATE,
  formatDateKey,
  findSharedFriendById,
  getChronologicalScheduleForDay,
  getWeekDaysForDate,
  formatWeekNavigationRange,
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
  sourceScreen,
}) => {
  // Check if opened from Shared Tracker (SS-05 / UI-30)
  const isFromSharedTracker = sourceScreen === 'shared';

  // Date state for Shared Tracker navigation
  const [sharedDate, setSharedDate] = useState<Date>(
    initialDate || MOCK_TODAY_DATE
  );
  const [sharedViewMode, setSharedViewMode] = useState<'day' | 'week'>('day');

  // Resolve Shared Friend by object or unique identifier (SS-05)
  const sharedFriend: SharedCalendarFriend | undefined = useMemo(() => {
    if (!isFromSharedTracker) return undefined;
    if (friend && 'scheduleByDate' in friend) {
      return friend as SharedCalendarFriend;
    }
    const targetId = friendId || (friend && 'id' in friend ? friend.id : undefined);
    if (targetId) {
      return findSharedFriendById(targetId);
    }
    return undefined;
  }, [isFromSharedTracker, friend, friendId]);

  // Fallback to Maria Deborah sample if friend is not provided for standard Home/Friends view
  const activeFriend: FriendAvailability = useMemo(() => {
    return (friend as FriendAvailability) ?? SAMPLE_FRIEND_MARIA_DEBORAH;
  }, [friend]);

  // State for view controls (Daily vs Weekly) - Defaults to 'weekly' to match Figma screenshot exactly
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('weekly');

  // State for week navigation offset (0 = current week displayed in Figma mockup)
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // State for selected day selector tab (defaults to 'tue' as highlighted in Figma reference)
  const [selectedDayId, setSelectedDayId] = useState<string>('tue');

  // State for active bottom navigation tab (defaults to 'home' as highlighted in Figma reference)
  const [activeNavTab, setActiveNavTab] = useState<TabId>('home');

  // Dynamic weekly schedule based on current weekOffset
  const currentWeekSchedule = useMemo(() => {
    return getWeeklySchedule(weekOffset);
  }, [weekOffset]);

  // Find the selected day configuration within the current week
  const activeDayConfig: DayScheduleTab = useMemo(() => {
    return (
      currentWeekSchedule.days.find((d) => d.id === selectedDayId) ||
      currentWeekSchedule.days[1] // Default to Tuesday
    );
  }, [currentWeekSchedule, selectedDayId]);

  // Schedule items for the active day:
  // If a custom friend (not Maria Deborah) was passed with a custom schedule, preserve it on Tuesday of week 0;
  // otherwise, render the active day's rich timetable.
  const scheduleItems: FriendScheduleItem[] = useMemo(() => {
    if (
      weekOffset === 0 &&
      selectedDayId === 'tue' &&
      activeFriend.id !== SAMPLE_FRIEND_MARIA_DEBORAH.id &&
      activeFriend.schedule &&
      activeFriend.schedule.length > 0
    ) {
      return activeFriend.schedule;
    }
    return activeDayConfig.items;
  }, [activeFriend, activeDayConfig, weekOffset, selectedDayId]);

  // Dynamic header title: "Agna's schedule" or "<nickname>'s schedule"
  const headerTitle = useMemo(() => {
    if (activeFriend.nickname) {
      return `${activeFriend.nickname}’s schedule`;
    }
    const firstName = activeFriend.name ? activeFriend.name.split(' ')[0] : 'Agna';
    return `${firstName}’s schedule`;
  }, [activeFriend]);

  // Friend subtitle: e.g. "DYD Friend"
  const friendSubtitle = useMemo(() => {
    if (activeFriend.relationship) {
      return activeFriend.relationship;
    }
    if (activeFriend.groups?.includes('dyd')) return 'DYD Friend';
    if (activeFriend.groups?.includes('bora')) return 'Bora Friend';
    if (activeFriend.groups?.includes('courtside')) return 'Court Side Friend';
    return 'DYD Friend';
  }, [activeFriend]);

  // Handlers for week navigation
  const handlePrevWeek = useCallback(() => {
    setWeekOffset((prev) => prev - 1);
  }, []);

  const handleNextWeek = useCallback(() => {
    setWeekOffset((prev) => prev + 1);
  }, []);

  // Handlers for daily navigation in daily view mode
  const handlePrevDay = useCallback(() => {
    const days = currentWeekSchedule.days;
    const currentIndex = days.findIndex((d) => d.id === selectedDayId);
    if (currentIndex > 0) {
      setSelectedDayId(days[currentIndex - 1].id);
    } else {
      // Step to Sunday of previous week
      setWeekOffset((prev) => prev - 1);
      setSelectedDayId('sun');
    }
  }, [currentWeekSchedule, selectedDayId]);

  const handleNextDay = useCallback(() => {
    const days = currentWeekSchedule.days;
    const currentIndex = days.findIndex((d) => d.id === selectedDayId);
    if (currentIndex < days.length - 1) {
      setSelectedDayId(days[currentIndex + 1].id);
    } else {
      // Step to Monday of next week
      setWeekOffset((prev) => prev + 1);
      setSelectedDayId('mon');
    }
  }, [currentWeekSchedule, selectedDayId]);

  // =========================================================================
  // SS-05 (UI-30): INDIVIDUAL FRIEND SCHEDULE FROM SHARED TRACKER
  // =========================================================================
  if (isFromSharedTracker) {
    if (!sharedFriend) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="dark" />
          <View style={styles.contentContainer}>
            <View style={styles.sharedHeaderRow}>
              <TouchableOpacity
                onPress={onBack}
                style={styles.sharedBackButton}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Back to Shared Tracker"
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
              <Text style={styles.sharedBackTitle}>Shared Tracker</Text>
            </View>

            <View style={styles.sharedUnavailableContainer}>
              <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="10" stroke="#5C6B5F" strokeWidth={1.8} />
                <Path
                  d="M12 8v5M12 16h.01"
                  stroke="#5C6B5F"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={styles.sharedUnavailableTitle}>
                Friend Schedule Unavailable
              </Text>
              <Text style={styles.sharedUnavailableText}>
                We could not find schedule details for this friend in the shared calendar.
              </Text>
              <TouchableOpacity
                style={styles.sharedReturnButton}
                onPress={onBack}
                activeOpacity={0.75}
              >
                <Text style={styles.sharedReturnButtonText}>
                  Return to Shared Tracker
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <BottomNavBar
            activeTab="shared"
            onTabChange={(tab) => {
              if (tab === 'shared') {
                onBack?.();
              } else {
                onNavigateTab?.(tab);
              }
            }}
            notificationBadgeCount={0}
          />
        </SafeAreaView>
      );
    }

    const isWeekView = sharedViewMode === 'week';
    const sharedDateKey = formatDateKey(sharedDate);
    const weekDays = getWeekDaysForDate(sharedDate);
    const weekRange = formatWeekNavigationRange(sharedDate);

    const formattedDateTitle = isWeekView
      ? weekRange.main
      : formatHeaderDateTitle(sharedDate);

    const formattedDateSubtitle = isWeekView
      ? (weekRange.isCurrentWeek ? `This Week · ${weekRange.sub}` : `${weekRange.sub}`)
      : formatHeaderDateSubtitle(sharedDate);

    const chronologicalSlots = getChronologicalScheduleForDay(
      sharedFriend,
      sharedDateKey
    );

    const hasMissingSchedule = sharedFriend.hasMissingSchedule === true;
    const isPrivateSchedule = sharedFriend.isPrivate === true;

    const statusBadgeText = hasMissingSchedule
      ? 'No schedule'
      : isPrivateSchedule
        ? 'Partial schedule'
        : 'Full schedule';

    // Previous/next handlers: steps 1 day in Day View, 1 week in Week View
    const handleSharedPrev = () => {
      setSharedDate((prev) => {
        const d = new Date(prev);
        d.setDate(d.getDate() - (isWeekView ? 7 : 1));
        return d;
      });
    };

    const handleSharedNext = () => {
      setSharedDate((prev) => {
        const d = new Date(prev);
        d.setDate(d.getDate() + (isWeekView ? 7 : 1));
        return d;
      });
    };

    const handleSharedToday = () => {
      setSharedDate(MOCK_TODAY_DATE);
    };

    const handleSelectDayFromWeek = (targetDate: Date) => {
      setSharedDate(targetDate);
      setSharedViewMode('day');
    };

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            {/* Header: < Shared Tracker */}
            <View style={styles.sharedHeaderRow}>
              <TouchableOpacity
                onPress={onBack}
                style={styles.sharedBackButton}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Back to Shared Tracker"
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
              <Text style={styles.sharedBackTitle}>Shared Tracker</Text>
            </View>

            {/* Profile Section: Avatar, Name, Subtitle, Full schedule pill */}
            <View style={styles.sharedProfileSection}>
              <View style={styles.sharedAvatarCircle}>
                <Text style={styles.sharedAvatarText}>
                  {sharedFriend.initials ||
                    sharedFriend.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>

              <View style={styles.sharedProfileInfo}>
                <Text style={styles.sharedFriendName}>{sharedFriend.name}</Text>
                <Text style={styles.sharedFriendSubtitle}>
                  Individual schedule
                </Text>
              </View>

              <View style={styles.sharedStatusBadge}>
                {!hasMissingSchedule && !isPrivateSchedule && (
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
                )}
                {isPrivateSchedule && (
                  <Svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ marginRight: 5 }}
                  >
                    <Rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      stroke="#1B271E"
                      strokeWidth={2.2}
                    />
                    <Path
                      d="M7 11V7a5 5 0 0 1 10 0v4"
                      stroke="#1B271E"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                    />
                  </Svg>
                )}
                <Text style={styles.sharedStatusBadgeText}>
                  {statusBadgeText}
                </Text>
              </View>
            </View>

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
                  onPress={handleSharedToday}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Jump to today"
                >
                  <Text style={styles.sharedTodayButtonText}>Today</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sharedNavArrowButton}
                  onPress={handleSharedPrev}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={isWeekView ? 'Previous week' : 'Previous day'}
                >
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M15 19L8 12L15 5"
                      stroke="#1B271E"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sharedNavArrowButton}
                  onPress={handleSharedNext}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={isWeekView ? 'Next week' : 'Next day'}
                >
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M9 5L16 12L9 19"
                      stroke="#1B271E"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </TouchableOpacity>
              </View>
            </View>

            {/* Day / Week View Segmented Toggle (Matches Figma screenshot) */}
            <View style={styles.sharedToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.sharedToggleOption,
                  !isWeekView && styles.sharedToggleOptionActive,
                ]}
                onPress={() => setSharedViewMode('day')}
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
                onPress={() => setSharedViewMode('week')}
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

            {/* Missing Schedule Empty State */}
            {hasMissingSchedule ? (
              <View style={styles.sharedUnavailableContainer}>
                <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                  <Circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#5C6B5F"
                    strokeWidth={1.8}
                  />
                  <Path
                    d="M12 8v5M12 16h.01"
                    stroke="#5C6B5F"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </Svg>
                <Text style={styles.sharedUnavailableTitle}>
                  No Schedule Available
                </Text>
                <Text style={styles.sharedUnavailableText}>
                  {sharedFriend.name} has not uploaded or connected their
                  schedule yet.
                </Text>
              </View>
            ) : isWeekView ? (
              /* ========================================================= */
              /* WEEK VIEW: COMPLETE MONDAY–SUNDAY WEEKLY SCHEDULE */
              /* ========================================================= */
              <>
                {/* 1. Quick Day Strip across Monday–Sunday */}
                <View style={styles.weekQuickStripWrapper}>
                  <View style={styles.weekQuickStrip}>
                    {weekDays.map((day) => {
                      const isSelected = day.dateKey === sharedDateKey;
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
                        const isSelected = day.dateKey === sharedDateKey;
                        const daySlots = getChronologicalScheduleForDay(
                          sharedFriend,
                          day.dateKey
                        );

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
          </View>
        </ScrollView>

        {/* Bottom Nav Bar */}
        <BottomNavBar
          activeTab="shared"
          onTabChange={(tab) => {
            if (tab === 'shared') {
              onBack?.();
            } else {
              onNavigateTab?.(tab);
            }
          }}
          notificationBadgeCount={0}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* ================= 1. HEADER SECTION (Figma Reference) ================= */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Back to Previous Screen"
            >
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15 19L8 12L15 5"
                  stroke="#172019"
                  strokeWidth={2.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>{headerTitle}</Text>
          </View>

          {/* ================= 2. PROFILE SECTION (Figma Reference) ================= */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <UserAvatarSilhouette size={72} color="#5F6F7E" bgColor="#DEE5ED" />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.friendName}>{activeFriend.name || 'Maria Deborah'}</Text>
              <Text style={styles.friendSubtitle}>{friendSubtitle}</Text>
            </View>
          </View>

          {/* ================= 3. DATE DISPLAY & VIEW CONTROLS ================= */}
          {/* Currently selected full date */}
          <Text style={styles.dateDisplay}>{activeDayConfig.fullDate}</Text>

          {/* Pill-shaped toggle switch for "Daily" and "Weekly" views */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                viewMode === 'daily' && styles.toggleOptionActive,
              ]}
              onPress={() => setViewMode('daily')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Daily Schedule View"
              accessibilityState={{ selected: viewMode === 'daily' }}
            >
              <Text
                style={[
                  styles.toggleText,
                  viewMode === 'daily'
                    ? styles.toggleTextActive
                    : styles.toggleTextInactive,
                ]}
              >
                Daily
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleOption,
                viewMode === 'weekly' && styles.toggleOptionActive,
              ]}
              onPress={() => setViewMode('weekly')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Weekly Schedule View"
              accessibilityState={{ selected: viewMode === 'weekly' }}
            >
              <Text
                style={[
                  styles.toggleText,
                  viewMode === 'weekly'
                    ? styles.toggleTextActive
                    : styles.toggleTextInactive,
                ]}
              >
                Weekly
              </Text>
            </TouchableOpacity>
          </View>

          {/* ================= 4. NAVIGATION BANNER ================= */}
          {/* When in Weekly view: Dark Green Weekly Navigation Banner with < [ Sunday, October 25,2026 ] > */}
          {/* When in Daily view: Interactive Day Stepper Banner */}
          {viewMode === 'weekly' ? (
            <View style={styles.weeklyBanner}>
              <TouchableOpacity
                style={styles.bannerArrowBtn}
                onPress={handlePrevWeek}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Previous Week"
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M15 19L8 12L15 5"
                    stroke={COLORS.weeklyBannerArrow}
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>

              <View style={styles.weeklyIndicatorPill}>
                <Text style={styles.weeklyIndicatorText}>
                  {currentWeekSchedule.weekIndicator}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.bannerArrowBtn}
                onPress={handleNextWeek}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Next Week"
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M9 5L16 12L9 19"
                    stroke={COLORS.weeklyBannerArrow}
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.weeklyBanner}>
              <TouchableOpacity
                style={styles.bannerArrowBtn}
                onPress={handlePrevDay}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Previous Day"
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M15 19L8 12L15 5"
                    stroke={COLORS.weeklyBannerArrow}
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>

              <View style={styles.weeklyIndicatorPill}>
                <Text style={styles.weeklyIndicatorText}>
                  {activeDayConfig.fullDate}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.bannerArrowBtn}
                onPress={handleNextDay}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Next Day"
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M9 5L16 12L9 19"
                    stroke={COLORS.weeklyBannerArrow}
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>
          )}

          {/* ================= 5. DAY SELECTOR TABS ================= */}
          <View style={styles.dayTabsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayTabsScroll}
            >
              {currentWeekSchedule.days.map((tab) => {
                const isActive = tab.id === selectedDayId;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.dayTab, isActive && styles.dayTabActive]}
                    onPress={() => setSelectedDayId(tab.id)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`${tab.dayAbbrev} ${tab.dayNumber}`}
                    accessibilityState={{ selected: isActive }}
                  >
                    <Text
                      style={[
                        styles.dayAbbrevText,
                        isActive && styles.dayAbbrevTextActive,
                      ]}
                    >
                      {tab.dayAbbrev}
                    </Text>
                    <Text
                      style={[
                        styles.dayNumberText,
                        isActive && styles.dayNumberTextActive,
                      ]}
                    >
                      {tab.dayNumber}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ================= 6. CHRONOLOGICAL TIME BLOCKS (TIMELINE CONTAINER) ================= */}
          <View style={styles.timelineBox}>
            {/* Left Column: Vertical Time Axis (8 AM down to 6 PM) */}
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

            {/* Right Column: Grid Lines and Chronological Time Blocks */}
            <View
              style={[
                styles.scheduleGridArea,
                { height: TOTAL_HOURS * HOUR_HEIGHT },
              ]}
            >
              {/* Horizontal Grid Lines */}
              {TIMELINE_HOURS.map((item, index) => (
                <View
                  key={`line-${item.hour}`}
                  style={[styles.gridLine, { top: index * HOUR_HEIGHT }]}
                />
              ))}

              {/* Chronologically Positioned Time Blocks */}
              {scheduleItems.map((item) => {
                const clampedStart = Math.max(START_HOUR, item.startHour);
                const clampedEnd = Math.min(END_HOUR, item.endHour);
                const duration = Math.max(0.5, clampedEnd - clampedStart);

                const blockTop = (clampedStart - START_HOUR) * HOUR_HEIGHT + 2;
                const blockHeight = duration * HOUR_HEIGHT - 4;

                if (item.isBusy) {
                  /* Busy/Class Time Block */
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.busyBlock,
                        {
                          top: blockTop,
                          height: blockHeight,
                        },
                      ]}
                    >
                      <View style={styles.busyTopRow}>
                        <Text style={styles.busyTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.busyTimeRange}>
                          {item.timeRange ||
                            `${item.startTime}–${item.endTime}`}
                        </Text>
                      </View>
                      {item.room && (
                        <Text style={styles.busyRoom} numberOfLines={1}>
                          {item.room}
                        </Text>
                      )}
                    </View>
                  );
                }

                /* Free Time Block */
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.freeBlock,
                      {
                        top: blockTop,
                        height: blockHeight,
                      },
                    ]}
                  >
                    <View style={styles.freeContentRow}>
                      <Svg
                        width={14}
                        height={14}
                        viewBox="0 0 16 16"
                        fill="none"
                        style={styles.freeCheckIcon}
                      >
                        <Path
                          d="M3.5 8.5L6.5 11.5L12.5 4.5"
                          stroke="#2C3A2E"
                          strokeWidth={2.2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                      <Text style={styles.freeText} numberOfLines={1}>
                        {item.title.startsWith('Free')
                          ? item.title
                          : `Free - ${item.startTime} - ${item.endTime}`}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ================= 7. BOTTOM NAVIGATION BAR (Figma Reference) ================= */}
      <BottomNavBar
        activeTab={activeNavTab}
        onTabChange={(tab) => {
          setActiveNavTab(tab);
          if (tab === 'home' && onBack) {
            onBack();
          }
        }}
        notificationBadgeCount={0}
      />
    </SafeAreaView>
  );
};
