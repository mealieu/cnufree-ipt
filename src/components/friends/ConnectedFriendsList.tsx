import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { ConnectedFriend } from '../../types/friends';
import { FriendAvailability } from '../../types/dashboard';
import { UserAvatarSilhouette } from '../icons/NavIcons';
import { COLORS } from '../../constants/colors';
import { styles } from './ConnectedFriendsList.styles';

export type AvailabilityFilterType = 'all' | 'free' | 'busy' | 'unknown';

export interface ConnectedFriendsListProps {
  friends?: (ConnectedFriend | FriendAvailability)[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onSelectFriend?: (friend: FriendAvailability) => void;
  headerTitle?: string;
  showSearch?: boolean;
  showStatusFilters?: boolean;
  onBack?: () => void;
}

export const ConnectedFriendsList: React.FC<ConnectedFriendsListProps> = ({
  friends = [],
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load friends. Please try again.',
  onRetry,
  onSelectFriend,
  headerTitle = 'Connected Friends',
  showSearch = true,
  showStatusFilters = true,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<AvailabilityFilterType>('all');
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});

  // Deduplicate and normalize friend data
  const normalizedFriends = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{
      id: string;
      name: string;
      username?: string;
      initials: string;
      avatarUrl?: string;
      status: 'free' | 'busy' | 'unknown';
      availabilitySummary: string;
      scheduleProfile: FriendAvailability;
      groups: string[];
    }> = [];

    for (const item of friends) {
      if (!item || seen.has(item.id)) continue;
      seen.add(item.id);

      const isConnectedFriend = 'scheduleProfile' in item && !!item.scheduleProfile;
      const scheduleProfile: FriendAvailability = isConnectedFriend
        ? item.scheduleProfile
        : (item as FriendAvailability);

      // Determine availability respecting privacy: Do not classify missing schedules as Free
      const isMissingOrPrivate =
        !scheduleProfile ||
        scheduleProfile.isPrivate === true ||
        scheduleProfile.hasSchedule === false ||
        scheduleProfile.status === 'unknown' ||
        (scheduleProfile.status !== 'free' && scheduleProfile.status !== 'busy');

      const status: 'free' | 'busy' | 'unknown' = isMissingOrPrivate
        ? 'unknown'
        : scheduleProfile.status === 'free'
        ? 'free'
        : 'busy';

      let availabilitySummary = '';
      if (isConnectedFriend && item.availabilitySummary) {
        availabilitySummary = item.availabilitySummary;
      } else if (status === 'unknown') {
        availabilitySummary = scheduleProfile?.isPrivate
          ? 'Schedule is private'
          : 'Schedule unavailable';
      } else if (status === 'free') {
        availabilitySummary = scheduleProfile?.untilTime
          ? `Free until ${scheduleProfile.untilTime}`
          : 'Free now';
      } else {
        availabilitySummary = scheduleProfile?.untilTime
          ? `Busy until ${scheduleProfile.untilTime}`
          : 'Busy now';
      }

      list.push({
        id: item.id,
        name: item.name,
        username: 'username' in item ? item.username : undefined,
        initials: item.initials || item.name.slice(0, 2).toUpperCase(),
        avatarUrl: item.avatarUrl,
        status,
        availabilitySummary,
        scheduleProfile,
        groups: scheduleProfile?.groups || [],
      });
    }

