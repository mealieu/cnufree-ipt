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
import { FriendAvailability, FriendScheduleItem } from '../types/dashboard';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';
import { UserAvatarSilhouette } from '../components/icons/NavIcons';
import {
  BERNADETTE_SCHEDULE,
} from '../mock/dashboardData';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { WeeklyDateFilter } from '../components/dashboard/WeeklyDateFilter';
import { ScheduleTypeFilter } from '../components/dashboard/ScheduleTypeFilter';

interface FriendScheduleScreenProps {
  friend?: FriendAvailability | null;
  onBack: () => void;
}

interface WeekDay {
  day: string;
  date: number;
  fullDate: string;
}

const WEEK_DAYS: WeekDay[] = [
  { day: 'Mon', date: 19, fullDate: 'Mon, October 19' },
  { day: 'Tue', date: 20, fullDate: 'Tues, October 20' },
  { day: 'Wed', date: 21, fullDate: 'Wed, October 21' },
  { day: 'Thurs', date: 22, fullDate: 'Thurs, October 22' },
  { day: 'Fri', date: 23, fullDate: 'Fri, October 23' },
  { day: 'Sat', date: 24, fullDate: 'Sat, October 24' },
  { day: 'Sun', date: 25, fullDate: 'Sun, October 25' },
];

