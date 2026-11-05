import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  RefreshControl,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { HeaderGreeting } from '../components/dashboard/HeaderGreeting';
import { ScheduleSummaryCard } from '../components/dashboard/ScheduleSummaryCard';
import { FriendGroupFilter } from '../components/dashboard/FriendGroupFilter';
import { AvailabilityTimelineSlider } from '../components/dashboard/AvailabilityTimelineSlider';
import { BestWindowCard } from '../components/dashboard/BestWindowCard';
import { FriendAvailabilitySection } from '../components/dashboard/FriendAvailabilitySection';
import {
  FullDayScheduleModal,
  FriendDetailModal,
  BestWindowModal,
} from '../components/dashboard/DashboardModals';
import {
  CURRENT_USER,
  FRIEND_GROUPS,
  INITIAL_SCHEDULE_ACTIVITIES,
  SAMPLE_FRIENDS,
  filterFriendsByGroup,
  calculateBestWindow,
  formatDashboardDate,
  TimeSlotTimeline,
} from '../mock/dashboardData';
import { FriendGroupId, FriendAvailability } from '../types/dashboard';

import { BottomNavBar } from '../components/navigation/BottomNavBar';

export const HomeScreen: React.FC = () => {

  // State
  const [selectedGroup, setSelectedGroup] = useState<FriendGroupId>('all');
  const [scheduleActivities] = useState(INITIAL_SCHEDULE_ACTIVITIES);
  const [friendsList] = useState(SAMPLE_FRIENDS);
  const [activeTimelinePeriod, setActiveTimelinePeriod] = useState<TimeSlotTimeline | null>(null);

  // Modals & Sheets
  const [isFullDayModalVisible, setIsFullDayModalVisible] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendAvailability | null>(null);
  const [isBestWindowModalVisible, setIsBestWindowModalVisible] = useState(false);

  // View all toggles
  const [showAllFree, setShowAllFree] = useState(false);
  const [showAllBusy, setShowAllBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filtered friends
  const filteredFriends = useMemo(() => {
    return filterFriendsByGroup(friendsList, selectedGroup);
  }, [friendsList, selectedGroup]);

  // Split into Free Now and Busy
  const freeFriends = useMemo(() => {
    return filteredFriends.filter((f) => f.status === 'free');
  }, [filteredFriends]);

  const busyFriends = useMemo(() => {
    return filteredFriends.filter((f) => f.status === 'busy');
  }, [filteredFriends]);

  // Dynamically calculate Best Window Today for selected group
  const bestWindow = useMemo(() => {
    return calculateBestWindow(friendsList, selectedGroup);
  }, [friendsList, selectedGroup]);

  // Pull-to-refresh simulation
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.darkGreen}
            colors={[COLORS.darkGreen]}
          />
        }
      >
        <View style={styles.contentContainer}>
          {/* 1. Personalized Greeting and Date */}
          <HeaderGreeting userName={CURRENT_USER.name} />

          {/* 2. Today's Schedule Card */}
          <ScheduleSummaryCard
            activities={scheduleActivities}
            onViewFullDay={() => setIsFullDayModalVisible(true)}
            timeMarkers={
              activeTimelinePeriod?.timeMarkers || ['8:00AM', '1:00PM', '3:00 PM']
            }
          />

          {/* 3. Friend Group Filter Tabs */}
          <FriendGroupFilter
            groups={FRIEND_GROUPS}
            selectedGroup={selectedGroup}
            onSelectGroup={(groupId) => setSelectedGroup(groupId)}
          />

          {/* 4. Friends' Availability Timeline Slider */}
          <AvailabilityTimelineSlider
            onPeriodChange={(period) => setActiveTimelinePeriod(period)}
          />

          {/* 5. Best Window Today Recommendation Card */}
          <BestWindowCard
            bestWindow={bestWindow}
            onPressSuggested={() => setIsBestWindowModalVisible(true)}
          />

          {/* 6. Friends' Availability Lists (Free Now & Busy) */}
          <FriendAvailabilitySection
            freeFriends={freeFriends}
            busyFriends={busyFriends}
            onSelectFriend={(friend) => setSelectedFriend(friend)}
            onViewAllFree={() => setShowAllFree(!showAllFree)}
            onViewAllBusy={() => setShowAllBusy(!showAllBusy)}
            showAllFree={showAllFree}
            showAllBusy={showAllBusy}
          />
        </View>
      </ScrollView>

      {/* ================= INTERACTIVE MODALS ================= */}
      {/* Full Day Schedule Modal */}
      <FullDayScheduleModal
        visible={isFullDayModalVisible}
        onClose={() => setIsFullDayModalVisible(false)}
        activities={scheduleActivities}
        dateString={formatDashboardDate()}
      />

      {/* Friend Detail Modal */}
      <FriendDetailModal
        friend={selectedFriend}
        visible={!!selectedFriend}
        onClose={() => setSelectedFriend(null)}
      />

      {/* Best Window Modal */}
      <BestWindowModal
        bestWindow={bestWindow}
        visible={isBestWindowModalVisible}
        onClose={() => setIsBestWindowModalVisible(false)}
      />

      {/* Bottom Navigation Bar from Figma Screenshot */}
      <BottomNavBar
        activeTab="home"
        onTabChange={() => {}}
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
    paddingBottom: 85, // Padding so bottom nav never overlaps cards
  },
  contentContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
});
