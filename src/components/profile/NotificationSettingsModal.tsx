import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { styles } from './ProfileModals.styles';
import { NotificationPreferences } from '../../types/profile';

export type { NotificationPreferences };

export interface NotificationSettingsModalProps {
  visible: boolean;
  initialPreferences?: NotificationPreferences;
  onClose: () => void;
  onSave: (preferences: NotificationPreferences) => void;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  newFriendRequests: true,
  friendRequestAccepted: true,
  friendsScheduleUpdates: true,
};

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  visible,
  initialPreferences,
  onClose,
  onSave,
}) => {
  const [newFriendRequests, setNewFriendRequests] = useState(
    initialPreferences ? initialPreferences.newFriendRequests : DEFAULT_PREFERENCES.newFriendRequests
  );
  const [friendRequestAccepted, setFriendRequestAccepted] = useState(
    initialPreferences ? initialPreferences.friendRequestAccepted : DEFAULT_PREFERENCES.friendRequestAccepted
  );
  const [friendsScheduleUpdates, setFriendsScheduleUpdates] = useState(
    initialPreferences ? initialPreferences.friendsScheduleUpdates : DEFAULT_PREFERENCES.friendsScheduleUpdates
  );

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (visible) {
      const prefs = initialPreferences || DEFAULT_PREFERENCES;
      setNewFriendRequests(prefs.newFriendRequests);
      setFriendRequestAccepted(prefs.friendRequestAccepted);
      setFriendsScheduleUpdates(prefs.friendsScheduleUpdates);
    }
  }, [visible, initialPreferences]);

  const handleSave = () => {
    onSave({
      newFriendRequests,
      friendRequestAccepted,
      friendsScheduleUpdates,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
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
            {/* Header: Title & Subtitle (Centered as in Figma UI-44 / PS-11) */}
            <Text style={styles.shareScheduleTitle}>Notifications Settings</Text>
            <Text style={styles.shareScheduleSubtitle}>
              Choose which notifications you want to receive.
            </Text>

            {/* Dark Olive-Sage Container Card (Figma UI-44 Match) */}
            <View style={styles.notificationCard}>
              {/* Option 1: New Friend Requests */}
              <View style={styles.notificationRow}>
                <TouchableOpacity
                  style={styles.notificationBadge}
                  activeOpacity={0.8}
                  onPress={() => setNewFriendRequests(!newFriendRequests)}
                >
                  <Text style={styles.notificationBadgeText}>New Friend Requests</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setNewFriendRequests(!newFriendRequests)}
                >
                  <View
                    style={[
                      styles.notificationSwitchPill,
                      !newFriendRequests && styles.notificationSwitchPillOff,
                    ]}
                  >
                    <View
                      style={[
                        styles.notificationSwitchThumb,
                        !newFriendRequests && styles.notificationSwitchThumbOff,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Option 2: Friend Request Accepted */}
              <View style={styles.notificationRow}>
                <TouchableOpacity
                  style={styles.notificationBadge}
                  activeOpacity={0.8}
                  onPress={() => setFriendRequestAccepted(!friendRequestAccepted)}
                >
                  <Text style={styles.notificationBadgeText}>Friend Request Accepted</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setFriendRequestAccepted(!friendRequestAccepted)}
                >
                  <View
                    style={[
                      styles.notificationSwitchPill,
                      !friendRequestAccepted && styles.notificationSwitchPillOff,
                    ]}
                  >
                    <View
                      style={[
                        styles.notificationSwitchThumb,
                        !friendRequestAccepted && styles.notificationSwitchThumbOff,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Option 3: Friends Schedule Updates */}
              <View style={styles.notificationRow}>
                <TouchableOpacity
                  style={styles.notificationBadge}
                  activeOpacity={0.8}
                  onPress={() => setFriendsScheduleUpdates(!friendsScheduleUpdates)}
                >
                  <Text style={styles.notificationBadgeText}>Friends Schedule Updates</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setFriendsScheduleUpdates(!friendsScheduleUpdates)}
                >
                  <View
                    style={[
                      styles.notificationSwitchPill,
                      !friendsScheduleUpdates && styles.notificationSwitchPillOff,
                    ]}
                  >
                    <View
                      style={[
                        styles.notificationSwitchThumb,
                        !friendsScheduleUpdates && styles.notificationSwitchThumbOff,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary Action Button (SAVE PREFERENCES) */}
            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionBtnText}>SAVE PREFERENCES</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