export const FriendScheduleScreen: React.FC<FriendScheduleScreenProps> = ({
  friend,
  onBack,
}) => {
  const [selectedDate, setSelectedDate] = useState<number>(20);

  const selectedDayObj = useMemo(() => {
    return WEEK_DAYS.find((d) => d.date === selectedDate) || WEEK_DAYS[1];
  }, [selectedDate]);

  // Determine person's name
  const displayName = friend ? friend.name : 'Bernadette Buenvenida';

  // Get schedule items: if friend has custom schedule use it, otherwise use mockup default
  const scheduleItems: FriendScheduleItem[] = useMemo(() => {
    if (friend && friend.schedule && friend.schedule.length > 0) {
      return friend.schedule;
    }
    return BERNADETTE_SCHEDULE;
  }, [friend]);

  // Time Axis Labels (8 AM to 6 PM) matching mockup
  const timeLabels = [
    '8 AM',
    '9 AM',
    '10 AM',
    '11 AM',
    '12 AM',
    '1 PM',
    '2 PM',
    '3 PM',
    '4 PM',
    '5 PM',
    '6 PM',
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* ================= 1. TOP APP BAR (< My Schedule) ================= */}
          <TouchableOpacity
            style={styles.topBackHeader}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back to previous screen"
          >
            <Text style={styles.backChevron}>‹</Text>
            <Text style={styles.topHeaderTitle}>My Schedule</Text>
          </TouchableOpacity>

          {/* ================= 2. PROFILE HEADER ================= */}
          <View style={styles.profileRow}>
            {/* Soft circular avatar */}
            <View style={styles.avatarCircle}>
              <UserAvatarSilhouette size={34} color="#687684" />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.profileSubtitle}>Individual Schedule</Text>
            </View>
          </View>

          {/* ================= 3. DATE SECTION ================= */}
          <View style={styles.dateSection}>
            <Text style={styles.dateMainHeading}>{selectedDayObj.fullDate}</Text>
            <Text style={styles.dateSubHeading}>Today 2026</Text>
          </View>

          {/* ================= 4. NEW FILTERS ================= */}
          <WeeklyDateFilter />
          <ScheduleTypeFilter />

          {/* ================= 5. GREEN BORDERED SCHEDULE BOARD ================= */}
          <View style={styles.scheduleBoardContainer}>
            <View style={styles.timelineLayout}>
              {/* Left Column: Time Axis Labels */}
              <View style={styles.timeAxisCol}>
                {timeLabels.map((time, idx) => (
                  <View key={idx} style={styles.timeAxisSlot}>
                    <Text style={styles.timeAxisText}>{time}</Text>
                    {/* Dotted horizontal guide line extending across */}
                    <View style={styles.horizontalDottedLine} />
                  </View>
                ))}
              </View>

              {/* Right Column: Schedule Block Items */}
              <View style={styles.blocksColumn}>
                {scheduleItems.map((item) => {
                  if (!item.isBusy) {
                    // Free Period: Dashed Border Card with Checkmark
                    const durationHours = item.endHour - item.startHour;
                    const minHeight = durationHours > 1.5 ? 90 : 50;

                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.freeBlockCard,
                          { minHeight },
                        ]}
                      >
                        <View style={styles.freeContentRow}>
                          <Text style={styles.checkmarkIcon}>✓</Text>
                          <Text style={styles.freeText}>
                            Free · {item.startTime} - {item.endTime}
                          </Text>
                        </View>
                      </View>
                    );
                  } else {
                    // Class Period: Solid Grey Card with Dark Left Stripe
                    return (
                      <View key={item.id} style={styles.classBlockCard}>
                        {/* Dark Left Accent Stripe */}
                        <View style={styles.classLeftStripe} />

                        <View style={styles.classCardContent}>
                          <View style={styles.classTopRow}>
                            <Text style={styles.classTitle}>{item.title}</Text>
                            <Text style={styles.classTime}>
                              {item.startTime.replace(':00', '').replace(' ', '')}–{item.endTime.replace(':00', '').replace(' ', '')}
                            </Text>
                          </View>

                          {item.room && (
                            <Text style={styles.classRoom}>{item.room}</Text>
                          )}
                        </View>
                      </View>
                    );
                  }
                })}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab="friends"
        onTabChange={() => onBack()}
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
    paddingBottom: 85,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  // 1. Top Back Header
  topBackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
    paddingVertical: 4,
  },
  backChevron: {
    fontSize: 26,
    fontFamily: FONTS.bold,
    color: '#162218',
    marginRight: 6,
    lineHeight: 26,
  },
  topHeaderTitle: {
    fontSize: 21,
    fontFamily: FONTS.bold,
    color: '#162218',
    letterSpacing: -0.3,
  },
  // 2. Profile Section
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DEE4EB',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#162218',
    letterSpacing: -0.2,
  },
  profileSubtitle: {
    fontSize: 12.5,
    fontFamily: FONTS.medium,
    color: '#717E73',
    marginTop: 2,
  },
  // 3. Date Section
  dateSection: {
    marginBottom: 12,
  },
  dateMainHeading: {
    fontSize: 23,
    fontFamily: FONTS.bold,
    color: '#28362B',
    letterSpacing: -0.4,
  },
  dateSubHeading: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: '#717E73',
    marginTop: 2,
  },
  // 4. Weekday Pills
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayPill: {
    width: 44,
    height: 58,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dayPillActive: {
    backgroundColor: '#465F4F',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.14)',
      },
    }),
  },
  dayPillInactive: {
    backgroundColor: '#C5D7CB',
  },
  dayLabel: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    marginBottom: 2,
  },
  dayLabelActive: {
    color: '#FFFFFF',
  },
  dayLabelInactive: {
    color: '#2F4034',
  },
  dateNumber: {
    fontSize: 14.5,
    fontFamily: FONTS.bold,
  },
  dateNumberActive: {
    color: '#FFFFFF',
  },
  dateNumberInactive: {
    color: '#162218',
  },
  // 5. Green Bordered Schedule Board
  scheduleBoardContainer: {
    backgroundColor: '#FAF8ED',
    borderWidth: 1.5,
    borderColor: '#32B368', // Vibrant green border from mockup
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  timelineLayout: {
    flexDirection: 'row',
  },
  timeAxisCol: {
    width: 46,
    paddingTop: 10,
  },
  timeAxisSlot: {
    height: 52,
    position: 'relative',
    justifyContent: 'flex-start',
  },
  timeAxisText: {
    fontSize: 10.5,
    fontFamily: FONTS.medium,
    color: '#657668',
  },
  horizontalDottedLine: {
    position: 'absolute',
    left: 42,
    right: -320,
    top: 7,
    borderBottomWidth: 1,
    borderColor: '#E2E8DE',
    borderStyle: 'dashed',
    zIndex: 0,
  },
  blocksColumn: {
    flex: 1,
    paddingLeft: 4,
    zIndex: 1,
  },
  // Free Block (Dashed Border Card)
  freeBlockCard: {
    borderWidth: 1.5,
    borderColor: '#B0C2B6',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#F3F6ED',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    justifyContent: 'center',
  },
  freeContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkmarkIcon: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: '#2A3C2F',
  },
  freeText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: '#2A3C2F',
    letterSpacing: -0.1,
  },
  // Class Block (Solid Card)
  classBlockCard: {
    backgroundColor: '#D9DDE2', // Soft lavender grey from mockup
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  classLeftStripe: {
    width: 5,
    backgroundColor: '#4B5563', // Dark charcoal/slate stripe
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  classCardContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  classTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classTitle: {
    fontSize: 14.5,
    fontFamily: FONTS.bold,
    color: '#162218',
    letterSpacing: -0.2,
  },
  classTime: {
    fontSize: 11.5,
    fontFamily: FONTS.medium,
    color: '#556558',
  },
  classRoom: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#556558',
    marginTop: 4,
  },
});
