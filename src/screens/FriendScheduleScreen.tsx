import React, { useState, useMemo, useCallback } from 'react';
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
  SAMPLE_FRIEND_MARIA_DEBORAH,
  DayScheduleTab,
  getWeeklySchedule,
} from '../mock/dashboardData';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { TabId } from '../types/navigation';

interface FriendScheduleScreenProps {
  friend?: FriendAvailability | null;
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
  { hour: 12, label: '12 AM' }, // Matches exact Figma screenshot label "12 AM"
  { hour: 13, label: '1 PM' },
  { hour: 14, label: '2 PM' },
  { hour: 15, label: '3 PM' },
  { hour: 16, label: '4 PM' },
  { hour: 17, label: '5 PM' },
  { hour: 18, label: '6 PM' },
];

export const FriendScheduleScreen: React.FC<FriendScheduleScreenProps> = ({
  friend,
  onBack = () => console.log('Navigate back'),
}) => {
  // Fallback to Maria Deborah sample if friend is not provided
  const activeFriend: FriendAvailability = useMemo(() => {
    return friend ?? SAMPLE_FRIEND_MARIA_DEBORAH;
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
    fontSize: 23,
    color: '#172019',
    letterSpacing: -0.2,
  },

  /* 2. Profile Section Styles */
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
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
    marginBottom: 14,
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

  /* 4. Weekly Navigation Banner */
  weeklyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.weeklyBannerBg,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 3.5,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      },
    }),
  },
  bannerArrowBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyIndicatorPill: {
    backgroundColor: COLORS.weeklyBannerPillBg,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyIndicatorText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.weeklyBannerText,
    letterSpacing: 0.1,
  },

  /* 5. Day Selector Tabs */
  dayTabsWrapper: {
    marginBottom: 16,
  },
  dayTabsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    gap: 7,
  },
  dayTab: {
    width: 48,
    height: 56,
    borderRadius: 8,
    backgroundColor: COLORS.dayTabBg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.12,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1.5px 3.5px rgba(0,0,0,0.1)',
      },
    }),
  },
  dayTabActive: {
    backgroundColor: COLORS.dayTabActiveBg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
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
    color: COLORS.dayTabTextSubtle,
    marginBottom: 2,
  },
  dayAbbrevTextActive: {
    color: '#DCE8DE',
  },
  dayNumberText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.dayTabTextDark,
  },
  dayNumberTextActive: {
    color: '#FFFFFF',
  },

  /* 6. Chronological Time Blocks (Timeline Container) */
  timelineBox: {
    flexDirection: 'row',
    borderWidth: 1.4,
    borderColor: COLORS.timelineContainerBorder,
    borderRadius: 14,
    backgroundColor: COLORS.timelineContainerBg,
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
    borderColor: COLORS.timelineFreeBorder,
    borderStyle: 'dashed',
    backgroundColor: COLORS.timelineFreeBg,
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
    backgroundColor: COLORS.timelineBusyBg,
    borderLeftWidth: 4.5,
    borderLeftColor: COLORS.timelineBusyAccent,
    paddingHorizontal: 12,
    paddingVertical: 9,
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
});
