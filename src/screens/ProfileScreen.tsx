import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { styles } from './ProfileScreen.styles';
import { TabId } from '../types/navigation';
import { UserProfileData, SettingItemConfig } from '../types/profile';
import { getStoredProfile, subscribeToProfile } from '../mock/profileData';
import { authService } from '../services/authService';
import { ProfileQuickActions } from '../components/profile/ProfileQuickActions';
import { ProfileSettingsSection } from '../components/profile/ProfileSettingsSection';
import { LogoutConfirmModal } from '../components/profile/LogoutConfirmModal';
import { BottomNavBar } from '../components/navigation/BottomNavBar';

export interface ProfileScreenProps {
  onNavigateTab?: (tab: TabId) => void;
  onLogout?: () => void;
  onEditProfile?: () => void;
  onViewMySchedule?: () => void;
}

const SCHEDULE_MANAGEMENT_ITEMS: SettingItemConfig[] = [
  { id: 'view_my_schedule', title: 'View My Schedule', iconName: 'eye' },
  { id: 'add_schedule', title: 'Add Schedule', iconName: 'pencil' },
  { id: 'import_schedule', title: 'Import Schedule', iconName: 'cloud' },
];

const SETTINGS_ITEMS: SettingItemConfig[] = [
  { id: 'schedule_visibility', title: 'Schedule Visibility', iconName: 'eye' },
  { id: 'shared_links', title: 'Shared Links', iconName: 'link' },
  { id: 'friend_groups_settings', title: 'Friend Groups Settings', iconName: 'users' },
  { id: 'notifications_settings', title: 'Notifications Settings', iconName: 'bell' },
];

const ACCOUNT_MANAGEMENT_ITEMS: SettingItemConfig[] = [
  { id: 'delete_account', title: 'Delete Account', iconName: 'trash', isDestructive: true },
  { id: 'sign_out', title: 'Sign Out', iconName: 'sign_out' },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateTab,
  onLogout,
  onEditProfile,
  onViewMySchedule,
}) => {
  const [userProfile, setUserProfile] = useState<UserProfileData>(getStoredProfile());
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Subscribe to live profile updates
  useEffect(() => {
    const unsubscribe = subscribeToProfile((updated) => {
      setUserProfile(updated);
    });
    return unsubscribe;
  }, []);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3200);
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'edit_profile':
        if (onEditProfile) {
          onEditProfile();
        } else {
          showFeedback('Edit profile action triggered.');
        }
        break;
      case 'my_schedule':
        if (onViewMySchedule) {
          onViewMySchedule();
        } else {
          showFeedback('Opening personal schedule...');
        }
        break;
      case 'import_schedule':
        showFeedback('Import schedule module is integration-ready.');
        break;
      case 'share_link':
        showFeedback('Personal schedule link copied to clipboard.');
        break;
      default:
        break;
    }
  };

  const handleSettingItemPress = (item: SettingItemConfig) => {
    switch (item.id) {
      case 'view_my_schedule':
        if (onViewMySchedule) {
          onViewMySchedule();
        } else {
          showFeedback('Opening personal schedule...');
        }
        break;
      case 'add_schedule':
        showFeedback('Add Schedule form is ready for schedule integration.');
        break;
      case 'import_schedule':
        showFeedback('Import Schedule feature is integration-ready.');
        break;
      case 'schedule_visibility':
        showFeedback('Privacy settings: Schedule is currently visible to Accepted Friends.');
        break;
      case 'shared_links':
        showFeedback('Sharing settings: 0 active public schedule links.');
        break;
      case 'friend_groups_settings':
        onNavigateTab?.('friends');
        break;
      case 'notifications_settings':
        onNavigateTab?.('notifications');
        break;
      case 'delete_account':
        Alert.alert(
          'Delete Account',
          'Are you sure you want to permanently delete your account? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => showFeedback('Account deletion request queued.'),
            },
          ]
        );
        break;
      case 'sign_out':
        setIsLogoutModalVisible(true);
        break;
      default:
        break;
    }
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await authService.signOut();
      setIsLoggingOut(false);
      setIsLogoutModalVisible(false);

      if (result.success) {
        onLogout?.();
      } else {
        Alert.alert('Sign Out Error', result.error || 'Failed to sign out.');
      }
    } catch {
      setIsLoggingOut(false);
      setIsLogoutModalVisible(false);
      Alert.alert('Sign Out Error', 'An unexpected error occurred while signing out.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* Circular Avatar Ring & Identity */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarRing}>
              <Text style={styles.avatarInitials}>{userProfile.initials || 'BC'}</Text>
            </View>
            <Text style={styles.profileName}>{userProfile.fullName || 'Profile Name'}</Text>
            <Text style={styles.profileHandle}>
              @{userProfile.username} · {userProfile.email}
            </Text>
          </View>

          {/* Quick Actions (4-circle row) */}
          <ProfileQuickActions
            onEditProfile={() => handleQuickAction('edit_profile')}
            onMySchedule={() => handleQuickAction('my_schedule')}
            onImportSchedule={() => handleQuickAction('import_schedule')}
            onShareLink={() => handleQuickAction('share_link')}
          />

          {/* Feedback Toast */}
          {feedbackMessage && (
            <View style={styles.toastContainer}>
              <Text style={styles.toastText}>{feedbackMessage}</Text>
            </View>
          )}

          {/* Schedule Management */}
          <ProfileSettingsSection
            title="Schedule Management"
            items={SCHEDULE_MANAGEMENT_ITEMS}
            onItemPress={handleSettingItemPress}
          />

          {/* Settings */}
          <ProfileSettingsSection
            title="Settings"
            items={SETTINGS_ITEMS}
            onItemPress={handleSettingItemPress}
          />

          {/* Account Management */}
          <ProfileSettingsSection
            title="Account Management"
            items={ACCOUNT_MANAGEMENT_ITEMS}
            onItemPress={handleSettingItemPress}
          />
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        visible={isLogoutModalVisible}
        isSubmitting={isLoggingOut}
        backendConfigured={authService.isBackendConfigured()}
        onCancel={() => setIsLogoutModalVisible(false)}
        onConfirm={handleConfirmLogout}
      />

      {/* Bottom Nav Bar */}
      <BottomNavBar
        activeTab="profile"
        onTabChange={(tab) => {
          onNavigateTab?.(tab);
        }}
        notificationBadgeCount={0}
      />
    </SafeAreaView>
  );
};
