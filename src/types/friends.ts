import { FriendAvailability } from './dashboard';
import { TabId } from './navigation';

/**
 * Represents a connected friend displayed on the Friends main screen (FS-01)
 * and connected friends list (FS-06 / FS-09).
 */
export interface ConnectedFriend {
  id: string;
  name: string;
  username: string; // e.g. "@kai_pagod"
  initials: string;
  avatarUrl?: string;
  mutualFriendsCount?: number;
  groupIds: string[];
  availabilitySummary?: string;
  scheduleProfile: FriendAvailability;
}

/**
 * Represents an incoming (received) or outgoing (sent) friend request (FS-01, FS-03, FS-04, FS-05).
 */
export type FriendRequestDirection = 'received' | 'sent';
export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

export interface FriendRequestItem {
  id: string;
  name: string;
  username: string;
  initials: string;
  avatarUrl?: string;
  mutualFriendsCount: number;
  direction: FriendRequestDirection;
  status: FriendRequestStatus;
  requestedAt?: string;
}

/**
 * Represents a user-created friend group (FS-01, FS-07, FS-08).
 */
export interface FriendGroupItem {
  id: string;
  name: string;
  memberIds: string[];
  memberCount: number;
  isFeatured?: boolean;
}

/**
 * Represents a user in search results (FS-02, FS-03).
 */
export interface DiscoverableUser {
  id: string;
  name: string;
  username: string;
  initials: string;
  avatarUrl?: string;
  mutualFriendsCount: number;
  connectionStatus: 'none' | 'pending_sent' | 'pending_received' | 'connected';
}

/**
 * Props for the Friends Search Bar component (FS-01)
 */
export interface FriendsSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  onPressAddButton?: () => void;
  placeholder?: string;
}

/**
 * Props for the Connected Friends Section component (FS-01)
 */
export interface ConnectedFriendsSectionProps {
  friends: ConnectedFriend[];
  totalCount: number;
  showAll: boolean;
  onToggleViewAll: () => void;
  onPressSchedule: (friend: ConnectedFriend) => void;
  onPressFriend?: (friend: ConnectedFriend) => void;
  searchQuery?: string;
}

/**
 * Props for the Pending Friend Requests Section component (FS-01)
 */
export interface PendingRequestsSectionProps {
  receivedCount: number;
  sentCount: number;
  receivedRequests?: FriendRequestItem[];
  sentRequests?: FriendRequestItem[];
  activePreviewType?: FriendRequestDirection | null;
  onPressReceived: () => void;
  onPressSent: () => void;
}

/**
 * Props for the Friend Groups Section component (FS-01)
 */
export interface FriendGroupsSectionProps {
  groups: FriendGroupItem[];
  totalCount: number;
  isManaging: boolean;
  selectedGroupId: string | null;
  onToggleManage: () => void;
  onSelectGroup: (group: FriendGroupItem) => void;
  onPressCreateGroup: () => void;
}

/**
 * Props for the Friends Main Screen (FS-01)
 */
export interface FriendsScreenProps {
  onNavigateTab?: (tab: TabId) => void;
  onViewFriendSchedule?: (friend: FriendAvailability) => void;
  onOpenFindFriends?: () => void;
  onOpenViewAllFriends?: () => void;
  onOpenReceivedRequests?: () => void;
  onOpenSentRequests?: () => void;
  onOpenManageGroups?: (group?: FriendGroupItem) => void;
  onOpenCreateGroup?: () => void;
}
