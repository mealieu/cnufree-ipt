import { TabId } from './navigation';

export type SharedViewMode = 'day' | 'week';

export type WeeklyCalendarLayoutMode = 'common-timeline' | 'multi-person';

export type ScheduleColorVariant = 'forest' | 'teal' | 'olive' | 'mint' | 'busy';

export type AvailabilitySegmentStatus = 'all-free' | 'some-free' | 'busy';

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

export interface WeekDayInfo {
  date: Date;
  dateKey: string;
  dayShort: string;   // e.g. "Mon"
  dayNumber: string;  // e.g. "19"
  rowLabel: string;   // e.g. "Mon 19"
  fullLabel: string;  // e.g. "Monday, Oct 19"
  isToday: boolean;
  isWeekend: boolean;
}

export interface TimelineBarSegment {
  id: string;
  startHour: number;
  endHour: number;
  durationRatio: number;
  status: AvailabilitySegmentStatus;
  freeCount: number;
  totalCount: number;
}

export interface DayWeeklyAvailabilityRow {
  day: WeekDayInfo;
  windowCount: number;
  windowLabel: string; // e.g. "2 windows", "3 windows", "No overlap", "1 window"
  hasOverlap: boolean;
  segments: TimelineBarSegment[];
  allFreeWindows: OverlappingFreeWindow[];
  partialWindows: OverlappingFreeWindow[];
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
  viewMode?: SharedViewMode;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onThisWeek?: () => void;
  isCurrentWeek?: boolean;
}

export interface WeeklySharedCalendarProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  friends: SharedCalendarFriend[];
  layoutMode: WeeklyCalendarLayoutMode;
  onLayoutModeChange: (mode: WeeklyCalendarLayoutMode) => void;
  onFriendPress?: (friend: SharedCalendarFriend) => void;
  onScheduleItemPress?: (item: SharedScheduleItem, friend: SharedCalendarFriend) => void;
  onOpenDayView?: (date: Date) => void;
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