    return list;
  }, [friends]);

  // Compute status counts
  const counts = useMemo(() => {
    let free = 0;
    let busy = 0;
    let unknown = 0;

    for (const f of normalizedFriends) {
      if (f.status === 'free') free++;
      else if (f.status === 'busy') busy++;
      else unknown++;
    }

    return {
      total: normalizedFriends.length,
      free,
      busy,
      unknown,
    };
  }, [normalizedFriends]);

  // Filter friends based on search query & active status filter
  const filteredFriends = useMemo(() => {
    return normalizedFriends.filter((friend) => {
      // Status filter
      if (activeFilter === 'free' && friend.status !== 'free') return false;
      if (activeFilter === 'busy' && friend.status !== 'busy') return false;
      if (activeFilter === 'unknown' && friend.status !== 'unknown') return false;

      // Search query
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = friend.name.toLowerCase().includes(query);
        const usernameMatch = friend.username?.toLowerCase().includes(query);
        const groupMatch = friend.groups.some((g) => g.toLowerCase().includes(query));
        return nameMatch || !!usernameMatch || groupMatch;
      }

      return true;
    });
  }, [normalizedFriends, activeFilter, searchQuery]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="large" color={COLORS.darkGreen} />
        <Text style={styles.stateTitle}>Loading Connected Friends</Text>
        <Text style={styles.stateSubtitle}>Retrieving real-time schedules and availability...</Text>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={styles.stateContainer}>
        <UserAvatarSilhouette size={48} color={COLORS.busyIndicatorRed} />
        <Text style={styles.stateTitle}>Unable to Load Friends</Text>
        <Text style={styles.stateSubtitle}>{errorMessage}</Text>
        {onRetry && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Retry loading friends"
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Optional Top Bar with Back Button */}
      {onBack && (
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back to friends overview"
          >
            <Text style={styles.backArrow}>‹</Text>
            <Text style={styles.backButtonText}>Friends</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Header Info */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <View style={styles.friendCountBadge}>
            <Text style={styles.friendCountText}>{counts.total} Connected</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Real-time availability and weekly timetables of your friends
        </Text>

        {/* Search Bar */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, handle, or group..."
              placeholderTextColor="#7A8C7F"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
                accessibilityRole="button"
                accessibilityLabel="Clear search input"
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Status Filters */}
        {showStatusFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            <TouchableOpacity
              style={[
                styles.filterPill,
                activeFilter === 'all' && styles.activeFilterPill,
              ]}
              onPress={() => setActiveFilter('all')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`All friends, total ${counts.total}`}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === 'all' && styles.activeFilterPillText,
                ]}
              >
                All ({counts.total})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                activeFilter === 'free' && styles.activeFilterPill,
              ]}
              onPress={() => setActiveFilter('free')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Free friends, total ${counts.free}`}
            >
              <View style={[styles.filterDot, styles.freeFilterDot]} />
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === 'free' && styles.activeFilterPillText,
                ]}
              >
                Free ({counts.free})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                activeFilter === 'busy' && styles.activeFilterPill,
              ]}
              onPress={() => setActiveFilter('busy')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Occupied friends, total ${counts.busy}`}
            >
              <View style={[styles.filterDot, styles.busyFilterDot]} />
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === 'busy' && styles.activeFilterPillText,
                ]}
              >
                Occupied ({counts.busy})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                activeFilter === 'unknown' && styles.activeFilterPill,
              ]}
              onPress={() => setActiveFilter('unknown')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Unknown availability, total ${counts.unknown}`}
            >
              <View style={[styles.filterDot, styles.unknownFilterDot]} />
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === 'unknown' && styles.activeFilterPillText,
                ]}
              >
                Unknown ({counts.unknown})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* Friends List or Empty States */}
      <View style={styles.listContent}>
        {filteredFriends.length === 0 ? (
          <View style={styles.stateContainer}>
            <UserAvatarSilhouette size={44} color="#758A78" />
            <Text style={styles.stateTitle}>
              {searchQuery.trim().length > 0
                ? 'No matching friends found'
                : 'No friends in this status'}
            </Text>
            <Text style={styles.stateSubtitle}>
              {searchQuery.trim().length > 0
                ? `No friends match "${searchQuery}". Please check the spelling or clear the filter.`
                : 'None of your connected friends are currently in this availability status.'}
            </Text>
            {searchQuery.trim().length > 0 && (
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => setSearchQuery('')}
                accessibilityRole="button"
                accessibilityLabel="Clear search query"
              >
                <Text style={styles.clearSearchButtonText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredFriends.map((friend) => {
            const hasImage = !!friend.avatarUrl && !failedImageIds[friend.id];
            const isFree = friend.status === 'free';
            const isBusy = friend.status === 'busy';
            const isUnknown = friend.status === 'unknown';

            return (
              <TouchableOpacity
                key={friend.id}
                style={styles.friendItemCard}
                onPress={() => onSelectFriend?.(friend.scheduleProfile)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={`${friend.name}, ${friend.status} availability`}
              >
                {/* Status Accent Stripe */}
                <View
                  style={[
                    styles.accentStripe,
                    isFree && styles.freeAccentStripe,
                    isBusy && styles.busyAccentStripe,
                    isUnknown && styles.unknownAccentStripe,
                  ]}
                />

                <View style={styles.cardContent}>
                  {/* Avatar: Image -> Initials Fallback */}
                  <View style={styles.avatarWrapper}>
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
                      <View style={styles.initialsAvatar}>
                        <Text style={styles.initialsText}>
                          {friend.initials.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Profile & Availability Info */}
                  <View style={styles.infoWrapper}>
                    <Text style={styles.friendName} numberOfLines={1}>
                      {friend.name}
                    </Text>
                    {friend.username && (
                      <Text style={styles.friendUsername} numberOfLines={1}>
                        {friend.username}
                      </Text>
                    )}
                    <Text style={styles.availabilityText} numberOfLines={1}>
                      {friend.availabilitySummary}
                    </Text>

                    {/* Badge */}
                    <View style={styles.badgeRow}>
                      {isFree && (
                        <View style={[styles.badge, styles.vacantBadge]}>
                          <Text style={styles.vacantBadgeText}>Vacant</Text>
                        </View>
                      )}
                      {isBusy && (
                        <View style={[styles.badge, styles.busyBadge]}>
                          <Text style={styles.busyBadgeText}>BUSY</Text>
                        </View>
                      )}
                      {isUnknown && (
                        <View style={[styles.badge, styles.unknownBadge]}>
                          <Text style={styles.unknownBadgeText}>
                            {friend.scheduleProfile?.isPrivate
                              ? 'PRIVATE'
                              : 'UNKNOWN'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Action Button: View Schedule */}
                  <View style={styles.rightActionWrapper}>
                    <TouchableOpacity
                      style={styles.scheduleButton}
                      onPress={() => onSelectFriend?.(friend.scheduleProfile)}
                      activeOpacity={0.75}
                      accessibilityRole="button"
                      accessibilityLabel={`View ${friend.name}'s schedule`}
                    >
                      <Text style={styles.scheduleButtonText}>Schedule</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </View>
  );
};

