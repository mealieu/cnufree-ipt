import {
  NotificationItem,
  NotificationTimeGroup,
  NotificationFilterMode,
  ValidationErrorItem,
} from '../types/notifications';
import {
  MARIA_WEEKLY_SCHEDULE,
  SAMPLE_FRIEND_MARIA_DEBORAH,
  SAMPLE_FRIENDS,
} from './dashboardData';
import { INITIAL_RECEIVED_REQUESTS } from './friendsData';
import { FriendAvailability } from '../types/dashboard';

/**
 * Friend schedule profiles linked to notifications for navigation to FriendScheduleScreen (UI-30 / UI-31)
 */
export const AGNA_FELICIA_SCHEDULE_PROFILE: FriendAvailability = {
  id: 'notif-friend-agna',
  name: 'Agna Felicia Carza',
  nickname: 'Agna',
  relationship: 'DYD Friend',
  initials: 'AC',
  status: 'free',
  untilTime: '10:00AM',
  nextActivity: '10:00am B312 Accounting',
  groups: ['dyd'],
  currentLocation: 'Main Library 2F',
  freeSlots: [
    { startHour: 8.0, endHour: 10.0 },
    { startHour: 11.5, endHour: 13.5 },
    { startHour: 15.5, endHour: 18.0 },
  ],
  scheduleNotes: 'Free Tue 8:00AM – 10:00AM.',
  schedule: MARIA_WEEKLY_SCHEDULE[1].items,
};

export const NOELLE_PRIVATE_SCHEDULE_PROFILE: FriendAvailability = {
  ...(SAMPLE_FRIENDS.find((f) => f.id === 'f-3') || {
    id: 'f-3',
    name: 'Noelle Angela Alarma',
    initials: 'NA',
    status: 'busy',
    groups: ['courtside', 'dyd'],
  }),
  isPrivate: true,
  hasSchedule: false,
  scheduleNotes: 'Schedule is set to private.',
};

/**
 * Initial notifications list matching UI-49 to UI-53 (NS-01)
 * Chronologically ordered:
 * TODAY:
 *  1. Lalah Mohb sent you a friend request (@Lalah · 3 mutual friends, Friend request, 2m ago, Unread)
 *  2. Jay N. Ty sent you a friend request (@jntexpress · 3 mutual friends, Friend request, 15m ago, Unread)
 *  3. Mariah Deborah accepted your friend request (@MariahDeborah · Now in your Friends, Accepted, 1h ago, Unread)
 * YESTERDAY:
 *  4. Agna Felicia Carza updated her schedule (Free Tue 8:00AM – 10:00AM, Schedule update, 1d ago, Read)
 *  5. Noelle Angela Alarma updated her schedule (Schedule is private, No access, 1d ago, Read)
 */
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    actorName: 'Lalah Mohb',
    actorUsername: '@Lalah',
    actorInitials: 'LM',
    actionText: 'sent you a friend request',
    detailText: '@Lalah · 3 mutual friends',
    badgeLabel: 'Friend request',
    category: 'friend_request',
    timestampLabel: '2m ago',
    createdAtOrder: 1,
    timeGroup: 'TODAY',
    isRead: false,
    mutualFriendsCount: 3,
    targetScreen: 'friend_requests',
    linkedFriendRequest: INITIAL_RECEIVED_REQUESTS[0],
  },
  {
    id: 'notif-2',
    actorName: 'Jay N. Ty',
    actorUsername: '@jntexpress',
    actorInitials: 'JT',
    actionText: 'sent you a friend request',
    detailText: '@jntexpress · 3 mutual friends',
    badgeLabel: 'Friend request',
    category: 'friend_request',
    timestampLabel: '15m ago',
    createdAtOrder: 2,
    timeGroup: 'TODAY',
    isRead: false,
    mutualFriendsCount: 3,
    targetScreen: 'friend_requests',
    linkedFriendRequest: INITIAL_RECEIVED_REQUESTS[1],
  },
  {
    id: 'notif-3',
    actorName: 'Mariah Deborah',
    actorUsername: '@MariahDeborah',
    actorInitials: 'MD',
    actionText: 'accepted your friend request',
    detailText: '@MariahDeborah · Now in your Friends',
    badgeLabel: 'Accepted',
    category: 'request_accepted',
    timestampLabel: '1h ago',
    createdAtOrder: 3,
    timeGroup: 'TODAY',
    isRead: false,
    mutualFriendsCount: 3,
    targetScreen: 'friend_schedule',
    linkedFriendProfile: {
      ...SAMPLE_FRIEND_MARIA_DEBORAH,
      name: 'Mariah Deborah',
    },
  },
  {
    id: 'notif-4',
    actorName: 'Agna Felicia Carza',
    actorUsername: '@agna_carza',
    actorInitials: 'AC',
    actionText: 'updated her schedule',
    detailText: 'Free Tue 8:00AM – 10:00AM',
    badgeLabel: 'Schedule update',
    category: 'schedule_update',
    timestampLabel: '1d ago',
    createdAtOrder: 4,
    timeGroup: 'YESTERDAY',
    isRead: true,
    targetScreen: 'friend_schedule',
    linkedFriendProfile: AGNA_FELICIA_SCHEDULE_PROFILE,
  },
  {
    id: 'notif-5',
    actorName: 'Noelle Angela Alarma',
    actorUsername: '@noelle_alarma',
    actorInitials: 'NA',
    actionText: 'updated her schedule',
    detailText: 'Schedule is private',
    badgeLabel: 'No access',
    category: 'no_access',
    timestampLabel: '1d ago',
    createdAtOrder: 5,
    timeGroup: 'YESTERDAY',
    isRead: true,
    targetScreen: 'friend_schedule',
    linkedFriendProfile: NOELLE_PRIVATE_SCHEDULE_PROFILE,
  },
];

