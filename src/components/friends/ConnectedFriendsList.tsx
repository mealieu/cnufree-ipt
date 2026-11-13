import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  RefreshControl,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { ConnectedFriend } from '../../types/friends';
import { FriendAvailability } from '../../types/dashboard';
import { TabId } from '../../types/navigation';
import { BottomNavBar } from '../navigation/BottomNavBar';
import { COLORS } from '../../constants/colors';
import { styles } from './ConnectedFriendsList.styles';

export interface ConnectedFriendsListProps {
  friends?: (ConnectedFriend | FriendAvailability)[];
  onBack?: () => void;
  onNavigateTab?: (tab: TabId) => void;
  onSelectFriend?: (friend: FriendAvailability) => void;
  onRemoveFriend?: (friend: ConnectedFriend | FriendAvailability) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  notificationBadgeCount?: number;
  showBottomNavBar?: boolean;
}

export const ConnectedFriendsList: React.FC<ConnectedFriendsListProps> = ({
  friends = [],
  onBack,
  onNavigateTab,
  onSelectFriend,
  onRemoveFriend,
  refreshing = false,
  onRefresh,
  notificationBadgeCount = 0,
  showBottomNavBar = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});

  const [friendToRemove, setFriendToRemove] = useState<any | null>(null);
  const getFirstName = (fullName: string) => fullName.split(' ')[0];

  // Normalize friends and compute availability summaries
  const normalizedFriends = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{
      id: string;
      name: string;
      username: string;
      initials: string;
      avatarUrl?: string;
      availabilitySummary: string;
      scheduleProfile: FriendAvailability;
      originalItem: ConnectedFriend | FriendAvailability;
    }> = [];

    for (const item of friends) {
      if (!item || seen.has(item.id)) continue;
      seen.add(item.id);

      const isConnectedFriend = 'scheduleProfile' in item && !!item.scheduleProfile;
      const scheduleProfile: FriendAvailability = isConnectedFriend
        ? item.scheduleProfile
        : (item as FriendAvailability);

      // Handle availability summary respecting privacy:
      // Examples from Figma specification:
      // "Free until 11:00 AM", "Occupied until 1:00 PM", "Availability unavailable"
      const isMissingOrPrivate =
        !scheduleProfile ||
        scheduleProfile.isPrivate === true ||
        scheduleProfile.hasSchedule === false ||
        scheduleProfile.status === 'unknown' ||
        (scheduleProfile.status !== 'free' && scheduleProfile.status !== 'busy');

      let availabilitySummary = 'Availability unavailable';
      if (isMissingOrPrivate) {
        availabilitySummary = scheduleProfile?.isPrivate
          ? 'Availability unavailable'
          : 'Availability unavailable';
      } else if (scheduleProfile.status === 'free') {
        availabilitySummary = scheduleProfile.untilTime
          ? `Free until ${scheduleProfile.untilTime}`
          : 'Free now';
      } else if (scheduleProfile.status === 'busy') {
        availabilitySummary = scheduleProfile.untilTime
          ? `Occupied until ${scheduleProfile.untilTime}`
          : 'Occupied now';
      }

      // If item already carries custom summary from mock data, use it if non-empty
      if (isConnectedFriend && item.availabilitySummary) {
        availabilitySummary = item.availabilitySummary;
      }

      const username =
        'username' in item && item.username
          ? item.username
          : `@${item.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

      list.push({
        id: item.id,
        name: item.name,
        username,
        initials: item.initials || item.name.slice(0, 2).toUpperCase(),
        avatarUrl: item.avatarUrl,
        availabilitySummary,
        scheduleProfile,
        originalItem: item,
      });
    }

    return list;
  }, [friends]);

  // Real-time search filter
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return normalizedFriends;
    const query = searchQuery.trim().toLowerCase();
    return normalizedFriends.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.username.toLowerCase().includes(query)
    );
  }, [normalizedFriends, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* 1. Header (Back arrow on left, Centered "Friends" title) */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Back to Friends"
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 19L8 12L15 5"
              stroke="#132016"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        <Text style={styles.topHeaderTitle}>Friends</Text>

        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.headerHairline} />

      {/* 2. Scrollable Body Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.darkGreen}
              colors={[COLORS.darkGreen]}
            />
          ) : undefined
        }
      >
        <View style={styles.contentContainer}>
          {/* Section Heading: "My Friends" Pill */}
          <View style={styles.sectionPill}>
            <Text style={styles.sectionPillText}>My Friends</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchIconWrapper}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle cx="11" cy="11" r="7" stroke="#3A4D3B" strokeWidth={2.2} />
                <Path
                  d="M16.5 16.5L21 21"
                  stroke="#3A4D3B"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                />
              </Svg>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search your friends"
              placeholderTextColor="rgba(58, 77, 59, 0.65)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchButton}
                accessibilityRole="button"
                accessibilityLabel="Clear search input"
              >
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Connected Friends Horizontal Rows */}
          <View style={styles.listContainer}>
            {filteredFriends.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery.trim().length > 0
                    ? `No friends matching "${searchQuery.trim()}"`
                    : 'No connected friends found'}
                </Text>
              </View>
            ) : (
              filteredFriends.map((friend) => {
                const hasImage = !!friend.avatarUrl && !failedImageIds[friend.id];

                return (
                  <View key={friend.id} style={styles.friendRow}>
                    {/* Left: Avatar + Details */}
                    <TouchableOpacity
                      style={styles.friendLeftTouchable}
                      activeOpacity={0.8}
                      onPress={() => onSelectFriend?.(friend.scheduleProfile)}
                      accessibilityRole="button"
                      accessibilityLabel={`${friend.name}, ${friend.username}`}
                    >
                      <View style={styles.avatarCircle}>
                        {hasImage ? (
                          <Image
                            source={{ uri: friend.avatarUrl }}
                            style={styles.avatarImage}
                            onError={() =>
                              setFailedImageIds((prev) => ({
                                ...prev,
                                [friend.id]: true,
                              }))
                            }
                          />
                        ) : (
                          <Text style={styles.avatarInitials}>
                            {friend.initials}
                          </Text>
                        )}
                      </View>

                      <View style={styles.friendInfo}>
                        <Text style={styles.friendName} numberOfLines={1}>
                          {friend.name}
                        </Text>
                        <Text style={styles.friendHandle} numberOfLines={1}>
                          {friend.username}
                        </Text>
                        <Text style={styles.availabilitySummary} numberOfLines={1}>
                          {friend.availabilitySummary}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Right: Actions ("Schedule" & "Remove") */}
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.scheduleButton}
                        onPress={() => onSelectFriend?.(friend.scheduleProfile)}
                        activeOpacity={0.75}
                        accessibilityRole="button"
                        accessibilityLabel={`View ${friend.name}'s schedule`}
                      >
                        <Text style={styles.scheduleButtonText}>Schedule</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => setFriendToRemove(friend)}
                        activeOpacity={0.75}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${friend.name}`}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* REMOVE FRIEND MODAL */}
      <Modal visible={!!friendToRemove} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Remove {friendToRemove ? getFirstName(friendToRemove.name) : ''} as a friend?
            </Text>
            <Text style={styles.modalBody}>
              You and {friendToRemove ? getFirstName(friendToRemove.name) : ''} will lose access to each other's shared schedules. {friendToRemove ? getFirstName(friendToRemove.name) : ''} will be removed from all your friend groups. You can still find each other and send a new friend request.
            </Text>
            
            <TouchableOpacity 
              style={styles.modalPrimaryBtn} 
              onPress={() => {
                if (friendToRemove) {
                  onRemoveFriend?.(friendToRemove.originalItem);
                }
                setFriendToRemove(null);
              }}
            >
              <Text style={styles.modalPrimaryBtnText}>Remove friend</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalSecondaryBtn} 
              onPress={() => setFriendToRemove(null)}
            >
              <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3. Existing Bottom Navigation Bar (Friends tab selected) */}
      {showBottomNavBar && (
        <BottomNavBar
          activeTab="friends"
          onTabChange={(tab) => {
            onNavigateTab?.(tab);
          }}
          notificationBadgeCount={notificationBadgeCount}
        />
      )}
    </SafeAreaView>
  );
};
