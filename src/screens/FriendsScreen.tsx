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
  FriendRequestItem,
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
import { ConnectedFriendsList } from '../components/friends/ConnectedFriendsList';
import { PendingRequestsSection } from '../components/friends/PendingRequestsSection';
import { FriendGroupsSection } from '../components/friends/FriendGroupsSection';
import { CreateFriendGroupModal } from '../components/friends/CreateFriendGroupModal';
import { CreateFriendGroupScreen } from './CreateFriendGroupScreen';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { FriendScheduleScreen } from './FriendScheduleScreen';
// TODO: [TEMP HARNESS FOR FS-04 - REMOVE ON MERGE]
import { ReceivedFriendRequestsScreen } from './ReceivedFriendRequestsScreen';
import { FriendSearchScreen } from './FriendSearchScreen';
import { FriendGroupDetailsScreen } from './FriendGroupDetailsScreen';
import { MOCK_FRIEND_GROUPS } from '../mock/friendsData';
import { FriendGroup } from '../types/friends';


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
  const [selectedGroup, setSelectedGroup] = useState<FriendGroup | null>(null);

  // Section Interactive States
  const [showAllFriends, setShowAllFriends] = useState<boolean>(false);
  const [isViewingAllConnectedList, setIsViewingAllConnectedList] =
    useState<boolean>(false);
  const [activeRequestPreview, setActiveRequestPreview] =
    useState<FriendRequestDirection | null>(null);
  const [isManagingGroups, setIsManagingGroups] = useState<boolean>(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Schedule Navigation State (when viewing a connected friend's schedule)
  const [selectedScheduleFriend, setSelectedScheduleFriend] =
    useState<FriendAvailability | null>(null);

  // TODO: [TEMP HARNESS FOR FS-04 - REMOVE ON MERGE]
  const [isViewingReceivedScreen, setIsViewingReceivedScreen] = useState<boolean>(false);

  // Live collections for friend requests and connected friends (FS-05 connection state updates)
  const [connectedFriends, setConnectedFriends] =
    useState<ConnectedFriend[]>(INITIAL_CONNECTED_FRIENDS);
  const [receivedRequests, setReceivedRequests] =
    useState<FriendRequestItem[]>(INITIAL_RECEIVED_REQUESTS);

  // Friend Search Navigation State (FS-02)
  const [isFindFriendsOpen, setIsFindFriendsOpen] = useState<boolean>(false);

  const [sentRequests] = useState(INITIAL_SENT_REQUESTS);
  const [friendGroups, setFriendGroups] =
    useState<FriendGroupItem[]>(INITIAL_FRIEND_GROUPS);
  const [isCreateGroupModalVisible, setIsCreateGroupModalVisible] =
    useState<boolean>(false);

  // Active source list of connected friends
  const baseConnectedFriends = useMemo(() => {
    return showAllFriends ? EXTENDED_CONNECTED_FRIENDS : connectedFriends;
  }, [showAllFriends, connectedFriends]);

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
    setIsViewingAllConnectedList(true);
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
    // TODO: [TEMP HARNESS FOR FS-04 - REMOVE ON MERGE]
    setIsViewingReceivedScreen(true);
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

      const detailedGroup = MOCK_FRIEND_GROUPS.find(g => g.name === group.name);
      if (detailedGroup) {
        setSelectedGroup(detailedGroup);
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
    setIsCreateGroupModalVisible(true);
  }, [onOpenCreateGroup]);

  // Handler for group creation submission (FS-07)
  const handleCreateGroup = useCallback(
    (newGroup: { name: string; color?: string; memberIds: string[] }) => {
      const newGroupItem: FriendGroupItem = {
        id: `fg-${Date.now()}`,
        name: newGroup.name,
        memberIds: newGroup.memberIds,
        memberCount: newGroup.memberIds.length,
        isFeatured: true,
      };

      setFriendGroups((prev) => [newGroupItem, ...prev]);

      if (newGroup.memberIds.length > 0) {
        setConnectedFriends((prev) =>
          prev.map((f) => {
            if (newGroup.memberIds.includes(f.id)) {
              return {
                ...f,
                groupIds: [...(f.groupIds || []), newGroupItem.id],
              };
            }
            return f;
          })
        );
      }

      setFeedbackBanner(`Friend group "${newGroup.name}" created successfully!`);
    },
    []
  );

  // Handlers for Acceptance and Decline state updates (FS-05)
  const handleAcceptFriendRequest = useCallback(
    (requestId: string, newConnectedFriend?: ConnectedFriend) => {
      setReceivedRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: 'accepted' as const } : r
        )
      );
      if (newConnectedFriend) {
        setConnectedFriends((prev) => {
          if (prev.some((f) => f.id === newConnectedFriend.id)) return prev;
          return [newConnectedFriend, ...prev];
        });
        setFeedbackBanner(
          `Connected with ${newConnectedFriend.name}! They now appear in your Connected Friends.`
        );
      }
    },
    []
  );

  const handleDeclineFriendRequest = useCallback((requestId: string) => {
    setReceivedRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: 'declined' as const } : r
      )
    );
  }, []);

  const handleUndoFriendRequest = useCallback(
    (requestId: string) => {
      const targetReq = receivedRequests.find((r) => r.id === requestId);
      setReceivedRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: 'pending' as const } : r
        )
      );
      if (targetReq) {
        setConnectedFriends((prev) =>
          prev.filter(
            (f) =>
              f.username !== targetReq.username &&
              f.id !== `cf-${targetReq.id}` &&
              f.name !== targetReq.name
          )
        );
        setFeedbackBanner(`Reverted friend request for ${targetReq.name}.`);
      }
    },
    [receivedRequests]
  );

  // If viewing all connected friends list (FS-06)
  if (isViewingAllConnectedList) {
    return (
      <ConnectedFriendsList
        friends={baseConnectedFriends}
        onSelectFriend={(scheduleProfile) => {
          if (onViewFriendSchedule) {
            onViewFriendSchedule(scheduleProfile);
          } else {
            setSelectedScheduleFriend(scheduleProfile);
          }
        }}
        onBack={() => setIsViewingAllConnectedList(false)}
        onNavigateTab={(tab) => {
          setIsViewingAllConnectedList(false);
          onNavigateTab?.(tab);
        }}
        notificationBadgeCount={
          receivedRequests.filter((r) => r.status === 'pending').length
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    );
  }

  // If creating friend group (FS-07)
  if (isCreateGroupModalVisible) {
    return (
      <CreateFriendGroupScreen
        friends={connectedFriends}
        existingGroups={friendGroups}
        onBack={() => setIsCreateGroupModalVisible(false)}
        onNavigateTab={(tab) => {
          setIsCreateGroupModalVisible(false);
          onNavigateTab?.(tab);
        }}
        onCreateGroup={handleCreateGroup}
      />
    );
  }

  // If viewing an individual connected friend's schedule
  if (selectedScheduleFriend) {
    return (
      <FriendScheduleScreen
        friend={selectedScheduleFriend}
        onBack={() => setSelectedScheduleFriend(null)}
      />
    );
  }

  // If searching for friends to add (FS-02 / FS-03)
  if (isFindFriendsOpen) {
    return (
      <FriendSearchScreen
        initialQuery={searchQuery || 'Mariah'}
        onBack={() => {
          setIsFindFriendsOpen(false);
          setSearchQuery('');
        }}
        onNavigateTab={onNavigateTab}
        onViewSentRequests={() => {
          setIsFindFriendsOpen(false);
          if (onOpenSentRequests) {
            onOpenSentRequests();
          } else {
            setActiveRequestPreview('sent');
          }
        }}
      />
    );
  }

  // TODO: [TEMP HARNESS FOR FS-04 - REMOVE ON MERGE]
  if (isViewingReceivedScreen) {
    return (
      <ReceivedFriendRequestsScreen
        requests={receivedRequests}
        connectedFriends={connectedFriends}
        onBack={() => setIsViewingReceivedScreen(false)}
        onNavigateTab={(tab) => {
          setIsViewingReceivedScreen(false);
          onNavigateTab?.(tab);
        }}
        onAcceptRequest={handleAcceptFriendRequest}
        onDeclineRequest={handleDeclineFriendRequest}
        onUndoRequest={handleUndoFriendRequest}
        onViewFriendSchedule={(friendSchedule) => {
          setIsViewingReceivedScreen(false);
          if (onViewFriendSchedule) {
            onViewFriendSchedule(friendSchedule);
          } else {
            setSelectedScheduleFriend(friendSchedule);
          }
        }}
      />
    );
  }

  if (selectedGroup) {
    return (
      <FriendGroupDetailsScreen 
        group={selectedGroup} 
        onBack={() => setSelectedGroup(null)}
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
            receivedCount={receivedRequests.filter((r) => r.status === 'pending').length}
            sentCount={sentRequests.length}
            receivedRequests={receivedRequests.filter((r) => r.status === 'pending')}
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
