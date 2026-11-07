import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { FriendAvailability } from '../../types/dashboard';
import { FriendAvailabilityCard } from './FriendAvailabilityCard';
import { styles } from './FriendAvailabilitySection.styles';

export interface FriendAvailabilitySectionProps {
  freeFriends: FriendAvailability[];
  busyFriends: FriendAvailability[];
  unknownFriends?: FriendAvailability[];
  onSelectFriend: (friend: FriendAvailability) => void;
  onViewAllFree: () => void;
  onViewAllBusy: () => void;
  onViewAllUnknown?: () => void;
  showAllFree?: boolean;
  showAllBusy?: boolean;
  showAllUnknown?: boolean;
}

export const FriendAvailabilitySection: React.FC<FriendAvailabilitySectionProps> = ({
  freeFriends,
  busyFriends,
  unknownFriends = [],
  onSelectFriend,
  onViewAllFree,
  onViewAllBusy,
  onViewAllUnknown,
  showAllFree = false,
  showAllBusy = false,
  showAllUnknown = false,
}) => {
  const displayedFree = showAllFree ? freeFriends : freeFriends.slice(0, 2);
  const displayedBusy = showAllBusy ? busyFriends : busyFriends.slice(0, 2);
  const displayedUnknown = showAllUnknown ? unknownFriends : unknownFriends.slice(0, 2);

  return (
    <View style={styles.container}>
      {/* ================= FREE NOW SECTION ================= */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.freePill}>
          <View style={styles.freePillDot} />
          <Text style={styles.freePillText}>Free Now</Text>
        </View>

        <TouchableOpacity
          style={styles.viewAllAction}
          onPress={onViewAllFree}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View all free friends"
        >
          <Text style={styles.viewAllText}>
            {showAllFree ? 'Show less' : 'View all'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Free Friends Cards */}
      {freeFriends.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No friends currently free in this group.</Text>
        </View>
      ) : (
        displayedFree.map((friend) => (
          <FriendAvailabilityCard
            key={friend.id}
            friend={friend}
            onPress={onSelectFriend}
          />
        ))
      )}

      {/* ================= BUSY SECTION ================= */}
      <View style={[styles.sectionHeaderRow, styles.busyHeaderRow]}>
        <View style={styles.busyPill}>
          <View style={styles.busyPillSquare} />
          <Text style={styles.busyPillText}>Busy</Text>
        </View>

        <TouchableOpacity
          style={styles.viewAllAction}
          onPress={onViewAllBusy}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View all busy friends"
        >
          <Text style={styles.viewAllText}>
            {showAllBusy ? 'Show less' : 'View all'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Busy Friends Cards */}
      {busyFriends.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No busy friends in this group right now.</Text>
        </View>
      ) : (
        displayedBusy.map((friend) => (
          <FriendAvailabilityCard
            key={friend.id}
            friend={friend}
            onPress={onSelectFriend}
          />
        ))
      )}

      {/* ================= UNKNOWN SECTION (IF PRESENT) ================= */}
      {unknownFriends.length > 0 && (
        <>
          <View style={[styles.sectionHeaderRow, styles.unknownHeaderRow]}>
            <View style={styles.unknownPill}>
              <View style={styles.unknownPillDot} />
              <Text style={styles.unknownPillText}>Unknown / Private</Text>
            </View>

            {onViewAllUnknown && (
              <TouchableOpacity
                style={styles.viewAllAction}
                onPress={onViewAllUnknown}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="View all unknown friends"
              >
                <Text style={styles.viewAllText}>
                  {showAllUnknown ? 'Show less' : 'View all'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {displayedUnknown.map((friend) => (
            <FriendAvailabilityCard
              key={friend.id}
              friend={friend}
              onPress={onSelectFriend}
            />
          ))}
        </>
      )}
    </View>
  );
};
