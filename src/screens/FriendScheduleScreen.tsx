import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { FriendAvailability, FriendScheduleItem } from '../types/dashboard';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';
import { UserAvatarSilhouette } from '../components/icons/NavIcons';
import {
  MARIA_WEEKLY_SCHEDULE,
  SAMPLE_FRIEND_MARIA_DEBORAH,
  DayScheduleTab,
} from '../mock/dashboardData';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { TabId } from '../types/navigation';

interface FriendScheduleScreenProps {
  friend?: FriendAvailability;
  onBack?: () => void;
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
  { hour: 12, label: '12 AM' }, // Matches Figma screenshot label "12 AM"
  { hour: 13, label: '1 PM' },
  { hour: 14, label: '2 PM' },
  { hour: 15, label: '3 PM' },
  { hour: 16, label: '4 PM' },
  { hour: 17, label: '5 PM' },
  { hour: 18, label: '6 PM' },
];

export const FriendScheduleScreen: React.FC<FriendScheduleScreenProps> = ({
  friend = SAMPLE_FRIEND_MARIA_DEBORAH,
  onBack = () => console.log('Navigate back'),
}) => {
  // State for view controls (Daily vs Weekly)
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  // State for selected day selector tab (defaults to 'tue' as in the Figma reference)
  const [selectedDayId, setSelectedDayId] = useState<string>('tue');

  // State for active bottom navigation tab (defaults to 'home' as highlighted in Figma reference)
  const [activeNavTab, setActiveNavTab] = useState<TabId>('home');

  // Find the selected day config from weekly schedule
  const activeDayConfig = useMemo(() => {
    return (
      MARIA_WEEKLY_SCHEDULE.find((d) => d.id === selectedDayId) ||
      MARIA_WEEKLY_SCHEDULE[1]
    );
  }, [selectedDayId]);

  // Items for the current day:
  // If the passed friend is NOT Maria Deborah and has a custom schedule, use it on Tuesday,
  // otherwise use the active day's multi-day mock schedule.
  const scheduleItems: FriendScheduleItem[] = useMemo(() => {
    if (
      friend.id !== SAMPLE_FRIEND_MARIA_DEBORAH.id &&
      friend.schedule &&
      friend.schedule.length > 0 &&
      selectedDayId === 'tue'
    ) {
      return friend.schedule;
    }
    return activeDayConfig.items;
  }, [friend, activeDayConfig, selectedDayId]);

  // Dynamic header title: "Agna's schedule" or "<nickname>'s schedule"
  const headerTitle = useMemo(() => {
    if (friend.nickname) {
      return `${friend.nickname}’s schedule`;
    }
    const firstName = friend.name ? friend.name.split(' ')[0] : 'Agna';
    return `${firstName}’s schedule`;
  }, [friend]);

  // Friend subtitle: e.g. "DYD Friend"
  const friendSubtitle = useMemo(() => {
    if (friend.relationship) {
      return friend.relationship;
    }
    if (friend.groups?.includes('dyd')) return 'DYD Friend';
    if (friend.groups?.includes('bora')) return 'Bora Friend';
    if (friend.groups?.includes('courtside')) return 'Court Side Friend';
    return 'DYD Friend';
  }, [friend]);

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
              <Text style={styles.friendName}>{friend.name || 'Maria Deborah'}</Text>
              <Text style={styles.friendSubtitle}>{friendSubtitle}</Text>
            </View>
          </View>

          {/* ================= 3. DATE DISPLAY & VIEW CONTROLS ================= */}
          {/* Selected Full Date */}
          <Text style={styles.dateDisplay}>{activeDayConfig.fullDate}</Text>

          {/* Pill-Shaped Toggle Switch (Daily vs Weekly) */}
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

          {/* ================= 4. DAY SELECTOR TABS ================= */}
          <View style={styles.dayTabsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayTabsScroll}
            >
              {MARIA_WEEKLY_SCHEDULE.map((tab) => {
                const isActive = tab.id === selectedDayId;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.dayTab, isActive && styles.dayTabActive]}
                    onPress={() => {
                      setSelectedDayId(tab.id);
                      if (viewMode === 'weekly') {
                        setViewMode('daily');
                      }
                    }}
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

          {/* ================= 5. TIMELINE CONTAINER / VIEW MODE ================= */}
          {viewMode === 'daily' ? (
            /* ================= DAILY VIEW: CHRONOLOGICAL TIME BLOCKS ================= */
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

              {/* Right Column: Grid Lines and Positioned Time Blocks */}
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
          ) : (
            /* ================= WEEKLY VIEW: MULTI-DAY SUMMARY ================= */
            <View style={styles.weeklySummaryContainer}>
              <View style={styles.weeklyHeader}>
                <Text style={styles.weeklyHeaderTitle}>Weekly Routine Overview</Text>
                <Text style={styles.weeklyHeaderSubtitle}>
                  Select a day to inspect full daily timetable
                </Text>
              </View>

              {MARIA_WEEKLY_SCHEDULE.map((day) => {
                const busyCount = day.items.filter((i) => i.isBusy).length;
                const freeCount = day.items.filter((i) => !i.isBusy).length;

                return (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.weeklyDayCard,
                      day.id === selectedDayId && styles.weeklyDayCardSelected,
                    ]}
                    onPress={() => {
                      setSelectedDayId(day.id);
                      setViewMode('daily');
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.weeklyDayLeft}>
                      <View
                        style={[
                          styles.weeklyDayBadge,
                          day.id === selectedDayId && styles.weeklyDayBadgeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.weeklyDayBadgeText,
                            day.id === selectedDayId &&
                              styles.weeklyDayBadgeTextActive,
                          ]}
                        >
                          {day.dayAbbrev}
                        </Text>
                        <Text
                          style={[
                            styles.weeklyDayBadgeNumber,
                            day.id === selectedDayId &&
                              styles.weeklyDayBadgeNumberActive,
                          ]}
                        >
                          {day.dayNumber}
                        </Text>
                      </View>
                      <View style={styles.weeklyDayMeta}>
                        <Text style={styles.weeklyDayName}>{day.fullDate}</Text>
                        <Text style={styles.weeklyDayCounts}>
                          {busyCount} class{busyCount === 1 ? '' : 'es'} · {freeCount} open window{freeCount === 1 ? '' : 's'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.weeklyViewDayLink}>View Daily ›</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ================= 6. BOTTOM NAVIGATION BAR (Figma Reference) ================= */}
      <BottomNavBar
        activeTab={activeNavTab}
        onTabChange={(tab) => {
          setActiveNavTab(tab);
          if (tab === 'home') {
            onBack();
          }
        }}
        notificationBadgeCount={0}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    paddingBottom: 95, // Leaves space so bottom nav never overlaps schedule box
  },
  contentContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  /* 1. Header Styles */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#172019',
    letterSpacing: -0.2,
  },

  /* 2. Profile Section Styles */
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DEE5ED',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  friendName: {
    fontFamily: FONTS.bold,
    fontSize: 21,
    color: '#172019',
    letterSpacing: -0.2,
  },
  friendSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#4B594E',
    marginTop: 3,
  },

  /* 3. Date Display & Toggle Controls */
  dateDisplay: {
    fontFamily: FONTS.medium,
    fontSize: 14.5,
    color: '#344338',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#CCD7CA',
    borderRadius: 24,
    padding: 4,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      },
    }),
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOptionActive: {
    backgroundColor: '#1C231F',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.16,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 5px rgba(0,0,0,0.18)',
      },
    }),
  },
  toggleText: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
  toggleTextActive: {
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  toggleTextInactive: {
    fontFamily: FONTS.medium,
    color: '#2F3D32',
  },

  /* 4. Day Selector Tabs */
  dayTabsWrapper: {
    marginBottom: 16,
  },
  dayTabsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  dayTab: {
    width: 49,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#C5D6C7',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.12,
        shadowRadius: 2.5,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1.5px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  dayTabActive: {
    backgroundColor: '#4A5F50',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
      },
    }),
  },
  dayAbbrevText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#2E3D31',
    marginBottom: 2,
  },
  dayAbbrevTextActive: {
    color: '#DCE8DE',
  },
  dayNumberText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#1A231D',
  },
  dayNumberTextActive: {
    color: '#FFFFFF',
  },

  /* 5. Timeline Container & Time Blocks */
  timelineBox: {
    flexDirection: 'row',
    borderWidth: 1.4,
    borderColor: '#60A867',
    borderRadius: 14,
    backgroundColor: '#FAF8EF',
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#172B1E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 2px 8px rgba(23,43,30,0.04)',
      },
    }),
  },
  timeAxisColumn: {
    width: 44,
    position: 'relative',
    marginRight: 6,
  },
  timeAxisItem: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'flex-start',
  },
  timeAxisLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10.5,
    color: '#556858',
    letterSpacing: 0.1,
  },
  scheduleGridArea: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#DEE5DD',
    borderStyle: 'dashed',
  },

  /* Free Time Block (Figma Reference) */
  freeBlock: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderRadius: 14,
    borderWidth: 1.4,
    borderColor: '#A8B9AA',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(235, 243, 235, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  freeContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  freeCheckIcon: {
    marginRight: 2,
  },
  freeText: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: '#2A382C',
    letterSpacing: -0.1,
  },

  /* Busy/Class Time Block (Figma Reference) */
  busyBlock: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderRadius: 8,
    backgroundColor: '#D7DCE2',
    borderLeftWidth: 4.5,
    borderLeftColor: '#36424D',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      },
    }),
  },
  busyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  busyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: '#1B242C',
    flex: 1,
    marginRight: 8,
  },
  busyTimeRange: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: '#5B6874',
  },
  busyRoom: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#5B6874',
  },

  /* Weekly Summary Styles */
  weeklySummaryContainer: {
    borderWidth: 1.4,
    borderColor: '#60A867',
    borderRadius: 14,
    backgroundColor: '#FAF8EF',
    padding: 14,
    marginBottom: 20,
  },
  weeklyHeader: {
    marginBottom: 12,
  },
  weeklyHeaderTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#172019',
  },
  weeklyHeaderSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: '#556858',
    marginTop: 2,
  },
  weeklyDayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8E0',
  },
  weeklyDayCardSelected: {
    borderColor: '#4A5F50',
    backgroundColor: '#F3F7F3',
  },
  weeklyDayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weeklyDayBadge: {
    width: 38,
    height: 42,
    borderRadius: 6,
    backgroundColor: '#C5D6C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyDayBadgeActive: {
    backgroundColor: '#4A5F50',
  },
  weeklyDayBadgeText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: '#2E3D31',
  },
  weeklyDayBadgeTextActive: {
    color: '#DCE8DE',
  },
  weeklyDayBadgeNumber: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#1A231D',
  },
  weeklyDayBadgeNumberActive: {
    color: '#FFFFFF',
  },
  weeklyDayMeta: {
    justifyContent: 'center',
  },
  weeklyDayName: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#172019',
  },
  weeklyDayCounts: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#556858',
    marginTop: 2,
  },
  weeklyViewDayLink: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.darkGreen,
  },
});
