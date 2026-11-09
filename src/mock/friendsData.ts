import {
  ConnectedFriend,
  FriendRequestItem,
  FriendGroupItem,
  DiscoverableUser,
} from '../types/friends';
import { MARIA_WEEKLY_SCHEDULE } from './dashboardData';

/**
 * Connected Friends displayed on the Friends Main Screen (FS-01, Page 1 of UI Guide)
 * Default count is 2 ("Connected Friends • 2"):
 * 1. Nhaka Kai P. Agod (@kai_pagod)
 * 2. Aque Naman M. Una (@naman.aque)
 */
export const INITIAL_CONNECTED_FRIENDS: ConnectedFriend[] = [
  {
    id: 'cf-1',
    name: 'Nhaka Kai P. Agod',
    username: '@kai_pagod',
    initials: 'NK',
    mutualFriendsCount: 4,
    groupIds: ['fg-it-pwends', 'fg-shs-friends'],
    availabilitySummary: 'Free until 11:00 AM',
    scheduleProfile: {
      id: 'cf-1',
      name: 'Nhaka Kai P. Agod',
      nickname: 'Kai',
      relationship: 'IT Pwends',
      initials: 'NK',
      status: 'free',
      untilTime: '11:00AM',
      nextActivity: '1:30pm RB212 Financial Management',
      groups: ['dyd'],
      currentLocation: 'Main Library 2F',
      freeSlots: [
        { startHour: 8.0, endHour: 9.0 },
        { startHour: 11.0, endHour: 13.0 },
        { startHour: 15.5, endHour: 18.0 },
      ],
      scheduleNotes: 'Free for late morning study sessions.',
      schedule: MARIA_WEEKLY_SCHEDULE[1].items,
    },
  },
  {
    id: 'cf-2',
    name: 'Aque Naman M. Una',
    username: '@naman.aque',
    initials: 'AN',
    mutualFriendsCount: 3,
    groupIds: ['fg-it-pwends', 'fg-shs-friends', 'fg-dyd-squad'],
    availabilitySummary: 'Free until 1:00 PM',
    scheduleProfile: {
      id: 'cf-2',
      name: 'Aque Naman M. Una',
      nickname: 'Aque',
      relationship: 'IT Pwends',
      initials: 'AN',
      status: 'free',
      untilTime: '1:00PM',
      nextActivity: '1:30pm AS102 Business Comm',
      groups: ['bora', 'dyd'],
      currentLocation: 'Student Center Lounge',
      freeSlots: [
        { startHour: 8.0, endHour: 9.5 },
        { startHour: 11.5, endHour: 13.5 },
        { startHour: 15.5, endHour: 18.0 },
      ],
      scheduleNotes: 'Available around midday near Student Center.',
      schedule: MARIA_WEEKLY_SCHEDULE[0].items,
    },
  },
];

/**
 * Extended Connected Friends list (used for View All / FS-06 context)
 */
export const EXTENDED_CONNECTED_FRIENDS: ConnectedFriend[] = [
  ...INITIAL_CONNECTED_FRIENDS,
  {
    id: 'cf-3',
    name: 'Lalah Mohb',
    username: '@Lalah',
    initials: 'LM',
    mutualFriendsCount: 3,
    groupIds: ['fg-shs-friends'],
    availabilitySummary: 'In class until 12:00 PM',
    scheduleProfile: {
      id: 'cf-3',
      name: 'Lalah Mohb',
      nickname: 'Lalah',
      relationship: 'SHS Friends',
      initials: 'LM',
      status: 'busy',
      untilTime: '12:00PM',
      currentActivity: 'Business Analytics BA301',
      nextActivity: '2:00pm M101 Marketing',
      groups: ['courtside'],
      currentLocation: 'BA Building 3F',
      freeSlots: [
        { startHour: 8.0, endHour: 10.0 },
        { startHour: 12.0, endHour: 14.0 },
        { startHour: 15.5, endHour: 18.0 },
      ],
      schedule: MARIA_WEEKLY_SCHEDULE[2].items,
    },
  },
];

/**
 * Received Friend Requests (matches "Received (2)" in Page 1 and Page 4 of UI Guide)
 */
export const INITIAL_RECEIVED_REQUESTS: FriendRequestItem[] = [
  {
    id: 'req-rec-1',
    name: 'Lalah Mohb',
    username: '@Lalah',
    initials: 'LM',
    mutualFriendsCount: 3,
    direction: 'received',
    status: 'pending',
    requestedAt: '2h ago',
  },
  {
    id: 'req-rec-2',
    name: 'Jay N. Ty',
    username: '@jntexpress',
    initials: 'JT',
    mutualFriendsCount: 3,
    direction: 'received',
    status: 'pending',
    requestedAt: '1d ago',
  },
];

