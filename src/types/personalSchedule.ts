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
  title: string;
  isBusy: boolean;
  dayKey: string;
  startTime: string;
  endTime: string;
  timeMarker?: string;
  room?: string;
  notes?: string;
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
