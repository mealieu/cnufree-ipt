import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { FriendGroupsSectionProps } from '../../types/friends';

export const FriendGroupsSection: React.FC<FriendGroupsSectionProps> = ({
  groups,
  totalCount,
  isManaging,
  selectedGroupId,
  onToggleManage,
  onSelectGroup,
  onPressCreateGroup,
}) => {
  const visibleGroups = isManaging ? groups : groups.slice(0, 1);

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.sectionTitle}>Friend Groups</Text>
          <View style={styles.bulletDot} />
          <Text style={styles.countText}>{totalCount}</Text>
        </View>

        <TouchableOpacity
          onPress={onToggleManage}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={isManaging ? 'Done managing friend groups' : 'Manage friend groups'}
        >
          <Text style={styles.manageText}>
            {isManaging ? 'Done' : 'Manage'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Group Pill Bars */}
      {visibleGroups.length === 0 ? (
        <View style={styles.emptyGroupBox}>
          <Text style={styles.emptyGroupText}>No matching friend groups found</Text>
        </View>
      ) : (
        <View style={styles.groupsList}>
          {visibleGroups.map((group) => {
            const isSelected = selectedGroupId === group.id;
            return (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.groupPill,
                  isSelected && styles.groupPillSelected,
                ]}
                onPress={() => onSelectGroup(group)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Friend group ${group.name}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={styles.groupPillText}>{group.name}</Text>
                {(isManaging || isSelected) && (
                  <Text style={styles.groupPillMeta}>
                    {isSelected
                      ? 'Filtering • Tap to clear'
                      : `${group.memberCount} ${group.memberCount === 1 ? 'member' : 'members'}`}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* + Create friend group Button */}
      <TouchableOpacity
        style={styles.createGroupButton}
        onPress={onPressCreateGroup}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Create friend group"
      >
        <Text style={styles.createGroupButtonText}>+ Create friend group</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
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
    marginLeft: 14,
    marginRight: 14,
  },
  countText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.friendsOliveText,
  },
  manageText: {
    fontFamily: FONTS.regular,
    fontSize: 15.5,
    color: COLORS.friendsOliveText,
    textDecorationLine: 'underline',
  },
  groupsList: {
    gap: 12,
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  groupPill: {
    backgroundColor: COLORS.friendsGroupPillBg,
    borderWidth: 1.5,
    borderColor: COLORS.friendsGroupPillBorder,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupPillSelected: {
    borderColor: COLORS.darkGreen,
    borderWidth: 2,
  },
  groupPillText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#0F1711',
  },
  groupPillMeta: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: COLORS.cream,
  },
  createGroupButton: {
    alignSelf: 'center',
    width: '78%',
    maxWidth: 276,
    backgroundColor: COLORS.friendsMintBtnBg,
    borderWidth: 1.2,
    borderColor: COLORS.friendsMintBtnBorder,
    borderRadius: 3,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createGroupButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#0F1711',
  },
  emptyGroupBox: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(91, 105, 85, 0.08)',
    alignItems: 'center',
  },
  emptyGroupText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.friendsOliveText,
  },
});
