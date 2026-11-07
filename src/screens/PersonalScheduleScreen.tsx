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
import { FriendScheduleItem } from '../types/dashboard';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';
import { UserAvatarSilhouette } from '../components/icons/NavIcons';
import {
  getPersonalScheduleByDate,
  CURRENT_USER,
} from '../mock/dashboardData';
import {
  WeeklyDateFilter,
  PERSONAL_WEEK_DAYS,
} from '../components/dashboard/WeeklyDateFilter';
import {
  ScheduleTypeFilter,
  ScheduleFilterType,
} from '../components/dashboard/ScheduleTypeFilter';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { TabId } from '../types/navigation';

interface PersonalScheduleScreenProps {
  onBack: () => void;
}

const HOUR_HEIGHT = 58;
const START_HOUR = 8.0;
const END_HOUR = 18.0;
const TOTAL_HOURS = END_HOUR - START_HOUR; // 10 hours (8 AM to 6 PM)

const TIMELINE_HOURS = [
  { hour: 8, label: '8 AM' },
  { hour: 9, label: '9 AM' },
  { hour: 10, label: '10 AM' },
  { hour: 11, label: '11 AM' },
  { hour: 12, label: '12 AM' }, // Matches exact Figma reference label "12 AM"
  { hour: 13, label: '1 PM' },
  { hour: 14, label: '2 PM' },
  { hour: 15, label: '3 PM' },
  { hour: 16, label: '4 PM' },
  { hour: 17, label: '5 PM' },
  { hour: 18, label: '6 PM' },
];

export const PersonalScheduleScreen: React.FC<PersonalScheduleScreenProps> = ({
  onBack,
}) => {
  // State for active date filter (defaults to '20' as in Figma mockup)
  const [selectedDate, setSelectedDate] = useState<string>('20');

  // State for schedule type filter ('All' | 'Classes' | 'Free Time')
  const [scheduleFilter, setScheduleFilter] = useState<ScheduleFilterType>('All');

  // State for bottom navigation
  const [activeNavTab, setActiveNavTab] = useState<TabId>('home');

  // Find day object for the currently selected date
  const currentDayObj = useMemo(() => {
    return (
      PERSONAL_WEEK_DAYS.find((d) => d.date === selectedDate) ||
      PERSONAL_WEEK_DAYS[1]
    );
  }, [selectedDate]);

  // Schedule items for the selected day
  const rawItems = useMemo(() => {
    return getPersonalScheduleByDate(selectedDate);
  }, [selectedDate]);

  // Filter items by type (All, Classes, Free Time)
  const displayedItems: FriendScheduleItem[] = useMemo(() => {
    if (scheduleFilter === 'Classes') {
      return rawItems.filter((item) => item.isBusy);
    }
    if (scheduleFilter === 'Free Time') {
      return rawItems.filter((item) => !item.isBusy);
    }
    return rawItems;
  }, [rawItems, scheduleFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* ================= 1. TOP HEADER (< My Schedule) ================= */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Back to home dashboard"
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

            <Text style={styles.headerTitle}>My Schedule</Text>
          </View>

          {/* ================= 2. PROFILE SECTION ================= */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <UserAvatarSilhouette size={72} color="#5F6F7E" bgColor="#DEE5ED" />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {CURRENT_USER.name ? `${CURRENT_USER.name} Buenvenida` : 'Bernadette Buenvenida'}
              </Text>
              <Text style={styles.userSubtitle}>Individual Schedule</Text>
            </View>
          </View>

          {/* ================= 3. DATE DISPLAY ================= */}
          <View style={styles.dateSection}>
            <Text style={styles.dateMainHeading}>{currentDayObj.fullDate}</Text>
            <Text style={styles.dateSubHeading}>
              {selectedDate === '20' ? 'Today 2026' : 'October 2026'}
            </Text>
          </View>

          {/* ================= 4. INTERACTIVE DAY & DATE FILTER (HS-05) ================= */}
          <WeeklyDateFilter
            selectedDate={selectedDate}
            onSelectDate={(date) => setSelectedDate(date)}
          />

          {/* ================= 5. SCHEDULE TYPE FILTER ================= */}
          <ScheduleTypeFilter
            activeFilter={scheduleFilter}
            onFilterChange={(filter) => setScheduleFilter(filter)}
          />

          {/* ================= 6. CHRONOLOGICAL TIMELINE CONTAINER ================= */}
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
              {displayedItems.map((item) => {
                const clampedStart = Math.max(START_HOUR, item.startHour);
                const clampedEnd = Math.min(END_HOUR, item.endHour);
                const duration = Math.max(0.5, clampedEnd - clampedStart);

                const blockTop = (clampedStart - START_HOUR) * HOUR_HEIGHT + 2;
                const blockHeight = duration * HOUR_HEIGHT - 4;

                if (item.isBusy) {
                  /* Busy / Class Time Block */
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
                          {item.timeRange || `${item.startTime}–${item.endTime}`}
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

      {/* ================= 7. BOTTOM NAVIGATION BAR ================= */}
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
    paddingBottom: 95,
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
  userName: {
    fontFamily: FONTS.bold,
    fontSize: 21,
    color: '#172019',
    letterSpacing: -0.2,
  },
  userSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#4B594E',
    marginTop: 3,
  },

  /* 3. Date Section Styles */
  dateSection: {
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  dateMainHeading: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#172019',
    letterSpacing: -0.2,
  },
  dateSubHeading: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#556858',
    marginTop: 2,
  },

  /* 6. Timeline Container Styles */
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

  /* Free Time Block */
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

  /* Busy / Class Time Block */
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

