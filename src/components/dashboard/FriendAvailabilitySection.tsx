import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FriendAvailability } from '../../types/dashboard';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { UserAvatarSilhouette } from '../icons/NavIcons';

interface FriendAvailabilitySectionProps {
  freeFriends: FriendAvailability[];
  busyFriends: FriendAvailability[];
  onSelectFriend: (friend: FriendAvailability) => void;
  onViewAllFree: () => void;
  onViewAllBusy: () => void;
  showAllFree?: boolean;
  showAllBusy?: boolean;
}

export const FriendAvailabilitySection: React.FC<FriendAvailabilitySectionProps> = ({
  freeFriends,
  busyFriends,
  onSelectFriend,
  onViewAllFree,
  onViewAllBusy,
  showAllFree = false,
  showAllBusy = false,
}) => {
  const displayedFree = showAllFree ? freeFriends : freeFriends.slice(0, 2);
  const displayedBusy = showAllBusy ? busyFriends : busyFriends.slice(0, 2);

  return (
    <View style={styles.container}>
      {/* ================= FREE NOW SECTION ================= */}
      <View style={styles.sectionHeaderRow}>
        {/* Pill Badge */}
        <View style={styles.freePill}>
          <View style={styles.freePillDot} />
          <Text style={styles.freePillText}>Free Now</Text>
        </View>

        {/* View All Action */}
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
          <TouchableOpacity
            key={friend.id}
            style={[styles.friendCard, styles.freeFriendCard]}
            onPress={() => onSelectFriend(friend)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`${friend.name}, free until ${friend.untilTime}`}
          >
            {/* Left Dark Accent Stripe */}
            <View style={styles.freeAccentStripe} />

            <View style={styles.cardContent}>
              {/* Avatar Silhouette */}
              <View style={styles.avatarWrapper}>
                <UserAvatarSilhouette size={46} color="#758A78" />
              </View>

              {/* Center Info */}
              <View style={styles.infoWrapper}>
                <Text style={styles.friendName} numberOfLines={1}>
                  {friend.name}
                </Text>
                <Text style={styles.subtext} numberOfLines={1}>
                  Free until {friend.untilTime}
                  {friend.nextActivity ? ` | Next: ${friend.nextActivity}` : ''}
                </Text>
                {/* Vacant Badge */}
                <View style={styles.vacantBadge}>
                  <Text style={styles.vacantBadgeText}>Vacant</Text>
                </View>
              </View>

              {/* Right Indicator and Chevron */}
              <View style={styles.rightActionWrapper}>
                <View style={styles.greenCircleIndicator} />
                <Text style={styles.chevronText}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* ================= BUSY SECTION ================= */}
      <View style={[styles.sectionHeaderRow, styles.busyHeaderRow]}>
        {/* Pill Badge */}
        <View style={styles.busyPill}>
          <View style={styles.busyPillSquare} />
          <Text style={styles.busyPillText}>Busy</Text>
        </View>

        {/* View All Action */}
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
          <TouchableOpacity
            key={friend.id}
            style={[styles.friendCard, styles.busyFriendCard]}
            onPress={() => onSelectFriend(friend)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`${friend.name}, busy until ${friend.untilTime}`}
          >
            {/* Left Coral Accent Stripe */}
            <View style={styles.busyAccentStripe} />

            <View style={styles.cardContent}>
              {/* Avatar Silhouette */}
              <View style={styles.avatarWrapper}>
                <UserAvatarSilhouette size={46} color="#758A78" />
              </View>

              {/* Center Info */}
              <View style={styles.infoWrapper}>
                <Text style={styles.friendName} numberOfLines={1}>
                  {friend.name}
                </Text>
                <Text style={styles.subtext} numberOfLines={1}>
                  Busy until {friend.untilTime}
                  {friend.currentActivity ? ` | ${friend.currentActivity}` : ''}
                </Text>
                {/* BUSY Badge */}
                <View style={styles.busyBadge}>
                  <Text style={styles.busyBadgeText}>BUSY</Text>
                </View>
              </View>

              {/* Right Indicator and Chevron */}
              <View style={styles.rightActionWrapper}>
                <View style={styles.redSquareIndicator} />
                <Text style={styles.chevronText}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    marginVertical: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  busyHeaderRow: {
    marginTop: 16,
  },
  freePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.freePillBg,
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.freePillBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  freePillDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#16A34A',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#34D399',
  },
  freePillText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#0F1A12',
  },
  busyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.busyPillBg,
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.busyPillBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  busyPillSquare: {
    width: 13,
    height: 13,
    borderRadius: 2,
    backgroundColor: '#DC2626',
    marginRight: 8,
  },
  busyPillText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#3B1313',
  },
  viewAllAction: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  viewAllText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#3B4E3E',
  },
  friendCard: {
    backgroundColor: COLORS.sageCardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.sageCardBorder,
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  freeFriendCard: {},
  busyFriendCard: {},
  freeAccentStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#1E482C',
    zIndex: 2,
  },
  busyAccentStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#E57373',
    zIndex: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 14,
  },
  avatarWrapper: {
    marginRight: 12,
  },
  infoWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  friendName: {
    fontFamily: FONTS.bold,
    fontSize: 15.5,
    color: '#0F1812',
    marginBottom: 2,
  },
  subtext: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#213024',
    marginBottom: 6,
  },
  vacantBadge: {
    backgroundColor: COLORS.vacantBadgeBg,
    borderWidth: 1,
    borderColor: COLORS.vacantBadgeBorder,
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  vacantBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.vacantBadgeText,
  },
  busyBadge: {
    backgroundColor: COLORS.busyBadgeBg,
    borderWidth: 1,
    borderColor: COLORS.busyBadgeBorder,
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  busyBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.busyBadgeText,
  },
  rightActionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  greenCircleIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.freeIndicatorGreen,
    marginRight: 8,
  },
  redSquareIndicator: {
    width: 20,
    height: 20,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: COLORS.busyIndicatorRed,
    marginRight: 8,
  },
  chevronText: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#1A291E',
    lineHeight: 22,
  },
  emptyCard: {
    backgroundColor: 'rgba(235, 240, 226, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(35, 50, 38, 0.15)',
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#3B4E3E',
    textAlign: 'center',
  },
});