/**
 * Sent Friend Requests (matches "Sent (14)" in Page 1 of UI Guide)
 */
export const INITIAL_SENT_REQUESTS: FriendRequestItem[] = [
  {
    id: 'req-sent-1',
    name: 'Mariah Carey',
    username: '@MariahCar',
    initials: 'MC',
    mutualFriendsCount: 3,
    direction: 'sent',
    status: 'pending',
    requestedAt: 'Just now',
  },
  {
    id: 'req-sent-2',
    name: 'Mariah Deborah',
    username: '@MariahDeborah',
    initials: 'MD',
    mutualFriendsCount: 3,
    direction: 'sent',
    status: 'pending',
    requestedAt: '3h ago',
  },
  {
    id: 'req-sent-3',
    name: 'Carlos Mendoza',
    username: '@carlos_m',
    initials: 'CM',
    mutualFriendsCount: 2,
    direction: 'sent',
    status: 'pending',
    requestedAt: '5h ago',
  },
  {
    id: 'req-sent-4',
    name: 'Patricia Villanueva',
    username: '@pat_villa',
    initials: 'PV',
    mutualFriendsCount: 4,
    direction: 'sent',
    status: 'pending',
    requestedAt: '1d ago',
  },
  {
    id: 'req-sent-5',
    name: 'Gabriel Santos',
    username: '@gab_santos',
    initials: 'GS',
    mutualFriendsCount: 1,
    direction: 'sent',
    status: 'pending',
    requestedAt: '1d ago',
  },
  {
    id: 'req-sent-6',
    name: 'Katrina Bautista',
    username: '@kat_bautista',
    initials: 'KB',
    mutualFriendsCount: 2,
    direction: 'sent',
    status: 'pending',
    requestedAt: '2d ago',
  },
  {
    id: 'req-sent-7',
    name: 'Miguel Soriano',
    username: '@migs_soriano',
    initials: 'MS',
    mutualFriendsCount: 5,
    direction: 'sent',
    status: 'pending',
    requestedAt: '2d ago',
  },
  {
    id: 'req-sent-8',
    name: 'Hannah Reyes',
    username: '@hannah_r',
    initials: 'HR',
    mutualFriendsCount: 1,
    direction: 'sent',
    status: 'pending',
    requestedAt: '3d ago',
  },
  {
    id: 'req-sent-9',
    name: 'Paolo Navarro',
    username: '@paolo_nav',
    initials: 'PN',
    mutualFriendsCount: 3,
    direction: 'sent',
    status: 'pending',
    requestedAt: '3d ago',
  },
  {
    id: 'req-sent-10',
    name: 'Bea Pascual',
    username: '@bea_pascual',
    initials: 'BP',
    mutualFriendsCount: 2,
    direction: 'sent',
    status: 'pending',
    requestedAt: '4d ago',
  },
  {
    id: 'req-sent-11',
    name: 'Rafael Aquino',
    username: '@raf_aquino',
    initials: 'RA',
    mutualFriendsCount: 1,
    direction: 'sent',
    status: 'pending',
    requestedAt: '5d ago',
  },
  {
    id: 'req-sent-12',
    name: 'Clarisse Tolentino',
    username: '@clarisse_t',
    initials: 'CT',
    mutualFriendsCount: 4,
    direction: 'sent',
    status: 'pending',
    requestedAt: '5d ago',
  },
  {
    id: 'req-sent-13',
    name: 'Jericho Ramos',
    username: '@echo_ramos',
    initials: 'JR',
    mutualFriendsCount: 2,
    direction: 'sent',
    status: 'pending',
    requestedAt: '6d ago',
  },
  {
    id: 'req-sent-14',
    name: 'Denise Ocampo',
    username: '@denise_o',
    initials: 'DO',
    mutualFriendsCount: 3,
    direction: 'sent',
    status: 'pending',
    requestedAt: '1w ago',
  },
];

/**
 * Friend Groups (matches "Friend Groups • 3" and "IT Pwends" in Page 1, plus "SHS Friends" in Page 8)
 */
export const INITIAL_FRIEND_GROUPS: FriendGroupItem[] = [
  {
    id: 'fg-it-pwends',
    name: 'IT Pwends',
    memberIds: ['cf-1', 'cf-2'],
    memberCount: 2,
    isFeatured: true,
  },
  {
    id: 'fg-shs-friends',
    name: 'SHS Friends',
    memberIds: ['cf-1', 'cf-2', 'cf-3'],
    memberCount: 3,
    isFeatured: false,
  },
  {
    id: 'fg-dyd-squad',
    name: 'DYD Squad',
    memberIds: ['cf-2'],
    memberCount: 1,
    isFeatured: false,
  },
];

