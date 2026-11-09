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
  avatarBg?: string;
  mutualFriendsCount: number;
  direction: FriendRequestDirection;
  status: FriendRequestStatus;
  requestedAt?: string;
  // Requester detail fields (FS-04)
  department?: string; // e.g. "College of Computer Studies"
  program?: string; // e.g. "BS Information Technology"
  yearLevel?: string; // e.g. "2nd Year"
  bioNote?: string; // e.g. "Hey! Let's compare schedules."
  mutualFriendNames?: string[]; // e.g. ["Maria Deborah", "Kai Agod", "Aque Naman"]
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
  onFocus?: () => void;
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

/**
 * Props for the Received Friend Requests Screen (FS-04 / FS-05)
 */
export interface ReceivedFriendRequestsScreenProps {
  requests?: FriendRequestItem[];
  sentCount?: number;
  connectedFriends?: ConnectedFriend[];
  onBack?: () => void;
  onNavigateTab?: (tab: TabId) => void;
  onAcceptRequest?: (requestId: string, newConnectedFriend?: ConnectedFriend) => void;
  onDeclineRequest?: (requestId: string) => void;
  onUndoRequest?: (requestId: string) => void;
  onSwitchToSent?: () => void;
  onViewFriendSchedule?: (friend: FriendAvailability) => void;
}

/**
 * Props for the Friend Request Confirmation Modal (FS-05)
 */
export interface FriendRequestConfirmModalProps {
  visible: boolean;
  type: 'accept' | 'decline';
  request: FriendRequestItem | null;
  isSubmitting?: boolean;
  onConfirm: (request: FriendRequestItem) => void;
  onCancel: () => void;
}

/**
 * Props for the Friend Search Screen (FS-02)
 */
export interface FriendSearchScreenProps {
  onBack?: () => void;
  onNavigateTab?: (tab: TabId) => void;
  initialQuery?: string;
  onAddFriend?: (user: DiscoverableUser) => void;
}

/**
 * Props for individual matching user item in search results (FS-02)
 */
export interface FriendSearchResultItemProps {
  user: DiscoverableUser;
  onAddFriend: (user: DiscoverableUser) => void;
  isAdded?: boolean;
}

/**
 * Props for the No Results state in friend search (FS-02)
 */
export interface FriendSearchNoResultsProps {
  query: string;
  onClearQuery: () => void;
}
