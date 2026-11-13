import { TabId } from './navigation';

export type SharedViewMode = 'day' | 'week';

export type ScheduleColorVariant = 'forest' | 'teal' | 'olive' | 'mint' | 'busy';

export interface SharedScheduleItem {
  id: string;
  title: string;
  startTime: string; // e.g. "9:00 AM"
  endTime: string;   // e.g. "10:30 AM"
  timeRange?: string; // e.g. "9:00–10:30"
  startHour: number; // 24-hr decimal, e.g. 9.0
  endHour: number;   // 24-hr decimal, e.g. 10.5
  room?: string;
  code?: string;
  isBusy: boolean;
  isPrivate?: boolean; // SS-06 architectural context
  colorVariant?: ScheduleColorVariant;
  notes?: string;
}

export interface SharedCalendarFriend {
  id: string;
  name: string;
  nickname?: string;
  initials: string;
  avatarUrl?: string;
  isPrivate?: boolean; // SS-06 privacy-restricted indicator
  hasMissingSchedule?: boolean; // SS-06 missing-schedule indicator
  scheduleByDate: Record<string, SharedScheduleItem[]>; // Keyed by ISO date string 'YYYY-MM-DD'
}

export interface SharedFriendGroup {
  id: string;
  name: string;
  memberCount: number;
  members: SharedCalendarFriend[];
  description?: string;
  statusSummary?: string; // e.g. "6 people · 2 schedules unavailable", "4 people · All schedules available"
  unavailableCount?: number;
  missingCount?: number;
  isEmpty?: boolean;
  isCustom?: boolean;
}

export interface FriendGroupSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  groups: SharedFriendGroup[];
  selectedGroupId: string;
  onSelectGroup: (group: SharedFriendGroup) => void;
}

export interface OverlappingFreeWindow {
  id: string;
  startTime: string;
  endTime: string;
  timeRange: string;
  startHour: number;
  endHour: number;
  freeCount: number;
  totalCount: number;
  label: string; // e.g. "All 4 free" or "3 of 4"
  isAllFree: boolean;
}

export interface DailyCalendarProps {
  date: Date;
  dateKey: string;
  friends: SharedCalendarFriend[];
  overlappingWindows?: OverlappingFreeWindow[];
  onFriendPress?: (friend: SharedCalendarFriend) => void; // SS-05 architectural context
  onScheduleItemPress?: (item: SharedScheduleItem, friend: SharedCalendarFriend) => void;
  showCurrentTimeIndicator?: boolean;
  highlightFreeWindows?: boolean;
}

export interface SharedDateNavigationProps {
  currentDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  isToday: boolean;
}

export interface SharedGroupFilterProps {
  groups: SharedFriendGroup[];
  selectedGroupId: string;
  onSelectGroup: (group: SharedFriendGroup) => void;
  onOpenSelector?: () => void;
  onManageGroups?: () => void; // SS-02 architectural context
}

export interface SharedScheduleScreenProps {
  onNavigateTab?: (tab: TabId) => void;
  initialGroupId?: string;
  initialDate?: Date;
}

