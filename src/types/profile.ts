export interface UserProfileData {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  initials?: string;
  bio?: string;
  scheduleVisibility?: VisibilityOption;
  selectedFriendIds?: string[];
  selectedGroupIds?: string[];
  sharedLinkConfig?: SharedLinkConfig;
  notificationPreferences?: NotificationPreferences;
}

export interface NotificationPreferences {
  newFriendRequests: boolean;
  friendRequestAccepted: boolean;
  friendsScheduleUpdates: boolean;
}

export type VisibilityOption =
  | 'only_me'
  | 'friends_only'
  | 'selected_friends'
  | 'private'
  | 'friends'
  | 'public';

export interface ScheduleVisibilityDetails {
  selectedFriendIds: string[];
  selectedGroupIds: string[];
}

export type SharedLinkPermission =
  | 'full_schedule'
  | 'free_busy_only'
  | 'specific_hours';

export type SharedLinkExpiration =
  | '1_hour'
  | '24_hours'
  | '7_days'
  | '30_days'
  | 'custom'
  | 'never';

export interface SharedLinkSpecificHoursConfig {
  startHour: string;
  endHour: string;
  days?: string[];
}

export interface SharedLinkConfig {
  permission: SharedLinkPermission;
  expiration: SharedLinkExpiration;
  expirationDate?: string;
  specificHours?: SharedLinkSpecificHoursConfig;
  customExpirationLabel?: string;
  isEnabled?: boolean;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  username: string;
}

export interface ProfileValidationErrors {
  firstName?: string;
  lastName?: string;
  username?: string;
  general?: string;
}

export interface UpdateProfileResult {
  success: boolean;
  profile?: UserProfileData;
  errors?: ProfileValidationErrors;
  backendConfigured: boolean;
  message: string;
}

export type ProfileQuickActionId =
  | 'edit_profile'
  | 'my_schedule'
  | 'import_schedule'
  | 'share_link';

export type SettingItemId =
  | 'view_my_schedule'
  | 'add_schedule'
  | 'import_schedule'
  | 'schedule_visibility'
  | 'shared_links'
  | 'friend_groups_settings'
  | 'notifications_settings'
  | 'delete_account'
  | 'sign_out';

export interface SettingItemConfig {
  id: SettingItemId;
  title: string;
  iconName: string;
  isDestructive?: boolean;
}

export interface ProfileSectionConfig {
  id: string;
  title: string;
  items: SettingItemConfig[];
}
