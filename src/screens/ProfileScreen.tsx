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
import { EditProfileModal } from '../components/profile/EditProfileModal';
import {
  ScheduleVisibilityModal,
  VisibilityOption,
  ScheduleVisibilityDetails,
} from '../components/profile/ScheduleVisibilityModal';
import {
  SharedLinksModal,
  SharedLinkConfig,
} from '../components/profile/SharedLinksModal';
import { AddScheduleModal } from '../components/profile/AddScheduleModal';
import { ImportScheduleModal } from '../components/profile/ImportScheduleModal';
import { LogoutConfirmModal } from '../components/profile/LogoutConfirmModal';
import { PersonalScheduleModal } from '../components/personalSchedule/PersonalScheduleModal';
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
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Modal display states for all clickables
  const [isMyScheduleVisible, setIsMyScheduleVisible] = useState(false);
  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);
  const [isVisibilityModalVisible, setIsVisibilityModalVisible] = useState(false);
  const [currentVisibility, setCurrentVisibility] = useState<VisibilityOption>('friends_only');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>(['cf-1', 'cf-2']);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(['fg-it-pwends']);
  const [isSharedLinksVisible, setIsSharedLinksVisible] = useState(false);
  const [sharedLinkConfig, setSharedLinkConfig] = useState<SharedLinkConfig>({
    permission: 'full_schedule',
    expiration: '7_days',
  });
  const [isAddScheduleVisible, setIsAddScheduleVisible] = useState(false);
  const [isImportScheduleVisible, setIsImportScheduleVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
        setIsEditProfileVisible(true);
        onEditProfile?.();
        break;
      case 'my_schedule':
        setIsMyScheduleVisible(true);
        break;
      case 'import_schedule':
        setIsImportScheduleVisible(true);
        break;
      case 'share_link':
        setIsSharedLinksVisible(true);
        break;
      default:
        break;
    }
  };

  const handleSettingItemPress = (item: SettingItemConfig) => {
    switch (item.id) {
      case 'view_my_schedule':
        setIsMyScheduleVisible(true);
        break;
      case 'add_schedule':
        setIsAddScheduleVisible(true);
        break;
      case 'import_schedule':
        setIsImportScheduleVisible(true);
        break;
      case 'schedule_visibility':
        setIsVisibilityModalVisible(true);
        break;
      case 'shared_links':
        setIsSharedLinksVisible(true);
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

          {/* Quick Actions (4-circle row matching Figma PS-01) */}
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

      {/* 1. Edit Profile Modal (Figma PS-02) */}
      <EditProfileModal
        visible={isEditProfileVisible}
        currentProfile={userProfile}
        onClose={() => setIsEditProfileVisible(false)}
        onSaved={(updated: UserProfileData) => {
          setUserProfile(updated);
          showFeedback('Profile updated successfully!');
        }}
      />

      {/* 2. Schedule Visibility / Privacy Settings Modal (Figma PS-09) */}
      <ScheduleVisibilityModal
        visible={isVisibilityModalVisible}
        currentVisibility={currentVisibility}
        initialSelectedFriendIds={selectedFriendIds}
        initialSelectedGroupIds={selectedGroupIds}
        onClose={() => setIsVisibilityModalVisible(false)}
        onSave={(newVisibility: VisibilityOption, details?: ScheduleVisibilityDetails) => {
          setCurrentVisibility(newVisibility);
          if (details) {
            setSelectedFriendIds(details.selectedFriendIds);
            setSelectedGroupIds(details.selectedGroupIds);
          }
          let feedback = 'Only Me (Private)';
          if (newVisibility === 'friends_only' || newVisibility === 'friends') {
            feedback = 'Friends Only';
          } else if (newVisibility === 'selected_friends' || newVisibility === 'public') {
            const fCount = details?.selectedFriendIds.length ?? selectedFriendIds.length;
            const gCount = details?.selectedGroupIds.length ?? selectedGroupIds.length;
            feedback = `Selected Friends (${fCount} friend${fCount === 1 ? '' : 's'}, ${gCount} group${gCount === 1 ? '' : 's'})`;
          }
          showFeedback(`Schedule visibility set to: ${feedback}`);
        }}
      />

      {/* 3. Shared Links Modal (Figma UI-43 / PS-10) */}
      <SharedLinksModal
        visible={isSharedLinksVisible}
        username={userProfile.username}
        initialConfig={sharedLinkConfig}
        onClose={() => setIsSharedLinksVisible(false)}
        onSave={(config: SharedLinkConfig) => {
          setSharedLinkConfig(config);
          const permLabel =
            config.permission === 'full_schedule'
              ? 'Full Schedule'
              : config.permission === 'free_busy_only'
              ? 'Free/Busy Only'
              : 'Specific Hours';
          const expLabel =
            config.expiration === '1_hour'
              ? '1 hour'
              : config.expiration === '24_hours'
              ? '24 hours'
              : config.expiration === '7_days'
              ? '7 days'
              : config.expiration === '30_days'
              ? '30 days'
              : 'Never';
          showFeedback(`Shared link saved: ${permLabel} · Expires in ${expLabel}`);
        }}
      />

      {/* 4. Add Schedule Block Modal (PS-05) */}
      <AddScheduleModal
        visible={isAddScheduleVisible}
        onClose={() => setIsAddScheduleVisible(false)}
        onAdded={(block: { title: string; day: string; time: string; date?: string; room?: string; notes?: string }) => {
          showFeedback(`Added "${block.title}" on ${block.date || block.day} (${block.time})`);
        }}
      />

      {/* 5. Import Schedule Modal */}
      <ImportScheduleModal
        visible={isImportScheduleVisible}
        onClose={() => setIsImportScheduleVisible(false)}
        onImported={() => {
          showFeedback('Schedule imported and synced successfully!');
        }}
        onViewMySchedule={() => setIsMyScheduleVisible(true)}
        onNavigateHome={() => onNavigateTab?.('home')}
      />

      {/* 6. Logout Confirmation Modal */}
      <LogoutConfirmModal
        visible={isLogoutModalVisible}
        isSubmitting={isLoggingOut}
        backendConfigured={authService.isBackendConfigured()}
        onCancel={() => setIsLogoutModalVisible(false)}
        onConfirm={handleConfirmLogout}
      />

      {/* 7. Personal Daily Schedule Modal (PS-03) */}
      <PersonalScheduleModal
        visible={isMyScheduleVisible}
        onClose={() => setIsMyScheduleVisible(false)}
        onNavigateTab={onNavigateTab}
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
