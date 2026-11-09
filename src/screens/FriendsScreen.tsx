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
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';
import {
  FriendsScreenProps,
  ConnectedFriend,
  FriendRequestDirection,
  FriendGroupItem,
} from '../types/friends';
import { FriendAvailability } from '../types/dashboard';
import {
  INITIAL_CONNECTED_FRIENDS,
  EXTENDED_CONNECTED_FRIENDS,
  INITIAL_RECEIVED_REQUESTS,
  INITIAL_SENT_REQUESTS,
  INITIAL_FRIEND_GROUPS,
  filterConnectedFriends,
  filterFriendGroups,
} from '../mock/friendsData';
import { FriendsSearchBar } from '../components/friends/FriendsSearchBar';
import { ConnectedFriendsSection } from '../components/friends/ConnectedFriendsSection';
import { PendingRequestsSection } from '../components/friends/PendingRequestsSection';
import { FriendGroupsSection } from '../components/friends/FriendGroupsSection';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { FriendScheduleScreen } from './FriendScheduleScreen';
import { FriendSearchScreen } from './FriendSearchScreen';

export const FriendsScreen: React.FC<FriendsScreenProps> = ({
  onNavigateTab,
  onViewFriendSchedule,
  onOpenFindFriends,
  onOpenViewAllFriends,
  onOpenReceivedRequests,
  onOpenSentRequests,
  onOpenManageGroups,
  onOpenCreateGroup,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Section Interactive States
  const [showAllFriends, setShowAllFriends] = useState<boolean>(false);
  const [activeRequestPreview, setActiveRequestPreview] =
    useState<FriendRequestDirection | null>(null);
  const [isManagingGroups, setIsManagingGroups] = useState<boolean>(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Schedule Navigation State (when viewing a connected friend's schedule)
  const [selectedScheduleFriend, setSelectedScheduleFriend] =
    useState<FriendAvailability | null>(null);

  // Friend Search Navigation State (FS-02)
  const [isFindFriendsOpen, setIsFindFriendsOpen] = useState<boolean>(false);

  // Mock Data Collections
  const [receivedRequests] = useState(INITIAL_RECEIVED_REQUESTS);
  const [sentRequests] = useState(INITIAL_SENT_REQUESTS);
  const [friendGroups] = useState(INITIAL_FRIEND_GROUPS);

  // Active source list of connected friends
  const baseConnectedFriends = useMemo(() => {
    return showAllFriends ? EXTENDED_CONNECTED_FRIENDS : INITIAL_CONNECTED_FRIENDS;
  }, [showAllFriends]);

  // Filtered connected friends based on search query & selected group
  const filteredFriends = useMemo(() => {
    return filterConnectedFriends(
      baseConnectedFriends,
      searchQuery,
      selectedGroupId
    );
  }, [baseConnectedFriends, searchQuery, selectedGroupId]);

  // Filtered friend groups based on search query
  const filteredGroups = useMemo(() => {
    return filterFriendGroups(friendGroups, searchQuery);
  }, [friendGroups, searchQuery]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);

  // Handlers
  const handlePressAddFriend = useCallback(() => {
    if (onOpenFindFriends) {
      onOpenFindFriends();
      return;
    }
    setIsFindFriendsOpen(true);
  }, [onOpenFindFriends]);

  const handleToggleViewAllFriends = useCallback(() => {
    if (onOpenViewAllFriends) {
      onOpenViewAllFriends();
      return;
    }
    setShowAllFriends((prev) => !prev);
  }, [onOpenViewAllFriends]);

  const handlePressFriendSchedule = useCallback(
    (friend: ConnectedFriend) => {
      if (onViewFriendSchedule) {
        onViewFriendSchedule(friend.scheduleProfile);
        return;
      }
      setSelectedScheduleFriend(friend.scheduleProfile);
    },
    [onViewFriendSchedule]
  );

  const handlePressReceived = useCallback(() => {
    if (onOpenReceivedRequests) {
      onOpenReceivedRequests();
      return;
    }
    setActiveRequestPreview((prev) => (prev === 'received' ? null : 'received'));
  }, [onOpenReceivedRequests]);

  const handlePressSent = useCallback(() => {
    if (onOpenSentRequests) {
      onOpenSentRequests();
      return;
    }
    setActiveRequestPreview((prev) => (prev === 'sent' ? null : 'sent'));
  }, [onOpenSentRequests]);

  const handleToggleManageGroups = useCallback(() => {
    if (onOpenManageGroups) {
      onOpenManageGroups();
      return;
    }
    setIsManagingGroups((prev) => !prev);
  }, [onOpenManageGroups]);

  const handleSelectGroup = useCallback(
    (group: FriendGroupItem) => {
      if (onOpenManageGroups && isManagingGroups) {
        onOpenManageGroups(group);
        return;
      }
      setSelectedGroupId((prev) => (prev === group.id ? null : group.id));
    },
    [onOpenManageGroups, isManagingGroups]
  );

  const handlePressCreateGroup = useCallback(() => {
    if (onOpenCreateGroup) {
      onOpenCreateGroup();
      return;
    }
    setIsManagingGroups(true);
    setFeedbackBanner('Create Friend Group selected. Showing all friend groups.');
  }, [onOpenCreateGroup]);

  // If viewing an individual connected friend's schedule
  if (selectedScheduleFriend) {
    return (
      <FriendScheduleScreen
        friend={selectedScheduleFriend}
        onBack={() => setSelectedScheduleFriend(null)}
      />
    );
  }

  // If searching for friends to add (FS-02)
  if (isFindFriendsOpen) {
    return (
      <FriendSearchScreen
        initialQuery={searchQuery || 'Mariah'}
        onBack={() => {
          setIsFindFriendsOpen(false);
          setSearchQuery('');
        }}
        onNavigateTab={onNavigateTab}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.darkGreen}
            colors={[COLORS.darkGreen]}
          />
        }
      >
        <View style={styles.contentContainer}>
          {/* 1. Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Friends</Text>
            <Text style={styles.headerSubtitle}>Your people and groups</Text>
          </View>

          {/* Optional Feedback Banner */}
          {feedbackBanner && (
            <TouchableOpacity
              style={styles.feedbackBanner}
              onPress={() => setFeedbackBanner(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.feedbackBannerText}>{feedbackBanner}</Text>
              <Text style={styles.feedbackDismissText}>Dismiss</Text>
            </TouchableOpacity>
          )}

          {/* 2. Functional Search Bar & Add Friend Action Button (FS-01 / FS-02) */}
          <FriendsSearchBar
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.trim().length > 0) {
                setIsFindFriendsOpen(true);
              }
            }}
            onFocus={() => {
              setIsFindFriendsOpen(true);
            }}
            onPressAddButton={handlePressAddFriend}
            placeholder="Search by name or username..."
          />

          {/* Find Friends Shortcut / Banner */}
          <TouchableOpacity
            style={styles.findFriendsBanner}
            onPress={() => setIsFindFriendsOpen(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Find and add new friends"
          >
            <View style={styles.findFriendsBannerContent}>
              <Text style={styles.findFriendsBannerTitle}>Find Friends</Text>
              <Text style={styles.findFriendsBannerSub}>
                Search by name or username to connect and share schedules
              </Text>
            </View>
            <Text style={styles.findFriendsBannerAction}>Search →</Text>
          </TouchableOpacity>

          {/* 3. Connected Friends Section */}
          <ConnectedFriendsSection
            friends={filteredFriends}
            totalCount={
              searchQuery.trim() || selectedGroupId
                ? filteredFriends.length
                : baseConnectedFriends.length
            }
            showAll={showAllFriends}
            onToggleViewAll={handleToggleViewAllFriends}
            onPressSchedule={handlePressFriendSchedule}
            searchQuery={searchQuery}
          />

          {/* 4. Pending Friend Requests Section */}
          <PendingRequestsSection
            receivedCount={receivedRequests.length}
            sentCount={sentRequests.length}
            receivedRequests={receivedRequests}
            sentRequests={sentRequests}
            activePreviewType={activeRequestPreview}
            onPressReceived={handlePressReceived}
            onPressSent={handlePressSent}
          />

          {/* 5. Friend Group Management Section */}
          <FriendGroupsSection
            groups={filteredGroups}
            totalCount={friendGroups.length}
            isManaging={isManagingGroups || searchQuery.trim().length > 0}
            selectedGroupId={selectedGroupId}
            onToggleManage={handleToggleManageGroups}
            onSelectGroup={handleSelectGroup}
            onPressCreateGroup={handlePressCreateGroup}
          />
        </View>
      </ScrollView>

      {/* 6. Bottom Navigation Bar */}
      <BottomNavBar
        activeTab="friends"
        onTabChange={(tab) => {
          onNavigateTab?.(tab);
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
    paddingHorizontal: 26,
    paddingTop: 18,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.darkGreen,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#0F1711',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#D9DDE2',
    borderWidth: 1,
    borderColor: COLORS.friendsOliveText,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  feedbackBannerText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#0F1711',
    marginRight: 10,
  },
  feedbackDismissText: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: COLORS.darkGreen,
  },
  findFriendsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(91, 105, 85, 0.1)',
    borderWidth: 1.2,
    borderColor: 'rgba(91, 105, 85, 0.25)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  findFriendsBannerContent: {
    flex: 1,
    marginRight: 12,
  },
  findFriendsBannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.darkGreen,
    marginBottom: 2,
  },
  findFriendsBannerSub: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: '#344738',
    lineHeight: 17,
  },
  findFriendsBannerAction: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: COLORS.darkGreen,
  },
});
