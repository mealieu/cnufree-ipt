import { FriendAvailability } from './dashboard';
import { FriendRequestItem } from './friends';
import { TabId } from './navigation';

/**
 * Notification categories shown in UI-49 to UI-53 (NS-01)
 */
export type NotificationCategory =
  | 'friend_request'
  | 'request_accepted'
  | 'schedule_update'
  | 'no_access';

/**
 * Chronological section groups (NS-01)
 */
export type NotificationTimeGroup = 'TODAY' | 'YESTERDAY' | 'EARLIER';

/**
 * Filter toggle options on the Notifications screen (NS-01)
 */
export type NotificationFilterMode = 'all' | 'unread';

/**
 * Screen state modes for Notifications (NS-01 / NS-02)
 */
export type NotificationScreenStatus = 'loaded' | 'loading' | 'empty' | 'error';

/**
 * Individual notification item model (NS-01)
 */
export interface NotificationItem {
  id: string;
  actorName: string;
  actorUsername: string;
  actorInitials: string;
  actionText: string; // e.g. "sent you a friend request", "accepted your friend request", "updated her schedule"
  detailText: string; // e.g. "@Lalah · 3 mutual friends", "Free Tue 8:00AM – 10:00AM", "Schedule is private"
  badgeLabel: string; // e.g. "Friend request", "Accepted", "Schedule update", "No access"
  category: NotificationCategory;
  timestampLabel: string; // e.g. "2m ago", "15m ago", "1h ago", "1d ago"
  createdAtOrder: number; // Numeric order for chronological sorting (smaller = newer)
  timeGroup: NotificationTimeGroup;
  isRead: boolean;
  mutualFriendsCount?: number;
  targetScreen: 'friend_requests' | 'friend_schedule' | 'friends_list';
  linkedFriendProfile?: FriendAvailability;
  linkedFriendRequest?: FriendRequestItem;
}

/**
 * User profile preview shown inside reusable confirmation dialogs (NS-03 / UI-57)
 */
export interface DialogUserPreview {
  name: string;
  username: string;
  mutualFriendsCount?: number;
  initials?: string;
}

/**
 * Configuration for the reusable Confirmation Dialog (NS-03 / UI-57)
 */
export interface ConfirmDialogConfig {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  userPreview?: DialogUserPreview;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Configuration for the reusable Feedback Toast (NS-03 / UI-57)
 */
export type FeedbackToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface FeedbackToastConfig {
  id: string;
  variant: FeedbackToastVariant;
  title: string;
  message: string;
}

/**
 * Validation error item for reusable validation error handling (NS-03)
 */
export interface ValidationErrorItem {
  id: string;
  field?: string;
  message: string;
}

/**
 * Props for NotificationCard (NS-01)
 */
export interface NotificationCardProps {
  notification: NotificationItem;
  onPress: (notification: NotificationItem) => void;
  onToggleRead: (notification: NotificationItem) => void;
  onAcceptRequest?: (notification: NotificationItem) => void;
  onDeclineRequest?: (notification: NotificationItem) => void;
  onBlockUser?: (notification: NotificationItem) => void;
}

/**
 * Props for NotificationStateView (NS-02: Loading, Empty, Error + Retry)
 */
export interface NotificationStateViewProps {
  status: 'loading' | 'empty' | 'error';
  filterMode?: NotificationFilterMode;
  onRetry: () => void;
  onFindFriends: () => void;
  onShowAllNotifications?: () => void;
}

/**
 * Props for ConfirmDialogModal (NS-03)
 */
export interface ConfirmDialogModalProps extends ConfirmDialogConfig {}

/**
 * Props for FeedbackToast (NS-03)
 */
export interface FeedbackToastProps {
  toast: FeedbackToastConfig | null;
  onDismiss: () => void;
}

/**
 * Props for ValidationErrorBanner (NS-03)
 */
export interface ValidationErrorBannerProps {
  errors: ValidationErrorItem[];
  title?: string;
  onDismiss: () => void;
}

/**
 * Props for NotificationsScreen (NS-01 / NS-02 / NS-03)
 */
export interface NotificationsScreenProps {
  onBack?: () => void;
  onNavigateTab?: (tab: TabId) => void;
  onUnreadCountChange?: (count: number) => void;
  onOpenFriendRequests?: () => void;
  onOpenFindFriends?: () => void;
  onOpenFriendSchedule?: (friend: FriendAvailability) => void;
}
