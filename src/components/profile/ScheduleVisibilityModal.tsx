import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { styles } from './ProfileModals.styles';
import {
  EXTENDED_CONNECTED_FRIENDS,
  INITIAL_FRIEND_GROUPS,
} from '../../mock/friendsData';
import { UsersGroupIcon } from './ProfileIcons';
import {
  VisibilityOption,
  ScheduleVisibilityDetails,
} from '../../types/profile';

export type { VisibilityOption, ScheduleVisibilityDetails };

export interface ScheduleVisibilityModalProps {
  visible: boolean;
  currentVisibility?: VisibilityOption;
  initialSelectedFriendIds?: string[];
  initialSelectedGroupIds?: string[];
  onClose: () => void;
  onSave: (
    visibility: VisibilityOption,
    details?: ScheduleVisibilityDetails
  ) => void;
}

type CanonicalOption = 'only_me' | 'friends_only' | 'selected_friends';

function normalizeVisibility(val?: VisibilityOption): CanonicalOption {
  if (val === 'only_me' || val === 'private') return 'only_me';
  if (val === 'selected_friends' || val === 'public') return 'selected_friends';
  return 'friends_only';
}

export const ScheduleVisibilityModal: React.FC<ScheduleVisibilityModalProps> = ({
  visible,
  currentVisibility = 'friends_only',
  initialSelectedFriendIds = ['cf-1', 'cf-2'],
  initialSelectedGroupIds = ['fg-it-pwends'],
  onClose,
  onSave,
}) => {
  const [selected, setSelected] = useState<CanonicalOption>(
    normalizeVisibility(currentVisibility)
  );
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>(
    initialSelectedFriendIds
  );
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    initialSelectedGroupIds
  );

  // Sub-view toggle to configure individual friends or groups
  const [isConfiguringAccess, setIsConfiguringAccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'friends' | 'groups'>('friends');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state whenever modal becomes visible or props change
  useEffect(() => {
    if (visible) {
      setSelected(normalizeVisibility(currentVisibility));
      setSelectedFriendIds(initialSelectedFriendIds);
      setSelectedGroupIds(initialSelectedGroupIds);
      setIsConfiguringAccess(false);
      setSearchQuery('');
    }
  }, [visible, currentVisibility, initialSelectedFriendIds, initialSelectedGroupIds]);

  // Filtered friends list for access configuration
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return EXTENDED_CONNECTED_FRIENDS;
    const q = searchQuery.toLowerCase().trim();
    return EXTENDED_CONNECTED_FRIENDS.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.username.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered groups list for access configuration
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return INITIAL_FRIEND_GROUPS;
    const q = searchQuery.toLowerCase().trim();
    return INITIAL_FRIEND_GROUPS.filter((g) =>
      g.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Toggle friend selection
  const handleToggleFriend = (id: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle group selection
  const handleToggleGroup = (id: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all or clear all for current subtab
  const handleToggleAllCurrent = () => {
    if (activeSubTab === 'friends') {
      const allIds = EXTENDED_CONNECTED_FRIENDS.map((f) => f.id);
      if (selectedFriendIds.length === allIds.length) {
        setSelectedFriendIds([]);
      } else {
        setSelectedFriendIds(allIds);
      }
    } else {
      const allIds = INITIAL_FRIEND_GROUPS.map((g) => g.id);
      if (selectedGroupIds.length === allIds.length) {
        setSelectedGroupIds([]);
      } else {
        setSelectedGroupIds(allIds);
      }
    }
  };

  // Save selected preference and close
  const handleSavePreference = () => {
    onSave(selected, {
      selectedFriendIds,
      selectedGroupIds,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (isConfiguringAccess) {
          setIsConfiguringAccess(false);
        } else {
          onClose();
        }
      }}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          {/* Top Drag Handle Bar (Figma spec) */}
          <View style={styles.dragHandleBar} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {!isConfiguringAccess ? (
              /* ==============================================================
                 MAIN VIEW: Matches Figma PS-09 (Only Me, Friends Only, Selected Friends ▶)
                 ============================================================== */
              <View>
                {/* Header (Left-aligned as in Figma screenshot) */}
                <View style={styles.figmaHeaderContainer}>
                  <Text style={styles.figmaSheetTitle}>Schedule Visibility</Text>
                  <Text style={styles.figmaSheetSubtitle}>
                    Choose who can view your schedule.
                  </Text>
                </View>

                {/* Dark Olive-Sage Container Card (Figma spec) */}
                <View style={styles.figmaDarkCard}>
                  {/* Category 1: Only Me */}
                  <TouchableOpacity
                    style={styles.figmaOptionRow}
                    activeOpacity={0.8}
                    onPress={() => setSelected('only_me')}
                  >
                    <View style={styles.figmaBadge}>
                      <Text style={styles.figmaBadgeText}>Only Me</Text>
                    </View>
                    <View
                      style={[
                        styles.figmaRadioCircle,
                        selected === 'only_me' && styles.figmaRadioCircleSelected,
                      ]}
                    />
                  </TouchableOpacity>

                  {/* Category 2: Friends Only */}
                  <TouchableOpacity
                    style={styles.figmaOptionRow}
                    activeOpacity={0.8}
                    onPress={() => setSelected('friends_only')}
                  >
                    <View style={styles.figmaBadge}>
                      <Text style={styles.figmaBadgeText}>Friends Only</Text>
                    </View>
                    <View
                      style={[
                        styles.figmaRadioCircle,
                        selected === 'friends_only' && styles.figmaRadioCircleSelected,
                      ]}
                    />
                  </TouchableOpacity>

                  {/* Category 3: Selected Friends ▶ */}
                  <TouchableOpacity
                    style={styles.figmaOptionRow}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelected('selected_friends');
                    }}
                  >
                    <TouchableOpacity
                      style={styles.figmaBadge}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelected('selected_friends');
                        setIsConfiguringAccess(true);
                      }}
                    >
                      <Text style={styles.figmaBadgeText}>Selected Friends</Text>
                      {/* Black Right Triangle Indicator ▶ */}
                      <Svg
                        width={9}
                        height={11}
                        viewBox="0 0 9 11"
                        fill="none"
                        style={styles.figmaTriangleIcon}
                      >
                        <Path d="M0.5 1L8 5.5L0.5 10V1Z" fill="#151F17" />
                      </Svg>
                    </TouchableOpacity>
                    <View
                      style={[
                        styles.figmaRadioCircle,
                        selected === 'selected_friends' &&
                          styles.figmaRadioCircleSelected,
                      ]}
                    />
                  </TouchableOpacity>
                </View>

                {/* Selected Friends & Groups Access Summary & Customizer Pill */}
                {selected === 'selected_friends' && (
                  <TouchableOpacity
                    style={styles.selectedFriendsSummaryPill}
                    activeOpacity={0.8}
                    onPress={() => setIsConfiguringAccess(true)}
                  >
                    <Text style={styles.selectedFriendsSummaryText}>
                      ✓ Access granted to {selectedFriendIds.length} friend
                      {selectedFriendIds.length === 1 ? '' : 's'} and{' '}
                      {selectedGroupIds.length} group
                      {selectedGroupIds.length === 1 ? '' : 's'}
                    </Text>
                    <Text style={styles.selectedFriendsEditAction}>
                      Customize ›
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Primary Action Button (SAVE PREFERENCE) */}
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={handleSavePreference}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryActionBtnText}>SAVE PREFERENCE</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* ==============================================================
                 SUB-VIEW: Selected Friends & Groups Access Configuration (PS-09)
                 ============================================================== */
              <View>
                {/* Back Navigation & Title */}
                <View style={styles.subViewHeader}>
                  <TouchableOpacity
                    style={styles.subViewBackBtn}
                    onPress={() => setIsConfiguringAccess(false)}
                    activeOpacity={0.7}
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M15 19l-7-7 7-7"
                        stroke="#151F17"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                    <Text style={styles.subViewBackText}>Back</Text>
                  </TouchableOpacity>
                  <Text style={styles.subViewTitle}>Custom Access List</Text>
                </View>

                <Text style={styles.subViewSubtitle}>
                  Select which specific friends or groups can view your schedule.
                </Text>

                {/* Search Bar */}
                <TextInput
                  style={styles.subViewSearchInput}
                  placeholder={
                    activeSubTab === 'friends'
                      ? 'Search friends...'
                      : 'Search groups...'
                  }
                  placeholderTextColor="#6D8269"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  clearButtonMode="while-editing"
                />

                {/* Friends vs Groups Segment Selector */}
                <View style={styles.subViewSegmentContainer}>
                  <TouchableOpacity
                    style={[
                      styles.subViewSegmentBtn,
                      activeSubTab === 'friends' && styles.subViewSegmentBtnActive,
                    ]}
                    onPress={() => setActiveSubTab('friends')}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.subViewSegmentText,
                        activeSubTab === 'friends' &&
                          styles.subViewSegmentTextActive,
                      ]}
                    >
                      Friends ({selectedFriendIds.length})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.subViewSegmentBtn,
                      activeSubTab === 'groups' && styles.subViewSegmentBtnActive,
                    ]}
                    onPress={() => setActiveSubTab('groups')}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.subViewSegmentText,
                        activeSubTab === 'groups' &&
                          styles.subViewSegmentTextActive,
                      ]}
                    >
                      Groups ({selectedGroupIds.length})
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Select All / Clear All Shortcut */}
                <View style={styles.subViewShortcutRow}>
                  <Text style={styles.subViewCountText}>
                    {activeSubTab === 'friends'
                      ? `${selectedFriendIds.length} of ${EXTENDED_CONNECTED_FRIENDS.length} friends selected`
                      : `${selectedGroupIds.length} of ${INITIAL_FRIEND_GROUPS.length} groups selected`}
                  </Text>
                  <TouchableOpacity
                    onPress={handleToggleAllCurrent}
                    style={styles.subViewShortcutBtn}
                  >
                    <Text style={styles.subViewShortcutBtnText}>
                      {activeSubTab === 'friends'
                        ? selectedFriendIds.length ===
                          EXTENDED_CONNECTED_FRIENDS.length
                          ? 'Clear All'
                          : 'Select All'
                        : selectedGroupIds.length ===
                          INITIAL_FRIEND_GROUPS.length
                        ? 'Clear All'
                        : 'Select All'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Scrollable Items List */}
                <View style={styles.subViewItemList}>
                  {activeSubTab === 'friends' ? (
                    filteredFriends.map((friend) => {
                      const isChecked = selectedFriendIds.includes(friend.id);
                      return (
                        <TouchableOpacity
                          key={friend.id}
                          style={styles.subViewItemRow}
                          onPress={() => handleToggleFriend(friend.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.subViewItemInfo}>
                            <View style={styles.subViewAvatarCircle}>
                              <Text style={styles.subViewAvatarInitials}>
                                {friend.initials}
                              </Text>
                            </View>
                            <View>
                              <Text style={styles.subViewItemTitle}>
                                {friend.name}
                              </Text>
                              <Text style={styles.subViewItemSubtitle}>
                                {friend.username}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={[
                              styles.subViewCheckbox,
                              isChecked && styles.subViewCheckboxChecked,
                            ]}
                          >
                            {isChecked && (
                              <Svg
                                width={12}
                                height={12}
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <Path
                                  d="M20 6L9 17L4 12"
                                  stroke="#FFFFFF"
                                  strokeWidth={3.5}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </Svg>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    filteredGroups.map((group) => {
                      const isChecked = selectedGroupIds.includes(group.id);
                      return (
                        <TouchableOpacity
                          key={group.id}
                          style={styles.subViewItemRow}
                          onPress={() => handleToggleGroup(group.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.subViewItemInfo}>
                            <View style={styles.subViewAvatarCircle}>
                              <UsersGroupIcon size={18} color="#151F17" />
                            </View>
                            <View>
                              <Text style={styles.subViewItemTitle}>
                                {group.name}
                              </Text>
                              <Text style={styles.subViewItemSubtitle}>
                                {group.memberCount} members
                              </Text>
                            </View>
                          </View>
                          <View
                            style={[
                              styles.subViewCheckbox,
                              isChecked && styles.subViewCheckboxChecked,
                            ]}
                          >
                            {isChecked && (
                              <Svg
                                width={12}
                                height={12}
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <Path
                                  d="M20 6L9 17L4 12"
                                  stroke="#FFFFFF"
                                  strokeWidth={3.5}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </Svg>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>

                {/* Sub-view Done Button */}
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => setIsConfiguringAccess(false)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryActionBtnText}>DONE</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
