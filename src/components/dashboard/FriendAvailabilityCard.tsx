import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { FriendAvailability } from '../../types/dashboard';
import { UserAvatarSilhouette } from '../icons/NavIcons';
import { styles } from './FriendAvailabilityCard.styles';

export interface FriendAvailabilityCardProps {
  friend: FriendAvailability;
  onPress?: (friend: FriendAvailability) => void;
}

export const FriendAvailabilityCard: React.FC<FriendAvailabilityCardProps> = ({
  friend,
  onPress,
}) => {
  const [imageError, setImageError] = useState(false);

  const isUnknown =
    friend.isPrivate === true ||
    friend.hasSchedule === false ||
    friend.status === 'unknown' ||
    (friend.status !== 'free' && friend.status !== 'busy');

  const isFree = !isUnknown && friend.status === 'free';
  const isBusy = !isUnknown && friend.status === 'busy';

  // Subtitle / schedule range description
  const getSubtext = () => {
    if (isUnknown) {
      if (friend.isPrivate) {
        return 'Schedule is private';
      }
      return 'Availability unavailable';
    }

    if (isFree) {
      const until = friend.untilTime ? `Free until ${friend.untilTime}` : 'Currently free';
      const next = friend.nextActivity ? ` | Next: ${friend.nextActivity}` : '';
      return `${until}${next}`;
    }

    // Busy
    const current = friend.currentActivity || 'Busy';
    const until = friend.untilTime ? ` until ${friend.untilTime}` : '';
    const next = friend.nextActivity ? ` | Next: ${friend.nextActivity}` : '';
    return `${current}${until}${next}`;
  };

  const getStatusLabel = () => {
    if (isUnknown) return friend.isPrivate ? 'Private' : 'Unknown';
    if (isFree) return 'Free';
    return 'Busy';
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(friend)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${friend.name}, status: ${getStatusLabel()}`}
    >
      {/* Left Status Stripe */}
      <View
        style={[
          styles.accentStripe,
          isFree && styles.freeAccentStripe,
          isBusy && styles.busyAccentStripe,
          isUnknown && styles.unknownAccentStripe,
        ]}
      />

      <View style={styles.cardContent}>
        {/* Avatar: Image -> Initials -> Silhouette */}
        <View style={styles.avatarWrapper}>
          {friend.avatarUrl && !imageError ? (
            <Image
              source={{ uri: friend.avatarUrl }}
              style={styles.avatarImage}
              onError={() => setImageError(true)}
            />
          ) : friend.initials ? (
            <View style={styles.initialsAvatar}>
              <Text style={styles.initialsText}>{friend.initials.slice(0, 2).toUpperCase()}</Text>
            </View>
          ) : (
            <UserAvatarSilhouette size={46} color="#758A78" />
          )}
        </View>

        {/* Center Information */}
        <View style={styles.infoWrapper}>
          <Text style={styles.friendName} numberOfLines={1} ellipsizeMode="tail">
            {friend.name}
          </Text>
          <Text style={styles.subtext} numberOfLines={1} ellipsizeMode="tail">
            {getSubtext()}
          </Text>

          {/* Status Badge */}
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
                {friend.isPrivate ? 'PRIVATE' : 'UNKNOWN'}
              </Text>
            </View>
          )}
        </View>

        {/* Right Indicator and Chevron */}
        <View style={styles.rightActionWrapper}>
          {isFree && <View style={styles.greenCircleIndicator} />}
          {isBusy && <View style={styles.redSquareIndicator} />}
          {isUnknown && <View style={styles.unknownIndicator} />}
          <Text style={styles.chevronText}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
