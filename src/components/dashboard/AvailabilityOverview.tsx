import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { FriendAvailability } from '../../types/dashboard';
import { COLORS } from '../../constants/colors';
import { styles } from './AvailabilityOverview.styles';

export interface AvailabilityOverviewProps {
  friends?: FriendAvailability[];
  totalCount?: number;
  freeCount?: number;
  occupiedCount?: number;
  unknownCount?: number;
  isLoading?: boolean;
}

export const AvailabilityOverview: React.FC<AvailabilityOverviewProps> = ({
  friends,
  totalCount,
  freeCount,
  occupiedCount,
  unknownCount,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.card}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.darkGreen} />
            <Text style={styles.loadingText}>Updating friend availability...</Text>
          </View>
        </View>
      </View>
    );
  }

  let computedFree = 0;
  let computedOccupied = 0;
  let computedUnknown = 0;
  let computedTotal = 0;

  if (friends) {
    computedTotal = friends.length;
    for (const friend of friends) {
      const isUnknown =
        friend.isPrivate === true ||
        friend.hasSchedule === false ||
        friend.status === 'unknown' ||
        (friend.status !== 'free' && friend.status !== 'busy');

      if (isUnknown) {
        computedUnknown += 1;
      } else if (friend.status === 'free') {
        computedFree += 1;
      } else if (friend.status === 'busy') {
        computedOccupied += 1;
      }
    }
  }

  const resolvedFree = freeCount ?? computedFree;
  const resolvedOccupied = occupiedCount ?? computedOccupied;
  const resolvedUnknown = unknownCount ?? computedUnknown;
  const resolvedTotal = totalCount ?? (resolvedFree + resolvedOccupied + resolvedUnknown);

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Availability Summary</Text>
          <Text style={styles.statusContext}>Real-time status</Text>
        </View>

        {resolvedTotal === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No friends in this group</Text>
          </View>
        ) : (
          <View style={styles.statsRow}>
            {/* Total Friends */}
            <View style={styles.statColumn}>
              <View style={styles.countRow}>
                <View style={[styles.indicatorDot, styles.totalDot]} />
                <Text style={styles.statCount}>{resolvedTotal}</Text>
              </View>
              <Text style={styles.statLabel}>Total</Text>
            </View>

            <View style={styles.statDivider} />

            {/* Free Friends */}
            <View style={styles.statColumn}>
              <View style={styles.countRow}>
                <View style={[styles.indicatorDot, styles.freeDot]} />
                <Text style={styles.statCount}>{resolvedFree}</Text>
              </View>
              <Text style={styles.statLabel}>Free</Text>
            </View>

            <View style={styles.statDivider} />

            {/* Occupied Friends */}
            <View style={styles.statColumn}>
              <View style={styles.countRow}>
                <View style={[styles.indicatorDot, styles.occupiedDot]} />
                <Text style={styles.statCount}>{resolvedOccupied}</Text>
              </View>
              <Text style={styles.statLabel}>Occupied</Text>
            </View>

            <View style={styles.statDivider} />

            {/* Unknown Friends */}
            <View style={styles.statColumn}>
              <View style={styles.countRow}>
                <View style={[styles.indicatorDot, styles.unknownDot]} />
                <Text style={styles.statCount}>{resolvedUnknown}</Text>
              </View>
              <Text style={styles.statLabel}>Unknown</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
