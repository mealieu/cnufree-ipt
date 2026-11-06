export type FriendGroupId = 'all' | 'bora' | 'courtside' | 'dyd' | (string & {});

export interface FriendGroupOption {
  id: FriendGroupId;
  label: string;
}

export interface ScheduleActivity {
  id: string;
  title: string;
  startTime: string; // e.g. "8:00 AM"
  endTime: string;   // e.g. "10:30 AM"
  startHour: number; // 24-hr decimal, e.g. 8.0
  endHour: number;   // 24-hr decimal, e.g. 10.5
  room?: string;
  isBusy: boolean;
}

export interface FriendAvailability {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  status: 'free' | 'busy';
  untilTime: string;          // e.g. "10:30AM" or "3:00AM"
  nextActivity?: string;      // e.g. "3:00pm AL212"
  currentActivity?: string;   // e.g. "Networking D216"
  groups: Array<'bora' | 'courtside' | 'dyd'>;
  freeSlots: Array<{ startHour: number; endHour: number }>;
  scheduleNotes?: string;
}

export interface BestWindow {
  timeRange: string;         // e.g. "7:30 – 9:00 PM today"
  description: string;       // e.g. "You, Allyna, and 2 other are all free (4 people)"
  initials: string[];        // ['A', 'N', 'S']
  freeCount: number;         // 4
  suggestedActivity: string; // "Quick study sprint or court session"
  startHour: number;
  endHour: number;
}

export interface UserProfile {
  name: string;
  greetingTitle?: string;
  dateString?: string;
  avatarUrl?: string;
}

export type TabId = 'home' | 'friends' | 'shared' | 'notifications' | 'profile';