/**
 * Discoverable users for Find Friends search (shared context for FS-02 / FS-03)
 * Exactly reproduces Figma mockup UI - 15 where searching "Mariah" returns:
 * 1. Mariah Carey (@MariahCar, 3 mutual friends)
 * 2. Ma. Mariah Sia (@Siam, No mutual friends)
 */
export const DISCOVERABLE_USERS: DiscoverableUser[] = [
  {
    id: 'du-1',
    name: 'Mariah Carey',
    username: '@MariahCar',
    initials: 'MC',
    mutualFriendsCount: 3,
    connectionStatus: 'none',
  },
  {
    id: 'du-3',
    name: 'Ma. Mariah Sia',
    username: '@Siam',
    initials: 'MS',
    mutualFriendsCount: 0,
    connectionStatus: 'none',
  },
  {
    id: 'du-4',
    name: 'Carlos Mendoza',
    username: '@carlos_m',
    initials: 'CM',
    mutualFriendsCount: 2,
    connectionStatus: 'none',
  },
  {
    id: 'du-5',
    name: 'Patricia Villanueva',
    username: '@pat_villa',
    initials: 'PV',
    mutualFriendsCount: 4,
    connectionStatus: 'none',
  },
  {
    id: 'du-6',
    name: 'Gabriel Santos',
    username: '@gab_santos',
    initials: 'GS',
    mutualFriendsCount: 1,
    connectionStatus: 'none',
  },
  {
    id: 'du-7',
    name: 'Bianca Gonzalez',
    username: '@biancag',
    initials: 'BG',
    mutualFriendsCount: 0,
    connectionStatus: 'none',
  },
];

/**
 * Formats mutual friends count according to UI - 15 specification:
 * - 0 -> "No mutual friends"
 * - 1 -> "1 mutual friend"
 * - N -> "N mutual friends"
 */
export function formatMutualFriends(count: number): string {
  if (!count || count <= 0) {
    return 'No mutual friends';
  }
  if (count === 1) {
    return '1 mutual friend';
  }
  return `${count} mutual friends`;
}

/**
 * Searches discoverable users by name or username (case-insensitive) (FS-02)
 */
export function searchDiscoverableUsers(
  users: DiscoverableUser[],
  query: string
): DiscoverableUser[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return users;
  }
  return users.filter((user) => {
    const matchesName = user.name.toLowerCase().includes(normalized);
    const matchesUsername = user.username.toLowerCase().includes(normalized);
    const cleanUsername = user.username.replace(/^@/, '').toLowerCase();
    const matchesCleanUsername = cleanUsername.includes(normalized);
    return matchesName || matchesUsername || matchesCleanUsername;
  });
}

/**
 * Filters connected friends by search query (matches name or @username) and optional groupId
 */
export function filterConnectedFriends(
  friends: ConnectedFriend[],
  searchQuery: string,
  groupId?: string | null
): ConnectedFriend[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return friends.filter((friend) => {
    const matchesGroup = !groupId || friend.groupIds.includes(groupId);
    if (!matchesGroup) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const matchesName = friend.name.toLowerCase().includes(normalizedQuery);
    const matchesUsername = friend.username.toLowerCase().includes(normalizedQuery);
    return matchesName || matchesUsername;
  });
}

/**
 * Filters friend groups by search query
 */
export function filterFriendGroups(
  groups: FriendGroupItem[],
  searchQuery: string
): FriendGroupItem[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  if (!normalizedQuery) {
    return groups;
  }
  return groups.filter((group) =>
    group.name.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Sends a friend request to a discoverable user (FS-02 / FS-03)
 */
export function sendFriendRequest(user: DiscoverableUser): FriendRequestItem {
  const existingIndex = INITIAL_SENT_REQUESTS.findIndex(
    (r) => r.username.toLowerCase() === user.username.toLowerCase()
  );
  if (existingIndex >= 0) {
    return INITIAL_SENT_REQUESTS[existingIndex];
  }

  const newRequest: FriendRequestItem = {
    id: `req-sent-${Date.now()}`,
    name: user.name,
    username: user.username,
    initials: user.initials,
    mutualFriendsCount: user.mutualFriendsCount,
    direction: 'sent',
    status: 'pending',
    requestedAt: 'Just now',
  };
  INITIAL_SENT_REQUESTS.unshift(newRequest);
  return newRequest;
}

/**
 * Cancels a pending friend request sent to a discoverable user
 */
export function cancelFriendRequest(user: DiscoverableUser): void {
  const existingIndex = INITIAL_SENT_REQUESTS.findIndex(
    (r) => r.username.toLowerCase() === user.username.toLowerCase()
  );
  if (existingIndex >= 0) {
    INITIAL_SENT_REQUESTS.splice(existingIndex, 1);
  }
}
