/**
 * Type definitions for Personal Schedule (PS-03 / PS-04)
 */

import { TabId } from './navigation';

export type PersonalScheduleViewMode = 'daily' | 'weekly';

export type PeriodOccupancyType = 'free' | 'busy';

export interface PersonalSchedulePeriod {
  id: string;
  timeMarker: string; // e.g. "8:00AM", "9:00 AM", "10:00 AM", "12:00 PM"
  title: string;      // e.g. "Free", "Busy", or subject title "UI/UX"
  isBusy: boolean;    // false = Free period, true = Occupied/Busy period
  startTime: string;  // e.g. "8:00 AM"
  endTime: string;    // e.g. "9:00 AM"
  timeRange: string;  // e.g. "8:00AM - 9:00AM", "10:00 to 12: 00PM", "12:00 pm to 1:00 PM"
  startHour: number;  // 24-hr decimal, e.g. 8.0
  endHour: number;    // 24-hr decimal, e.g. 9.0
  room?: string;      // e.g. "AL211A", "P216"
  notes?: string;     // e.g. "Lecture with Prof. Garcia"
  dayKey: string;     // 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
}

export interface PersonalScheduleDay {
  dayKey: string;         // 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
  dayShort: string;       // 'Mon' | 'Tue' | 'Wed' | 'Thurs' | 'Fri' | 'Sat' | 'Sun'
  dayDate: string;        // '19' | '19' | '21' | '22' | '23' | '24' | '25'
  fullDateString: string; // e.g. 'Sunday, October 25,2026', 'Tuesday, October 20, 2026'
  periods: PersonalSchedulePeriod[];
}

export interface ScheduleEntryFormData {
  id?: string;
  title: string;          // Activity name, e.g. "UI/UX Design Studio"
  isBusy: boolean;
  dayKey: string;
  date?: string;          // "24 / 10 / 2026"
  startTime: string;      // e.g. "7:00 AM"
  endTime: string;        // e.g. "8:00 AM"
  timeMarker?: string;
  room?: string;
  notes?: string;
}

export interface WeeklyScheduleSlot {
  time: string;           // "7:00 AM", "8:00 AM", etc.
  status: 'ACTIVITY' | 'FREE';
  activityTitle?: string; // e.g. "UI/UX Design Studio"
  room?: string;          // e.g. "AL211A"
  notes?: string;         // e.g. "Lecture & critique"
}

export interface WeeklyScheduleDay {
  dayKey: string;         // 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'
  dayName: string;        // 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY'
  dateNumber: string;     // '25', '19', '20', etc.
  fullDateString: string; // 'Sunday, October 25, 2026'
  slots: WeeklyScheduleSlot[];
}

export interface WeeklyScheduleWeek {
  weekId: string;
  weekRangeLabel: string; // e.g. "October 19 – 25, 2026"
  days: WeeklyScheduleDay[];
}

export interface PersonalScheduleScreenProps {
  onBack: () => void;
  onNavigateTab?: (tab: TabId) => void;
  initialDateKey?: string;
  initialViewMode?: PersonalScheduleViewMode;
}

export interface PersonalScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  initialDateKey?: string;
  initialViewMode?: PersonalScheduleViewMode;
  onNavigateTab?: (tab: TabId) => void;
}
