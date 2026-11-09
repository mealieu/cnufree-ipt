import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { ConnectedFriend, FriendGroupItem } from '../../types/friends';
import { FriendAvailability, FriendGroupOption } from '../../types/dashboard';
import { styles } from './CreateFriendGroupModal.styles';

export interface CreateFriendGroupModalProps {
  visible: boolean;
  onClose: () => void;
  friends?: (ConnectedFriend | FriendAvailability)[];
  existingGroups?: (FriendGroupItem | FriendGroupOption)[];
  onCreateGroup: (newGroup: {
    name: string;
    description?: string;
    color?: string;
    memberIds: string[];
  }) => void | Promise<void>;
}

const PRESET_COLORS = [
  '#1C675C', // Deep Teal / Forest
  '#2E7D32', // Green
  '#D97706', // Amber / Gold
  '#2563EB', // Blue
  '#C0392B', // Terracotta / Crimson
];

export const CreateFriendGroupModal: React.FC<CreateFriendGroupModalProps> = ({
  visible,
  onClose,
  friends = [],
  existingGroups = [],
  onCreateGroup,
}) => {
  const [groupName, setGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Normalize friends list
  const normalizedFriends = useMemo(() => {
    return friends.map((f) => {
      const isConnected = 'scheduleProfile' in f && !!f.scheduleProfile;
      const schedule = isConnected ? f.scheduleProfile : (f as FriendAvailability);
      const isPrivateOrMissing =
        !schedule ||
        schedule.isPrivate ||
        schedule.hasSchedule === false ||
        schedule.status === 'unknown';

      return {
        id: f.id,
        name: f.name,
        initials: f.initials || f.name.slice(0, 2).toUpperCase(),
        statusLabel: isPrivateOrMissing
          ? 'Private'
          : schedule.status === 'free'
          ? 'Free'
          : 'Busy',
        untilTime: schedule?.untilTime,
      };
    });
  }, [friends]);

  // Filter members by search input
  const filteredFriends = useMemo(() => {
    if (!searchMemberQuery.trim()) return normalizedFriends;
    const query = searchMemberQuery.toLowerCase().trim();
    return normalizedFriends.filter((f) => f.name.toLowerCase().includes(query));
  }, [normalizedFriends, searchMemberQuery]);

  // Toggle member selection
  const handleToggleMember = (id: string) => {
    if (isSubmitting) return;
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  // Select all or deselect all
  const handleToggleAll = () => {
    if (isSubmitting) return;
    if (selectedMemberIds.length === normalizedFriends.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(normalizedFriends.map((f) => f.id));
    }
  };

  // Reset form state
  const handleReset = () => {
    setGroupName('');
    setSelectedColor(PRESET_COLORS[0]);
    setSelectedMemberIds([]);
    setSearchMemberQuery('');
    setErrorMessage(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    handleReset();
    onClose();
  };

  // Submit group creation
  const handleCreate = async () => {
    if (isSubmitting) return;

    const trimmed = groupName.trim();
    if (!trimmed) {
      setErrorMessage('Group name cannot be empty.');
      return;
    }

    if (trimmed.length < 2) {
      setErrorMessage('Group name must be at least 2 characters.');
      return;
    }

    if (trimmed.length > 30) {
      setErrorMessage('Group name must not exceed 30 characters.');
      return;
    }

    const isDuplicate = existingGroups.some((g) => {
      const gName = 'name' in g ? g.name : g.label;
      return gName.trim().toLowerCase() === trimmed.toLowerCase();
    });

    if (isDuplicate) {
      setErrorMessage('A group with this name already exists.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await Promise.resolve(
        onCreateGroup({
          name: trimmed,
          color: selectedColor,
          memberIds: Array.from(new Set(selectedMemberIds)),
        })
      );

      handleReset();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create group. Please try again.';
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  const isFormValid = groupName.trim().length >= 2 && !isSubmitting;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Create Friend Group</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                activeOpacity={0.7}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Close create group modal"
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable Form Body */}
            <ScrollView
              style={styles.scrollBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Group Name Input */}
              <View style={styles.sectionLabelRow}>
                <Text style={styles.sectionLabel}>Group Name *</Text>
                <Text style={styles.charCount}>{groupName.length}/30</Text>
              </View>
              <View
                style={[
                  styles.inputContainer,
                  errorMessage ? styles.inputError : undefined,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Study Buddies, CS Peers"
                  placeholderTextColor="#7A8C7F"
                  value={groupName}
                  maxLength={30}
                  editable={!isSubmitting}
                  onChangeText={(text) => {
                    setGroupName(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="words"
                />
              </View>
              {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}

              {/* Group Theme Color */}
              <View style={styles.sectionLabelRow}>
                <Text style={styles.sectionLabel}>Group Theme Color</Text>
              </View>
              <View style={styles.colorPickerContainer}>
                {PRESET_COLORS.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        isSelected && styles.selectedColorOption,
                      ]}
                      onPress={() => setSelectedColor(color)}
                      activeOpacity={0.8}
                      disabled={isSubmitting}
                      accessibilityRole="button"
                      accessibilityLabel={`Select theme color ${color}`}
                    >
                      <View
                        style={[
                          styles.innerColorDot,
                          { backgroundColor: color },
                        ]}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Members Selection */}
              <View style={styles.membersSection}>
                <View style={styles.membersHeaderRow}>
                  <Text style={styles.sectionLabel}>
                    Add Friends ({selectedMemberIds.length} selected)
                  </Text>
                  {normalizedFriends.length > 0 && (
                    <TouchableOpacity
                      onPress={handleToggleAll}
                      activeOpacity={0.7}
                      disabled={isSubmitting}
                      accessibilityRole="button"
                      accessibilityLabel="Toggle select all friends"
                    >
                      <Text style={styles.selectToggleText}>
                        {selectedMemberIds.length === normalizedFriends.length
                          ? 'Deselect All'
                          : 'Select All'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Member Search */}
                {normalizedFriends.length > 4 && (
                  <View style={styles.memberSearchContainer}>
                    <TextInput
                      style={styles.memberSearchInput}
                      placeholder="Filter friends..."
                      placeholderTextColor="#7A8C7F"
                      value={searchMemberQuery}
                      onChangeText={setSearchMemberQuery}
                      editable={!isSubmitting}
                      autoCapitalize="none"
                    />
                  </View>
                )}

                {/* Member List */}
                <View style={styles.memberList}>
                  {normalizedFriends.length === 0 ? (
                    <View style={styles.emptyMembersContainer}>
                      <Text style={styles.emptyMembersText}>
                        No connected friends yet. Connect with friends to add them to groups.
                      </Text>
                    </View>
                  ) : filteredFriends.length === 0 ? (
                    <View style={styles.emptyMembersContainer}>
                      <Text style={styles.emptyMembersText}>
                        No matching friends found for "{searchMemberQuery}".
                      </Text>
                    </View>
                  ) : (
                    filteredFriends.map((friend) => {
                      const isSelected = selectedMemberIds.includes(friend.id);

                      return (
                        <TouchableOpacity
                          key={friend.id}
                          style={[
                            styles.memberRow,
                            isSelected && styles.selectedMemberRow,
                          ]}
                          onPress={() => handleToggleMember(friend.id)}
                          activeOpacity={0.7}
                          disabled={isSubmitting}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: isSelected }}
                          accessibilityLabel={`${friend.name}, ${friend.statusLabel}`}
                        >
                          <View style={styles.avatarMini}>
                            <Text style={styles.avatarTextMini}>
                              {friend.initials}
                            </Text>
                          </View>

                          <View style={styles.memberInfo}>
                            <Text
                              style={styles.memberName}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {friend.name}
                            </Text>
                            <Text style={styles.memberStatus}>
                              {friend.statusLabel}
                              {friend.untilTime ? ` · ${friend.untilTime}` : ''}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.checkboxContainer,
                              isSelected && styles.checkboxChecked,
                            ]}
                          >
                            {isSelected && (
                              <Text style={styles.checkmarkText}>✓</Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Action Row */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                activeOpacity={0.7}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Cancel group creation"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.createButton,
                  !isFormValid && styles.createButtonDisabled,
                ]}
                onPress={handleCreate}
                disabled={!isFormValid}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Confirm group creation"
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.createButtonText}>Create Group</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
