import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { ConnectedFriendsSectionProps } from '../../types/friends';

export const ConnectedFriendsSection: React.FC<ConnectedFriendsSectionProps> = ({
  friends,
  totalCount,
  showAll,
  onToggleViewAll,
  onPressSchedule,
  onPressFriend,
  searchQuery = '',
}) => {
  return (
    <View style={styles.sectionContainer}>
      {/* Section Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.sectionTitle}>Connected Friends</Text>
          <View style={styles.bulletDot} />
          <Text style={styles.countText}>{totalCount}</Text>
        </View>

        <TouchableOpacity
          onPress={onToggleViewAll}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={showAll ? 'Show fewer connected friends' : 'View all connected friends'}
        >
          <Text style={styles.viewAllText}>
            {showAll ? 'Show Less' : 'View All'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Connected Friends List or Empty Fallback */}
      {friends.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery.trim().length > 0
              ? `No connected friends matching "${searchQuery.trim()}"`
              : 'No connected friends yet'}
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {friends.map((friend) => (
            <View key={friend.id} style={styles.friendRow}>
              <TouchableOpacity
                style={styles.friendProfileTouch}
                activeOpacity={0.8}
                onPress={() => onPressFriend ? onPressFriend(friend) : onPressSchedule(friend)}
                accessibilityRole="button"
                accessibilityLabel={`${friend.name}, ${friend.username}`}
              >
                <View style={styles.avatarCircle} />
                <View style={styles.friendTextContainer}>
                  <Text style={styles.friendName} numberOfLines={1}>
                    {friend.name}
                  </Text>
                  <Text style={styles.friendUsername} numberOfLines={1}>
                    {friend.username}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.scheduleButton}
                onPress={() => onPressSchedule(friend)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`View ${friend.name}'s schedule`}
              >
                <Text style={styles.scheduleButtonText}>Schedule</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 34,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.friendsOliveText,
    letterSpacing: 0.1,
  },
  bulletDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.friendsOliveText,
    marginLeft: 8,
    marginRight: 13,
  },
  countText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.friendsCountGreen,
  },
  viewAllText: {
    fontFamily: FONTS.regular,
    fontSize: 15.5,
    color: COLORS.friendsOliveText,
    textDecorationLine: 'underline',
  },
  listContainer: {
    gap: 24,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  friendProfileTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.friendsAvatarBg,
    borderWidth: 2,
    borderColor: COLORS.friendsAvatarBorder,
  },
  friendTextContainer: {
    flex: 1,
    marginLeft: 18,
    justifyContent: 'center',
  },
  friendName: {
    fontFamily: FONTS.bold,
    fontSize: 15.5,
    color: '#0F1711',
    letterSpacing: -0.1,
  },
  friendUsername: {
    fontFamily: FONTS.regular,
    fontSize: 14.5,
    color: '#18221B',
    marginTop: 2,
  },
  scheduleButton: {
    backgroundColor: COLORS.friendsScheduleBtnBg,
    borderWidth: 1,
    borderColor: COLORS.friendsScheduleBtnBorder,
    borderRadius: 2,
    paddingVertical: 7,
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: '#0F1711',
  },
  emptyContainer: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(91, 105, 85, 0.08)',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.friendsOliveText,
    textAlign: 'center',
  },
});
