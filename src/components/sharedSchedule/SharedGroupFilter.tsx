import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { FONTS } from '../../constants/typography';
import { COLORS } from '../../constants/colors';
import { SharedFriendGroup, SharedGroupFilterProps } from '../../types/sharedSchedule';

export const SharedGroupFilter: React.FC<SharedGroupFilterProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  onManageGroups,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeGroup =
    groups.find((g) => g.id === selectedGroupId) || groups[0];

  const handleSelect = (group: SharedFriendGroup) => {
    onSelectGroup(group);
    setIsDropdownOpen(false);
  };

  // Preview up to 4 avatar initials
  const avatarInitials = activeGroup.members.slice(0, 4).map((m) => m.initials);

  return (
    <View style={styles.wrapper}>
      {/* Dropdown Trigger Pill */}
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={() => setIsDropdownOpen(true)}
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
          <Text style={styles.memberCountText}>
            {activeGroup.memberCount}{' '}
            {activeGroup.memberCount === 1 ? 'person' : 'people'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Group Selector Dropdown Modal (Architectural Context for SS-02) */}
      <Modal
        visible={isDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Friend Group</Text>
              <TouchableOpacity
                onPress={() => setIsDropdownOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="#2D4031"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* List of Groups */}
            <ScrollView style={styles.groupsList} showsVerticalScrollIndicator={false}>
              {groups.map((group) => {
                const isSelected = group.id === selectedGroupId;
                return (
                  <TouchableOpacity
                    key={group.id}
                    style={[
                      styles.groupOptionItem,
                      isSelected && styles.groupOptionItemSelected,
                    ]}
                    onPress={() => handleSelect(group)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.groupOptionLeft}>
                      <View
                        style={[
                          styles.groupIconCircle,
                          isSelected && styles.groupIconCircleSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.groupIconText,
                            isSelected && styles.groupIconTextSelected,
                          ]}
                        >
                          {group.name.substring(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.groupOptionInfo}>
                        <Text
                          style={[
                            styles.groupOptionName,
                            isSelected && styles.groupOptionNameSelected,
                          ]}
                        >
                          {group.name}
                        </Text>
                        <Text style={styles.groupOptionMembers}>
                          {group.memberCount}{' '}
                          {group.memberCount === 1 ? 'member' : 'members'}
                          {group.description ? ` • ${group.description}` : ''}
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <View style={styles.checkmarkBadge}>
                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                          <Path
                            d="M20 6L9 17L4 12"
                            stroke="#FFFFFF"
                            strokeWidth={2.6}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
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

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(21, 36, 25, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FAF7EF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 380,
    maxHeight: 460,
    padding: 20,
    borderWidth: 1.2,
    borderColor: '#D7E2D5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E4ECE2',
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#152419',
  },
  groupsList: {
    maxHeight: 340,
  },
  groupOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: '#F3F6F0',
  },
  groupOptionItemSelected: {
    backgroundColor: '#E2ECE1',
    borderWidth: 1,
    borderColor: '#2D6B3C',
  },
  groupOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  groupIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#CCD8CA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupIconCircleSelected: {
    backgroundColor: '#1E5830',
  },
  groupIconText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#283B2D',
  },
  groupIconTextSelected: {
    color: '#FFFFFF',
  },
  groupOptionInfo: {
    flex: 1,
  },
  groupOptionName: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#152419',
  },
  groupOptionNameSelected: {
    color: '#1E5830',
  },
  groupOptionMembers: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#55695A',
    marginTop: 2,
  },
  checkmarkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E5830',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

