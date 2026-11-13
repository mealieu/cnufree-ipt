import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { FONTS } from '../../constants/typography';
import { COLORS } from '../../constants/colors';
import { SharedFriendGroup, SharedGroupFilterProps } from '../../types/sharedSchedule';
import { FriendGroupSelectorModal } from './FriendGroupSelectorModal';

export const SharedGroupFilter: React.FC<SharedGroupFilterProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  onOpenSelector,
  onManageGroups,
}) => {
  const [internalModalOpen, setInternalModalOpen] = useState(false);

  const activeGroup =
    groups.find((g) => g.id === selectedGroupId) || groups[0];

  const handlePress = () => {
    if (onOpenSelector) {
      onOpenSelector();
    } else {
      setInternalModalOpen(true);
    }
  };

  const handleSelect = (group: SharedFriendGroup) => {
    onSelectGroup(group);
  };

  // Preview up to 4 avatar initials (if any)
  const avatarInitials = activeGroup.members.slice(0, 4).map((m) => m.initials);

  return (
    <View style={styles.wrapper}>
      {/* Dropdown Trigger Pill */}
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityLabel={`Friend group filter: ${activeGroup.name}`}
        accessibilityRole="button"
      >
        {/* Left Side: Group Icon, Title, and Chevron */}
        <View style={styles.leftContent}>
          {/* Group / Users Icon */}
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx="8" cy="8" r="3.2" stroke="#253A2A" strokeWidth={2} />
            <Path
              d="M2.5 19C2.5 15.5 5 13.5 8 13.5C10 13.5 11.5 14.5 12.3 16"
              stroke="#253A2A"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Circle cx="16" cy="9.5" r="2.8" stroke="#253A2A" strokeWidth={2} />
            <Path
              d="M12.5 19C12.5 16.5 14.2 15 16.5 15C19 15 21.5 16.5 21.5 19"
              stroke="#253A2A"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>

          {/* Group Name */}
          <Text style={styles.groupNameText} numberOfLines={1}>
            {activeGroup.name}
          </Text>

          {/* Chevron Down */}
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              d="M6 9L12 15L18 9"
              stroke="#2A3C2F"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        {/* Right Side: Stacked Member Avatars & Count */}
        <View style={styles.rightContent}>
          {avatarInitials.length > 0 && (
            <View style={styles.avatarStack}>
              {avatarInitials.map((initials, index) => (
                <View
                  key={`${initials}-${index}`}
                  style={[
                    styles.stackedAvatar,
                    {
                      marginLeft: index > 0 ? -6 : 0,
                      zIndex: avatarInitials.length - index,
                    },
                  ]}
                >
                  <Text style={styles.avatarInitialsText}>{initials}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.memberCountText}>
            {activeGroup.memberCount}{' '}
            {activeGroup.memberCount === 1 ? 'person' : 'people'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Fallback modal if onOpenSelector is not provided */}
      {!onOpenSelector && (
        <FriendGroupSelectorModal
          visible={internalModalOpen}
          onClose={() => setInternalModalOpen(false)}
          groups={groups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={handleSelect}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF3EC',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#DFE7DD',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  groupNameText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#152419',
    letterSpacing: -0.2,
    maxWidth: 170,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5C6D5F',
    borderWidth: 1.5,
    borderColor: '#EEF3EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialsText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: '#FFFFFF',
  },
  memberCountText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#4B5E4F',
  },
});
