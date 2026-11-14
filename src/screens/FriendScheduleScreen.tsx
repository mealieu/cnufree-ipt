import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
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

  const isPrivateSchedule = (friend as any)?.isPrivate === true;
  const hasMissingSchedule = (friend as any)?.hasMissingSchedule === true;

  const statusBadgeText = hasMissingSchedule
    ? 'No schedule'
    : isPrivateSchedule
      ? 'Partial schedule'
      : 'Full schedule';

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

          {/* Day / Week View Segmented Toggle (Matches Figma UI-30 screenshot) */}
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
                {friendName} has not uploaded or connected their schedule yet.
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