/**
 * Filters and sorts notifications chronologically (newest first within each time group)
 */
export function getFilteredNotifications(
  notifications: NotificationItem[],
  filterMode: NotificationFilterMode
): NotificationItem[] {
  const sorted = [...notifications].sort(
    (a, b) => a.createdAtOrder - b.createdAtOrder
  );

  if (filterMode === 'unread') {
    return sorted.filter((n) => !n.isRead);
  }
  return sorted;
}

/**
 * Groups notifications by chronological section ('TODAY', 'YESTERDAY', 'EARLIER')
 */
export function groupNotificationsByTime(
  notifications: NotificationItem[]
): Record<NotificationTimeGroup, NotificationItem[]> {
  const grouped: Record<NotificationTimeGroup, NotificationItem[]> = {
    TODAY: [],
    YESTERDAY: [],
    EARLIER: [],
  };

  const sorted = [...notifications].sort(
    (a, b) => a.createdAtOrder - b.createdAtOrder
  );

  sorted.forEach((item) => {
    grouped[item.timeGroup].push(item);
  });

  return grouped;
}

/**
 * Computes unread notification count for BottomNavBar badge
 */
export function getUnreadNotificationCount(
  notifications: NotificationItem[]
): number {
  return notifications.filter((n) => !n.isRead).length;
}

/**
 * Reusable validation utility for key user interactions (NS-03)
 */
export function validateUserInteractionInput(params: {
  actionType: 'schedule_access' | 'friend_request' | 'mark_all_read';
  notification?: NotificationItem;
  unreadCount?: number;
}): ValidationErrorItem[] {
  const errors: ValidationErrorItem[] = [];

  if (
    params.actionType === 'schedule_access' &&
    params.notification?.category === 'no_access'
  ) {
    errors.push({
      id: 'val-no-access',
      field: 'schedule_permission',
      message: `${params.notification.actorName}'s schedule is set to private. Request access to view full details.`,
    });
  }

  if (
    params.actionType === 'mark_all_read' &&
    (params.unreadCount ?? 0) === 0
  ) {
    errors.push({
      id: 'val-already-read',
      field: 'read_status',
      message: 'All notifications are already marked as read.',
    });
  }

  return errors;
}
