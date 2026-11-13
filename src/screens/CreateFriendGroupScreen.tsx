import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { ConnectedFriend, FriendGroupItem } from '../types/friends';
import { FriendAvailability, FriendGroupOption } from '../types/dashboard';
import { TabId } from '../types/navigation';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { styles } from './CreateFriendGroupScreen.styles';

export interface CreateFriendGroupScreenProps {
  onBack?: () => void;
  onNavigateTab?: (tab: TabId) => void;
  friends?: (ConnectedFriend | FriendAvailability)[];
  existingGroups?: (FriendGroupItem | FriendGroupOption)[];
  onCreateGroup: (newGroup: {
    name: string;
    memberIds: string[];
  }) => void | Promise<void>;
}

export const CreateFriendGroupScreen: React.FC<CreateFriendGroupScreenProps> = ({
  onBack,
  onNavigateTab,
  friends = [],
  existingGroups = [],
  onCreateGroup,
}) => {
  const [groupName, setGroupName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});

  // Normalize connected friends
  const normalizedFriends = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{
      id: string;
      name: string;
      username: string;
      initials: string;
      avatarUrl?: string;
    }> = [];

    for (const f of friends) {
      if (!f || seen.has(f.id)) continue;
      seen.add(f.id);

      const username =
        'username' in f && f.username
          ? f.username
          : `@${f.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

      list.push({
        id: f.id,
        name: f.name,
        username,
        initials: f.initials || f.name.slice(0, 2).toUpperCase(),
        avatarUrl: f.avatarUrl,
      });
    }

    return list;
  }, [friends]);

  // Toggle friend selection
  const handleToggleFriend = (id: string) => {
    if (isSubmitting) return;
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  // Submit handler with full validation
  const handleCreateGroup = async () => {
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
      setErrorMessage('A friend group with this name already exists.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await Promise.resolve(
        onCreateGroup({
          name: trimmed,
          memberIds: Array.from(new Set(selectedMemberIds)),
        })
      );

      onBack?.();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to create group. Please check your connection.';
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* 1. Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
          disabled={isSubmitting}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Back to Friends"
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 19L8 12L15 5"
              stroke="#132016"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        <Text style={styles.topHeaderTitle}>Friends</Text>

        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.headerHairline} />

      {/* 2. Scrollable Body Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentContainer}>
          {/* Section Heading Pill */}
          <View style={styles.sectionPill}>
            <Text style={styles.sectionPillText}>Create Friend Group</Text>
          </View>

          {/* Group Name Input */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Group name *</Text>
            <TextInput
              style={[
                styles.textInput,
                errorMessage ? styles.inputErrorBorder : undefined,
              ]}
              placeholder="Enter a group name"
              placeholderTextColor="rgba(58, 77, 59, 0.65)"
              value={groupName}
              onChangeText={(text) => {
                setGroupName(text);
                if (errorMessage) setErrorMessage(null);
              }}
              maxLength={30}
              editable={!isSubmitting}
              autoCapitalize="words"
            />
            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
          </View>

          {/* Friend Selection Header */}
          <View style={styles.friendsSelectionHeader}>
            <Text style={styles.selectFriendsLabel}>Select friends</Text>
            <Text style={styles.selectedCountText}>
              {selectedMemberIds.length} Selected
            </Text>
          </View>

          {/* Vertically Arranged Connected Friends List */}
          <View style={styles.friendsList}>
            {normalizedFriends.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No connected friends available to select.
                </Text>
              </View>
            ) : (
              normalizedFriends.map((friend) => {
                const isSelected = selectedMemberIds.includes(friend.id);
                const hasImage =
                  !!friend.avatarUrl && !failedImageIds[friend.id];

                return (
                  <TouchableOpacity
                    key={friend.id}
                    style={[
                      styles.friendRow,
                      isSelected && styles.friendRowSelected,
                    ]}
                    onPress={() => handleToggleFriend(friend.id)}
                    activeOpacity={0.75}
                    disabled={isSubmitting}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`${friend.name}, ${friend.username}`}
                  >
                    {/* Left: Avatar + Names */}
                    <View style={styles.friendLeft}>
                      <View style={styles.avatarCircle}>
                        {hasImage ? (
                          <Image
                            source={{ uri: friend.avatarUrl }}
                            style={styles.avatarImage}
                            onError={() =>
                              setFailedImageIds((prev) => ({
                                ...prev,
                                [friend.id]: true,
                              }))
                            }
                          />
                        ) : (
                          <Text style={styles.avatarInitials}>
                            {friend.initials}
                          </Text>
                        )}
                      </View>

                      <View style={styles.friendDetails}>
                        <Text style={styles.friendName} numberOfLines={1}>
                          {friend.name}
                        </Text>
                        <Text style={styles.friendHandle} numberOfLines={1}>
                          {friend.username}
                        </Text>
                      </View>
                    </View>

                    {/* Right: Checkbox */}
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxChecked,
                      ]}
                    >
                      {isSelected && <Text style={styles.checkmarkText}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Create Group Button */}
          <TouchableOpacity
            style={[
              styles.createButton,
              (!groupName.trim() || isSubmitting) && styles.createButtonDisabled,
            ]}
            onPress={handleCreateGroup}
            disabled={!groupName.trim() || isSubmitting}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Create Group"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#0F1711" />
            ) : (
              <Text style={styles.createButtonText}>Create Group</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 3. Existing Bottom Navigation Bar */}
      <BottomNavBar
        activeTab="friends"
        onTabChange={(tab) => {
          onNavigateTab?.(tab);
        }}
        notificationBadgeCount={0}
      />
    </SafeAreaView>
  );
};

