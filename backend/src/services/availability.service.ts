import { TypedSupabaseClient } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import {
  DashboardAvailabilityQueryInput,
  DEFAULT_TIMEZONE,
  formatMinutes12h,
  FriendAvailabilityQueryInput,
  minutesToDecimalHour,
  OverlapQueryInput,
  resolveZonedDateTime,
} from '../schemas/availability.schema';
import {
  dayOfWeekToDayKey,
  dayOfWeekToName,
  formatTime12h,
  normalizeDateToSql,
  parseTimeToMinutes,
} from '../schemas/schedule.schema';
import { Database } from '../types/database.types';
import {
  buildMemberPrivacyState,
  maskScheduleBlocksForAccess,
  MemberPrivacyState,
  PermissionService,
  RawScheduleBlock,
  ScheduleAccessLevel,
} from './permission.service';
import { computeInitials } from './profile.service';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface MinuteInterval {
  startMin: number;
  endMin: number;
}

export type WindowPriorityCategory =
  | 'lunch'
  | 'dismissal'
  | 'evening'
  | 'morning'
  | 'afternoon';

export interface FormattedAvailabilityBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  timeRange: string;
  startHour: number;
  endHour: number;
  startMinutes: number;
  endMinutes: number;
  room: string | null;
  notes: string | null;
  isBusy: boolean;
  isPrivate: boolean;
}

export interface DashboardFriendStatus extends MemberPrivacyState {
  id: string;
  name: string;
  fullName: string;
  username: string;
  initials: string;
  avatarUrl: string | null;
  status: 'free' | 'busy' | 'unknown';
  hasSchedule: boolean;
  untilTime: string | null;
  currentActivity: string | null;
  nextActivity: string | null;
  groupIds: string[];
  freeSlots: Array<{ startHour: number; endHour: number }>;
  schedule: FormattedAvailabilityBlock[];
}

export interface OverlappingFreeWindow {
  id: string;
  startTime: string;
  endTime: string;
  timeRange: string;
  startHour: number;
  endHour: number;
  startMinutes: number;
  endMinutes: number;
  durationMinutes: number;
  freeCount: number;
  participatingCount: number;
  totalCount: number;
  label: string;
  isAllFree: boolean;
  freeMemberIds: string[];
  busyMemberIds: string[];
  priorityCategory: WindowPriorityCategory;
  priorityLabel: string;
  priorityScore: number;
  priorityRank: number;
  isHighValueGap: boolean;
  isRecommended: boolean;
}

export interface TimelineBarSegment {
  id: string;
  startHour: number;
  endHour: number;
  durationRatio: number;
  status: 'all-free' | 'some-free' | 'busy';
  freeCount: number;
  totalCount: number;
}

export interface SharedCalendarMemberResult extends MemberPrivacyState {
  id: string;
  name: string;
  initials: string;
  username: string;
  avatarUrl: string | null;
  isMe: boolean;
  hasSchedule: boolean;
  groupIds: string[];
  scheduleByDate: Record<string, FormattedAvailabilityBlock[]>;
}

export interface BestWindowRecommendation {
  timeRange: string;
  description: string;
  initials: string[];
  freeCount: number;
  totalCount: number;
  suggestedActivity: string;
  startHour: number;
  endHour: number;
  durationMinutes: number;
  priorityCategory: WindowPriorityCategory;
  priorityLabel: string;
  isHighValueGap: boolean;
}

interface FriendScheduleBundle {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
  scheduleVisibility: string;
  accessLevel: ScheduleAccessLevel;
  canViewSchedule: boolean;
  hasAnySchedule: boolean;
  groupIds: string[];
  dayBlocks: RawScheduleBlock[];
  privacyState: MemberPrivacyState;
}

const LUNCH_CORE_START = 11 * 60 + 30; // 11:30 AM
const LUNCH_CORE_END = 13 * 60 + 30;   // 1:30 PM
const LUNCH_BAND_START = 11 * 60;      // 11:00 AM
const LUNCH_BAND_END = 14 * 60;        // 2:00 PM

const DISMISSAL_CORE_START = 16 * 60 + 30; // 4:30 PM
const DISMISSAL_CORE_END = 18 * 60 + 30;   // 6:30 PM
const DISMISSAL_BAND_START = 16 * 60;      // 4:00 PM
const DISMISSAL_BAND_END = 18 * 60 + 30;   // 6:30 PM

const EVENING_BAND_START = 18 * 60 + 30;   // 6:30 PM
const EVENING_BAND_END = 21 * 60;          // 9:00 PM

const SHORT_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const FULL_DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;
const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

function isRpcMissingError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === 'PGRST202' ||
    error.code === '42883' ||
    (error.message || '').toLowerCase().includes('could not find the function')
  );
}

/**
 * Merges overlapping or adjacent minute intervals sorted by startMin.
 */
export function mergeMinuteIntervals(intervals: MinuteInterval[]): MinuteInterval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals]
    .filter((iv) => iv.endMin > iv.startMin)
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  if (sorted.length === 0) return [];

  const merged: MinuteInterval[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    if (current.startMin <= last.endMin) {
      last.endMin = Math.max(last.endMin, current.endMin);
    } else {
      merged.push({ ...current });
    }
  }
  return merged;
}

/**
 * Subtracts busy intervals from [boundStartMin, boundEndMin] to produce continuous free intervals.
 */
export function computeFreeIntervals(
  busyIntervals: MinuteInterval[],
  boundStartMin: number,
  boundEndMin: number
): MinuteInterval[] {
  if (boundEndMin <= boundStartMin) return [];
  const clampedBusy = busyIntervals
    .map((iv) => ({
      startMin: Math.max(boundStartMin, iv.startMin),
      endMin: Math.min(boundEndMin, iv.endMin),
    }))
    .filter((iv) => iv.endMin > iv.startMin);

  const mergedBusy = mergeMinuteIntervals(clampedBusy);
  const free: MinuteInterval[] = [];
  let cursor = boundStartMin;

  for (const busy of mergedBusy) {
    if (busy.startMin > cursor) {
      free.push({ startMin: cursor, endMin: busy.startMin });
    }
    cursor = Math.max(cursor, busy.endMin);
  }

  if (cursor < boundEndMin) {
    free.push({ startMin: cursor, endMin: boundEndMin });
  }

  return free;
}

function intervalOverlapMinutes(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): number {
  return Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
}

/**
 * Classifies and scores an overlapping free window, prioritizing high-value campus gaps:
 * Lunch (11:30 AM – 1:30 PM) and Dismissal (4:30 PM – 6:30 PM).
 */
export function scoreAndClassifyWindow(params: {
  startMin: number;
  endMin: number;
  freeCount: number;
  totalCount: number;
  isAllFree: boolean;
}): {
  priorityCategory: WindowPriorityCategory;
  priorityLabel: string;
  priorityScore: number;
  isHighValueGap: boolean;
  suggestedActivity: string;
} {
  const { startMin, endMin, freeCount, totalCount, isAllFree } = params;
  const duration = Math.max(0, endMin - startMin);

  const lunchCoreOverlap = intervalOverlapMinutes(
    startMin,
    endMin,
    LUNCH_CORE_START,
    LUNCH_CORE_END
  );
  const lunchBandOverlap = intervalOverlapMinutes(
    startMin,
    endMin,
    LUNCH_BAND_START,
    LUNCH_BAND_END
  );

  const dismissalCoreOverlap = intervalOverlapMinutes(
    startMin,
    endMin,
    DISMISSAL_CORE_START,
    DISMISSAL_CORE_END
  );
  const dismissalBandOverlap = intervalOverlapMinutes(
    startMin,
    endMin,
    DISMISSAL_BAND_START,
    DISMISSAL_BAND_END
  );

  const eveningOverlap = intervalOverlapMinutes(
    startMin,
    endMin,
    EVENING_BAND_START,
    EVENING_BAND_END
  );

  let priorityCategory: WindowPriorityCategory;
  let priorityLabel: string;
  let isHighValueGap = false;
  let gapBonus = 0;
  let suggestedActivity = 'Quick study sprint or campus meetup';

  if (
    lunchBandOverlap >= 30 &&
    (lunchCoreOverlap >= dismissalCoreOverlap || lunchBandOverlap >= dismissalBandOverlap)
  ) {
    priorityCategory = 'lunch';
    priorityLabel = 'Lunch Break';
    isHighValueGap = true;
    gapBonus = 45 + Math.min(25, (lunchCoreOverlap / 120) * 25);
    suggestedActivity = 'Campus lunch meetup or midday study break';
  } else if (dismissalBandOverlap >= 30) {
    priorityCategory = 'dismissal';
    priorityLabel = 'Dismissal Gap';
    isHighValueGap = true;
    gapBonus = 40 + Math.min(25, (dismissalCoreOverlap / 120) * 25);
    suggestedActivity = 'After-class hangout, court session, or group review';
  } else if (eveningOverlap >= 30) {
    priorityCategory = 'evening';
    priorityLabel = 'Evening Hangout';
    gapBonus = 20;
    suggestedActivity = 'Evening dinner hangout or study sprint';
  } else if (startMin < 12 * 60) {
    priorityCategory = 'morning';
    priorityLabel = 'Morning Gap';
    gapBonus = 10;
    suggestedActivity = 'Morning coffee or library review session';
  } else {
    priorityCategory = 'afternoon';
    priorityLabel = 'Afternoon Gap';
    gapBonus = 15;
    suggestedActivity = 'Afternoon study session or campus catch-up';
  }

  const groupRatio = totalCount > 0 ? freeCount / totalCount : 0;
  const consensusBonus = isAllFree ? 100 : groupRatio * 55;
  const durationBonus = Math.min(duration, 180) * 0.25;
  const priorityScore =
    Math.round((consensusBonus + gapBonus + durationBonus) * 100) / 100;

  return {
    priorityCategory,
    priorityLabel,
    priorityScore,
    isHighValueGap,
    suggestedActivity,
  };
}

/**
 * Formats a raw schedule row into a frontend-compatible availability block.
 */
export function formatAvailabilityBlock(
  row: RawScheduleBlock
): FormattedAvailabilityBlock {
  const startMinutes = parseTimeToMinutes(row.start_time);
  const endMinutes = parseTimeToMinutes(row.end_time);
  const startTime = formatTime12h(row.start_time);
  const endTime = formatTime12h(row.end_time);

  return {
    id: row.id,
    title: row.title,
    startTime,
    endTime,
    timeRange: `${startTime} – ${endTime}`,
    startHour: minutesToDecimalHour(startMinutes),
    endHour: minutesToDecimalHour(endMinutes),
    startMinutes,
    endMinutes,
    room: row.room,
    notes: row.notes,
    isBusy: row.is_busy,
    isPrivate: Boolean(row.is_private),
  };
}

/**
 * Computes real-time free/busy/unknown status at `evaluatedMinutes` for a single day's blocks.
 */
export function computeRealtimeStatus(params: {
  blocks: FormattedAvailabilityBlock[];
  evaluatedMinutes: number;
  hasSchedule: boolean;
  canViewSchedule: boolean;
  isPrivate: boolean;
  dayStartMin?: number;
  dayEndMin?: number;
}): {
  status: 'free' | 'busy' | 'unknown';
  untilTime: string | null;
  currentActivity: string | null;
  nextActivity: string | null;
  freeSlots: Array<{ startHour: number; endHour: number }>;
} {
  const dayStartMin = params.dayStartMin ?? 8 * 60;
  const dayEndMin = params.dayEndMin ?? 21 * 60;

  if (!params.canViewSchedule || !params.hasSchedule) {
    return {
      status: 'unknown',
      untilTime: null,
      currentActivity: null,
      nextActivity: null,
      freeSlots: [],
    };
  }

  const busyBlocks = params.blocks
    .filter((b) => b.isBusy && b.endMinutes > b.startMinutes)
    .sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes);

  const freeIntervals = computeFreeIntervals(
    busyBlocks.map((b) => ({ startMin: b.startMinutes, endMin: b.endMinutes })),
    dayStartMin,
    dayEndMin
  );

  const freeSlots = freeIntervals.map((iv) => ({
    startHour: minutesToDecimalHour(iv.startMin),
    endHour: minutesToDecimalHour(iv.endMin),
  }));

  const activeBusy = busyBlocks.find(
    (b) =>
      b.startMinutes <= params.evaluatedMinutes &&
      params.evaluatedMinutes < b.endMinutes
  );

  if (activeBusy) {
    // Merge contiguous busy blocks starting from activeBusy to find exact end of busy stretch
    let busyStretchEnd = activeBusy.endMinutes;
    for (const b of busyBlocks) {
      if (b.startMinutes <= busyStretchEnd && b.endMinutes > busyStretchEnd) {
        busyStretchEnd = b.endMinutes;
      }
    }

    const nextBusyAfterStretch = busyBlocks.find(
      (b) => b.startMinutes >= busyStretchEnd
    );

    const currentActivity = params.isPrivate
      ? 'Busy'
      : activeBusy.room
        ? `${activeBusy.title} ${activeBusy.room}`
        : activeBusy.title;

    const nextActivity = nextBusyAfterStretch
      ? params.isPrivate
        ? `${nextBusyAfterStretch.startTime} Busy`
        : `${nextBusyAfterStretch.startTime}${nextBusyAfterStretch.room ? ` ${nextBusyAfterStretch.room}` : ''} ${nextBusyAfterStretch.title}`
      : `Free at ${formatMinutes12h(busyStretchEnd)}`;

    return {
      status: 'busy',
      untilTime: formatMinutes12h(busyStretchEnd),
      currentActivity,
      nextActivity,
      freeSlots,
    };
  }

  const nextBusy = busyBlocks.find(
    (b) => b.startMinutes > params.evaluatedMinutes
  );

  const untilMin = nextBusy ? nextBusy.startMinutes : dayEndMin;
  const nextActivity = nextBusy
    ? params.isPrivate
      ? `${nextBusy.startTime} Busy`
      : `${nextBusy.startTime}${nextBusy.room ? ` ${nextBusy.room}` : ''} ${nextBusy.title}`
    : null;

  return {
    status: 'free',
    untilTime: formatMinutes12h(untilMin),
    currentActivity: null,
    nextActivity,
    freeSlots,
  };
}

export interface OverlapParticipantInput {
  id: string;
  isComputable: boolean;
  busyIntervals: MinuteInterval[];
}

/**
 * Exact sweep-line overlap calculator over continuous minute intervals.
 * Only members with `isComputable === true` can contribute as free;
 * missing/unavailable/restricted members prevent `isAllFree` from falsely returning true.
 */
export function computeOverlappingWindowsForDay(params: {
  dateKey: string;
  participants: OverlapParticipantInput[];
  boundStartMin: number;
  boundEndMin: number;
  minDurationMinutes: number;
}): {
  allFreeWindows: OverlappingFreeWindow[];
  partialWindows: OverlappingFreeWindow[];
  prioritizedWindows: OverlappingFreeWindow[];
  segments: TimelineBarSegment[];
} {
  const {
    dateKey,
    participants,
    boundStartMin,
    boundEndMin,
    minDurationMinutes,
  } = params;

  const totalCount = participants.length;
  if (totalCount === 0 || boundEndMin <= boundStartMin) {
    return {
      allFreeWindows: [],
      partialWindows: [],
      prioritizedWindows: [],
      segments: [],
    };
  }

  const normalizedParticipants = participants.map((p) => ({
    id: p.id,
    isComputable: p.isComputable,
    mergedBusy: mergeMinuteIntervals(
      p.busyIntervals
        .map((iv) => ({
          startMin: Math.max(boundStartMin, iv.startMin),
          endMin: Math.min(boundEndMin, iv.endMin),
        }))
        .filter((iv) => iv.endMin > iv.startMin)
    ),
  }));

  const boundarySet = new Set<number>([boundStartMin, boundEndMin]);
  for (const p of normalizedParticipants) {
    if (!p.isComputable) continue;
    for (const iv of p.mergedBusy) {
      boundarySet.add(iv.startMin);
      boundarySet.add(iv.endMin);
    }
  }

  const boundaries = Array.from(boundarySet).sort((a, b) => a - b);

  interface ElementarySlice {
    startMin: number;
    endMin: number;
    freeMemberIds: string[];
    busyMemberIds: string[];
    freeCount: number;
  }

  const slices: ElementarySlice[] = [];

  for (let i = 0; i < boundaries.length - 1; i++) {
    const startMin = boundaries[i];
    const endMin = boundaries[i + 1];
    if (endMin <= startMin) continue;

    const freeMemberIds: string[] = [];
    const busyMemberIds: string[] = [];

    for (const p of normalizedParticipants) {
      if (!p.isComputable) {
        busyMemberIds.push(p.id);
        continue;
      }
      const isBusy = p.mergedBusy.some(
        (iv) => iv.startMin < endMin && iv.endMin > startMin
      );
      if (isBusy) {
        busyMemberIds.push(p.id);
      } else {
        freeMemberIds.push(p.id);
      }
    }

    slices.push({
      startMin,
      endMin,
      freeMemberIds,
      busyMemberIds,
      freeCount: freeMemberIds.length,
    });
  }

  // Build weekly-style bar segments ('all-free' | 'some-free' | 'busy')
  const segments: TimelineBarSegment[] = [];
  for (let i = 0; i < slices.length; i++) {
    const s = slices[i];
    const status: 'all-free' | 'some-free' | 'busy' =
      s.freeCount === totalCount
        ? 'all-free'
        : s.freeCount > 0
          ? 'some-free'
          : 'busy';
    const prev = segments[segments.length - 1];
    const segStartHour = minutesToDecimalHour(s.startMin);
    const segEndHour = minutesToDecimalHour(s.endMin);
    const durationRatio = Math.round(((s.endMin - s.startMin) / 60) * 100) / 100;

    if (prev && prev.status === status) {
      prev.endHour = segEndHour;
      prev.durationRatio = Math.round((prev.durationRatio + durationRatio) * 100) / 100;
      prev.freeCount = Math.max(prev.freeCount, s.freeCount);
    } else {
      segments.push({
        id: `${dateKey}-seg-${i}`,
        startHour: segStartHour,
        endHour: segEndHour,
        durationRatio,
        status,
        freeCount: s.freeCount,
        totalCount,
      });
    }
  }

  const computableCount = normalizedParticipants.filter((p) => p.isComputable).length;

  // Build All-Free Windows (every member in the group is free)
  const allFreeRaw: Array<{
    startMin: number;
    endMin: number;
    freeMemberIds: string[];
    busyMemberIds: string[];
  }> = [];

  for (const s of slices) {
    if (s.freeCount === totalCount && totalCount > 0) {
      const prev = allFreeRaw[allFreeRaw.length - 1];
      if (prev && prev.endMin === s.startMin) {
        prev.endMin = s.endMin;
      } else {
        allFreeRaw.push({
          startMin: s.startMin,
          endMin: s.endMin,
          freeMemberIds: s.freeMemberIds,
          busyMemberIds: s.busyMemberIds,
        });
      }
    }
  }

  const allFreeWindows: OverlappingFreeWindow[] = allFreeRaw
    .filter((w) => w.endMin - w.startMin >= minDurationMinutes)
    .map((w, idx) => {
      const scored = scoreAndClassifyWindow({
        startMin: w.startMin,
        endMin: w.endMin,
        freeCount: totalCount,
        totalCount,
        isAllFree: true,
      });
      const startTime = formatMinutes12h(w.startMin);
      const endTime = formatMinutes12h(w.endMin);

      return {
        id: `all-${dateKey}-${w.startMin}-${idx}`,
        startTime,
        endTime,
        timeRange: `${startTime} – ${endTime}`,
        startHour: minutesToDecimalHour(w.startMin),
        endHour: minutesToDecimalHour(w.endMin),
        startMinutes: w.startMin,
        endMinutes: w.endMin,
        durationMinutes: w.endMin - w.startMin,
        freeCount: totalCount,
        participatingCount: computableCount,
        totalCount,
        label: `All ${totalCount} free`,
        isAllFree: true,
        freeMemberIds: w.freeMemberIds,
        busyMemberIds: w.busyMemberIds,
        priorityCategory: scored.priorityCategory,
        priorityLabel: scored.priorityLabel,
        priorityScore: scored.priorityScore,
        priorityRank: 0,
        isHighValueGap: scored.isHighValueGap,
        isRecommended: false,
      };
    });

  // Build Partial Overlap Windows (when >= 2 members are free, e.g., at least N-1 when N >= 3)
  const partialThreshold = totalCount >= 3 ? totalCount - 1 : 2;
  const partialRaw: Array<{
    startMin: number;
    endMin: number;
    freeCount: number;
    freeMemberIds: string[];
    busyMemberIds: string[];
  }> = [];

  if (totalCount >= 3) {
    for (const s of slices) {
      if (s.freeCount >= partialThreshold && s.freeCount < totalCount) {
        const prev = partialRaw[partialRaw.length - 1];
        if (
          prev &&
          prev.endMin === s.startMin &&
          prev.freeMemberIds.join(',') === s.freeMemberIds.join(',')
        ) {
          prev.endMin = s.endMin;
        } else {
          partialRaw.push({
            startMin: s.startMin,
            endMin: s.endMin,
            freeCount: s.freeCount,
            freeMemberIds: s.freeMemberIds,
            busyMemberIds: s.busyMemberIds,
          });
        }
      }
    }
  }

  const partialWindows: OverlappingFreeWindow[] = partialRaw
    .filter((w) => w.endMin - w.startMin >= minDurationMinutes)
    .map((w, idx) => {
      const scored = scoreAndClassifyWindow({
        startMin: w.startMin,
        endMin: w.endMin,
        freeCount: w.freeCount,
        totalCount,
        isAllFree: false,
      });
      const startTime = formatMinutes12h(w.startMin);
      const endTime = formatMinutes12h(w.endMin);

      return {
        id: `partial-${dateKey}-${w.startMin}-${idx}`,
        startTime,
        endTime,
        timeRange: `${startTime} – ${endTime}`,
        startHour: minutesToDecimalHour(w.startMin),
        endHour: minutesToDecimalHour(w.endMin),
        startMinutes: w.startMin,
        endMinutes: w.endMin,
        durationMinutes: w.endMin - w.startMin,
        freeCount: w.freeCount,
        participatingCount: computableCount,
        totalCount,
        label: `${w.freeCount} of ${totalCount}`,
        isAllFree: false,
        freeMemberIds: w.freeMemberIds,
        busyMemberIds: w.busyMemberIds,
        priorityCategory: scored.priorityCategory,
        priorityLabel: scored.priorityLabel,
        priorityScore: scored.priorityScore,
        priorityRank: 0,
        isHighValueGap: scored.isHighValueGap,
        isRecommended: false,
      };
    });

  const prioritizedWindows = [...allFreeWindows, ...partialWindows].sort(
    (a, b) =>
      b.priorityScore - a.priorityScore ||
      b.durationMinutes - a.durationMinutes ||
      a.startMinutes - b.startMinutes
  );

  prioritizedWindows.forEach((win, idx) => {
    win.priorityRank = idx + 1;
    win.isRecommended = idx === 0;
  });

  return {
    allFreeWindows,
    partialWindows,
    prioritizedWindows,
    segments,
  };
}

function getWeekDateKeys(anchorDateKey: string): Array<{
  dateKey: string;
  dayOfWeek: number;
  dayShort: string;
  dayNumber: string;
  rowLabel: string;
  fullLabel: string;
  isWeekend: boolean;
}> {
  const [y, m, d] = anchorDateKey.split('-').map(Number);
  const anchor = new Date(Date.UTC(y, m - 1, d));
  const dow = anchor.getUTCDay();
  const diffToMonday = dow === 0 ? -6 : 1 - dow;

  const monday = new Date(anchor);
  monday.setUTCDate(anchor.getUTCDate() + diffToMonday);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setUTCDate(monday.getUTCDate() + i);
    const curDow = cur.getUTCDay();
    const curDayNum = String(cur.getUTCDate());
    const curMonth = SHORT_MONTH_NAMES[cur.getUTCMonth()];
    const curShort = SHORT_DAY_NAMES[curDow];
    const curFull = FULL_DAY_NAMES[curDow];
    const iso = cur.toISOString().slice(0, 10);

    days.push({
      dateKey: iso,
      dayOfWeek: curDow,
      dayShort: curShort,
      dayNumber: curDayNum,
      rowLabel: `${curShort} ${curDayNum}`,
      fullLabel: `${curFull}, ${curMonth} ${curDayNum}`,
      isWeekend: curDow === 0 || curDow === 6,
    });
  }
  return days;
}

/**
 * [BE-08] Availability & Overlap Engine Service
 */
export class AvailabilityService {
  /**
   * Validates that a requested friend group exists and belongs to the caller.
   */
  private static async assertOwnedGroupIfSpecified(
    client: TypedSupabaseClient,
    userId: string,
    groupId: string
  ): Promise<{ id: string; name: string } | null> {
    if (!groupId || groupId === 'all') {
      return null;
    }

    const { data: group, error } = await client
      .from('friend_groups')
      .select('id, name')
      .eq('id', groupId)
      .eq('owner_id', userId)
      .maybeSingle();

    if (error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to load friend group.',
        error.message
      );
    }

    if (!group) {
      throw new AppError(404, 'GROUP_NOT_FOUND', 'Friend group not found.');
    }

    return group;
  }

  /**
   * Fetches caller's friend groups (with member IDs) for dashboard/shared filter chips.
   */
  private static async listUserGroupSummaries(
    client: TypedSupabaseClient,
    userId: string
  ): Promise<Array<{ id: string; name: string; memberIds: string[] }>> {
    const { data: groups, error } = await client
      .from('friend_groups')
      .select('id, name')
      .eq('owner_id', userId)
      .order('name', { ascending: true });

    if (error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to load friend groups.',
        error.message
      );
    }

    if (!groups || groups.length === 0) {
      return [];
    }

    const groupIds = groups.map((g) => g.id);
    const { data: memberships } = await client
      .from('friend_group_members')
      .select('group_id, member_id')
      .in('group_id', groupIds);

    const byGroup = new Map<string, string[]>();
    for (const gId of groupIds) byGroup.set(gId, []);
    for (const m of memberships || []) {
      byGroup.get(m.group_id)?.push(m.member_id);
    }

    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      memberIds: byGroup.get(g.id) || [],
    }));
  }

  /**
   * Fetches caller's own schedules applicable on `dateKey` (recurring + date-specific).
   */
  private static async getOwnSchedulesForDate(
    client: TypedSupabaseClient,
    userId: string,
    dateKey: string,
    dayOfWeek: number
  ): Promise<{ hasAnySchedule: boolean; dayBlocks: RawScheduleBlock[] }> {
    const [{ data: dayRows, error: dayErr }, { count, error: countErr }] =
      await Promise.all([
        client
          .from('schedules')
          .select(
            'id, title, day_of_week, specific_date, start_time, end_time, room, notes, is_busy'
          )
          .eq('user_id', userId)
          .or(
            `specific_date.eq.${dateKey},and(specific_date.is.null,day_of_week.eq.${dayOfWeek})`
          )
          .order('start_time', { ascending: true }),
        client
          .from('schedules')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
      ]);

    if (dayErr || countErr) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to retrieve personal schedules.',
        dayErr?.message || countErr?.message
      );
    }

    return {
      hasAnySchedule: (count ?? 0) > 0,
      dayBlocks: (dayRows || []).map((r) => ({ ...r, is_private: false })),
    };
  }

  /**
   * Loads friends + their permission-filtered schedules for `dateKey` using the
   * PostgreSQL JOIN RPC (`get_friends_schedules_for_date`), with a resilient
   * `req.supabase` query fallback.
   */
  private static async fetchFriendsSchedulesForDate(
    client: TypedSupabaseClient,
    viewerId: string,
    dateKey: string,
    dayOfWeek: number,
    groupId: string | null,
    friendIds: string[] | null
  ): Promise<FriendScheduleBundle[]> {
    const { data: rpcRows, error: rpcError } = await client.rpc(
      'get_friends_schedules_for_date',
      {
        p_date: dateKey,
        p_group_id: groupId,
        p_friend_ids: friendIds,
      }
    );

    if (!rpcError && Array.isArray(rpcRows)) {
      return rpcRows.map((row) => {
        const displayName =
          row.full_name ||
          `${row.first_name || ''} ${row.last_name || ''}`.trim() ||
          row.username;
        const accessLevel = (row.access_level || 'restricted') as ScheduleAccessLevel;
        const rawSchedules = Array.isArray(row.schedules_json)
          ? (row.schedules_json as unknown as RawScheduleBlock[])
          : [];
        const masked = maskScheduleBlocksForAccess(rawSchedules, accessLevel);
        const privacyState = buildMemberPrivacyState({
          displayName,
          profileExists: true,
          isBlocked: accessLevel === 'blocked',
          isFriend: true,
          isOwner: false,
          scheduleVisibility: row.schedule_visibility,
          accessLevel,
          hasAnySchedule: row.has_any_schedule,
        });

        return {
          id: row.friend_id,
          fullName: displayName,
          firstName: row.first_name || '',
          lastName: row.last_name || '',
          username: row.username.startsWith('@')
            ? row.username
            : `@${row.username}`,
          avatarUrl: row.avatar_url,
          scheduleVisibility: row.schedule_visibility,
          accessLevel,
          canViewSchedule: row.can_view_schedule,
          hasAnySchedule: row.has_any_schedule,
          groupIds: row.group_ids || [],
          dayBlocks: masked,
          privacyState,
        };
      });
    }

    if (rpcError && !isRpcMissingError(rpcError)) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to execute availability engine RPC.',
        rpcError.message
      );
    }

    // Fallback query path when RPC is unavailable (e.g., before migration push or mocked unit tests)
    return this.fetchFriendsSchedulesViaQueries(
      client,
      viewerId,
      dateKey,
      dayOfWeek,
      groupId,
      friendIds
    );
  }

  private static async fetchFriendsSchedulesViaQueries(
    client: TypedSupabaseClient,
    viewerId: string,
    dateKey: string,
    dayOfWeek: number,
    groupId: string | null,
    friendIdsFilter: string[] | null
  ): Promise<FriendScheduleBundle[]> {
    const [friendshipsRes, blockedRes, groupsRes] = await Promise.all([
      client
        .from('friendships')
        .select('user_id_1, user_id_2')
        .or(`user_id_1.eq.${viewerId},user_id_2.eq.${viewerId}`),
      client
        .from('blocked_users')
        .select('blocker_id, blocked_id')
        .or(`blocker_id.eq.${viewerId},blocked_id.eq.${viewerId}`),
      client
        .from('friend_groups')
        .select('id, name')
        .eq('owner_id', viewerId),
    ]);

    if (friendshipsRes.error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to load friendships.',
        friendshipsRes.error.message
      );
    }

    const blockedSet = new Set<string>();
    for (const b of blockedRes.data || []) {
      blockedSet.add(b.blocker_id === viewerId ? b.blocked_id : b.blocker_id);
    }

    let candidateFriendIds = (friendshipsRes.data || [])
      .map((f) => (f.user_id_1 === viewerId ? f.user_id_2 : f.user_id_1))
      .filter((id) => !blockedSet.has(id));

    const ownedGroupIds = (groupsRes.data || []).map((g) => g.id);
    const friendGroupMap = new Map<string, string[]>();

    if (ownedGroupIds.length > 0) {
      const { data: memberships } = await client
        .from('friend_group_members')
        .select('group_id, member_id')
        .in('group_id', ownedGroupIds);

      for (const m of memberships || []) {
        const list = friendGroupMap.get(m.member_id) || [];
        list.push(m.group_id);
        friendGroupMap.set(m.member_id, list);
      }
    }

    if (groupId) {
      candidateFriendIds = candidateFriendIds.filter((id) =>
        (friendGroupMap.get(id) || []).includes(groupId)
      );
    }

    if (friendIdsFilter && friendIdsFilter.length > 0) {
      const filterSet = new Set(friendIdsFilter);
      candidateFriendIds = candidateFriendIds.filter((id) => filterSet.has(id));
    }

    if (candidateFriendIds.length === 0) {
      return [];
    }

    const { data: profiles, error: profilesErr } = await client
      .from('profiles')
      .select(
        'id, full_name, first_name, last_name, username, avatar_url, schedule_visibility'
      )
      .in('id', candidateFriendIds)
      .order('full_name', { ascending: true });

    if (profilesErr) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to load friend profiles.',
        profilesErr.message
      );
    }

    const accessMap = await PermissionService.resolveBatchFriendAccess(
      client,
      viewerId,
      profiles || []
    );

    const viewableFriendIds = (profiles || [])
      .filter((p) => {
        const acc = accessMap.get(p.id)?.accessLevel;
        return acc === 'full_view' || acc === 'free_only' || acc === 'busy_only';
      })
      .map((p) => p.id);

    const schedulesByFriend = new Map<string, RawScheduleBlock[]>();
    if (viewableFriendIds.length > 0) {
      const { data: schedRows, error: schedErr } = await client
        .from('schedules')
        .select(
          'id, user_id, title, day_of_week, specific_date, start_time, end_time, room, notes, is_busy'
        )
        .in('user_id', viewableFriendIds)
        .or(
          `specific_date.eq.${dateKey},and(specific_date.is.null,day_of_week.eq.${dayOfWeek})`
        )
        .order('start_time', { ascending: true });

      if (schedErr) {
        throw new AppError(
          500,
          'DATABASE_ERROR',
          'Failed to load friends schedules.',
          schedErr.message
        );
      }

      for (const s of schedRows || []) {
        const list = schedulesByFriend.get(s.user_id) || [];
        list.push(s);
        schedulesByFriend.set(s.user_id, list);
      }
    }

    return (profiles || []).map((p) => {
      const displayName =
        p.full_name ||
        `${p.first_name || ''} ${p.last_name || ''}`.trim() ||
        p.username;
      const resolved = accessMap.get(p.id) || {
        accessLevel: 'restricted' as ScheduleAccessLevel,
        hasAnySchedule: false,
      };
      const canView =
        resolved.accessLevel === 'full_view' ||
        resolved.accessLevel === 'free_only' ||
        resolved.accessLevel === 'busy_only';

      const masked = maskScheduleBlocksForAccess(
        schedulesByFriend.get(p.id) || [],
        resolved.accessLevel
      );

      const privacyState = buildMemberPrivacyState({
        displayName,
        profileExists: true,
        isBlocked: false,
        isFriend: true,
        isOwner: false,
        scheduleVisibility: p.schedule_visibility,
        accessLevel: resolved.accessLevel,
        hasAnySchedule: resolved.hasAnySchedule,
      });

      return {
        id: p.id,
        fullName: displayName,
        firstName: p.first_name || '',
        lastName: p.last_name || '',
        username: p.username.startsWith('@') ? p.username : `@${p.username}`,
        avatarUrl: p.avatar_url,
        scheduleVisibility: p.schedule_visibility,
        accessLevel: resolved.accessLevel,
        canViewSchedule: canView,
        hasAnySchedule: resolved.hasAnySchedule,
        groupIds: friendGroupMap.get(p.id) || [],
        dayBlocks: masked,
        privacyState,
      };
    });
  }

  /**
   * [BE-08] Home Dashboard Real-Time Availability Engine
   * Computes current free/occupied statuses for the caller and all connected friends
   * (filtered by groupId) plus a prioritized "Best Window Today" recommendation.
   */
  static async getDashboardAvailability(
    client: TypedSupabaseClient,
    userId: string,
    query: DashboardAvailabilityQueryInput
  ) {
    const timezone = query.timezone || DEFAULT_TIMEZONE;
    const zoned = resolveZonedDateTime(timezone, query.date, query.at);
    const activeGroup = await this.assertOwnedGroupIfSpecified(
      client,
      userId,
      query.groupId
    );

    const [ownScheduleInfo, friendBundles, groups, ownProfileRes] =
      await Promise.all([
        this.getOwnSchedulesForDate(
          client,
          userId,
          zoned.dateKey,
          zoned.dayOfWeek
        ),
        this.fetchFriendsSchedulesForDate(
          client,
          userId,
          zoned.dateKey,
          zoned.dayOfWeek,
          activeGroup ? activeGroup.id : null,
          null
        ),
        this.listUserGroupSummaries(client, userId),
        client
          .from('profiles')
          .select('id, full_name, first_name, last_name, username, avatar_url')
          .eq('id', userId)
          .maybeSingle(),
      ]);

    const ownFormattedBlocks = ownScheduleInfo.dayBlocks.map(
      formatAvailabilityBlock
    );
    const ownStatus = computeRealtimeStatus({
      blocks: ownFormattedBlocks,
      evaluatedMinutes: zoned.minutesOfDay,
      hasSchedule: ownScheduleInfo.hasAnySchedule,
      canViewSchedule: true,
      isPrivate: false,
    });

    const formattedFriends: DashboardFriendStatus[] = friendBundles.map((fb) => {
      const formattedBlocks = fb.dayBlocks.map(formatAvailabilityBlock);
      const isComputable =
        fb.privacyState.canViewSchedule &&
        !fb.privacyState.hasMissingSchedule &&
        !fb.privacyState.isUnavailable;

      const rtStatus = computeRealtimeStatus({
        blocks: formattedBlocks,
        evaluatedMinutes: zoned.minutesOfDay,
        hasSchedule: fb.hasAnySchedule,
        canViewSchedule: fb.privacyState.canViewSchedule,
        isPrivate: fb.privacyState.isPrivate,
      });

      return {
        id: fb.id,
        name: fb.fullName,
        fullName: fb.fullName,
        username: fb.username,
        initials: computeInitials(fb.firstName, fb.lastName, fb.fullName),
        avatarUrl: fb.avatarUrl,
        status: isComputable ? rtStatus.status : 'unknown',
        hasSchedule: fb.hasAnySchedule,
        untilTime: isComputable ? rtStatus.untilTime : null,
        currentActivity: isComputable ? rtStatus.currentActivity : null,
        nextActivity: isComputable ? rtStatus.nextActivity : null,
        groupIds: fb.groupIds,
        freeSlots: isComputable ? rtStatus.freeSlots : [],
        schedule: formattedBlocks,
        ...fb.privacyState,
      };
    });

    const freeFriends = formattedFriends.filter((f) => f.status === 'free');
    const busyFriends = formattedFriends.filter((f) => f.status === 'busy');
    const unknownFriends = formattedFriends.filter((f) => f.status === 'unknown');
    const restrictedCount = formattedFriends.filter(
      (f) => f.scheduleState === 'privacy-restricted'
    ).length;
    const missingCount = formattedFriends.filter(
      (f) => f.scheduleState === 'missing'
    ).length;

    // Compute "Best Window Today" across caller + computable friends in the group
    let bestWindow: BestWindowRecommendation | null = null;
    const computableFriends = formattedFriends.filter(
      (f) => f.canViewSchedule && !f.hasMissingSchedule && !f.isUnavailable
    );

    if (computableFriends.length > 0) {
      const participants: OverlapParticipantInput[] = [];
      if (ownScheduleInfo.hasAnySchedule) {
        participants.push({
          id: userId,
          isComputable: true,
          busyIntervals: ownFormattedBlocks
            .filter((b) => b.isBusy)
            .map((b) => ({ startMin: b.startMinutes, endMin: b.endMinutes })),
        });
      }
      for (const f of computableFriends) {
        participants.push({
          id: f.id,
          isComputable: true,
          busyIntervals: f.schedule
            .filter((b) => b.isBusy)
            .map((b) => ({ startMin: b.startMinutes, endMin: b.endMinutes })),
        });
      }

      const overlap = computeOverlappingWindowsForDay({
        dateKey: zoned.dateKey,
        participants,
        boundStartMin: 8 * 60,
        boundEndMin: 21 * 60,
        minDurationMinutes: 30,
      });

      const topWindow = overlap.prioritizedWindows[0];
      if (topWindow) {
        const freeFriendsInWindow = computableFriends.filter((f) =>
          topWindow.freeMemberIds.includes(f.id)
        );
        const firstFriendName =
          freeFriendsInWindow[0]?.name.split(' ')[0] || 'a friend';
        const otherCount = Math.max(0, topWindow.freeCount - 2);

        let description: string;
        if (topWindow.freeCount <= 1) {
          description = 'You are free during this window';
        } else if (topWindow.freeCount === 2) {
          description = `You and ${firstFriendName} are both free`;
        } else if (otherCount === 1) {
          description = `You, ${firstFriendName}, and 1 other are all free (${topWindow.freeCount} people)`;
        } else {
          description = `You, ${firstFriendName}, and ${otherCount} others are all free (${topWindow.freeCount} people)`;
        }

        const scored = scoreAndClassifyWindow({
          startMin: topWindow.startMinutes,
          endMin: topWindow.endMinutes,
          freeCount: topWindow.freeCount,
          totalCount: topWindow.totalCount,
          isAllFree: topWindow.isAllFree,
        });

        bestWindow = {
          timeRange: `${topWindow.timeRange} today`,
          description,
          initials: freeFriendsInWindow
            .slice(0, 4)
            .map((f) => f.initials.charAt(0).toUpperCase()),
          freeCount: topWindow.freeCount,
          totalCount: topWindow.totalCount,
          suggestedActivity: scored.suggestedActivity,
          startHour: topWindow.startHour,
          endHour: topWindow.endHour,
          durationMinutes: topWindow.durationMinutes,
          priorityCategory: topWindow.priorityCategory,
          priorityLabel: topWindow.priorityLabel,
          isHighValueGap: topWindow.isHighValueGap,
        };
      }
    }

    const ownProfile = ownProfileRes.data;
    const ownName =
      ownProfile?.full_name ||
      `${ownProfile?.first_name || ''} ${ownProfile?.last_name || ''}`.trim() ||
      ownProfile?.username ||
      'You';

    return {
      evaluatedAt: zoned.evaluatedAtIso,
      evaluatedTime: formatMinutes12h(zoned.minutesOfDay),
      date: zoned.dateKey,
      dayOfWeek: zoned.dayOfWeek,
      dayKey: zoned.dayKey,
      dayName: zoned.dayName,
      timezone,
      selectedGroup: activeGroup || { id: 'all', name: 'All Friends' },
      currentUser: {
        id: userId,
        name: ownName,
        initials: computeInitials(
          ownProfile?.first_name,
          ownProfile?.last_name,
          ownProfile?.full_name
        ),
        hasSchedule: ownScheduleInfo.hasAnySchedule,
        status: ownScheduleInfo.hasAnySchedule ? ownStatus.status : 'unknown',
        untilTime: ownStatus.untilTime,
        currentActivity: ownStatus.currentActivity,
        nextActivity: ownStatus.nextActivity,
        freeSlots: ownStatus.freeSlots,
        ...(query.includeOwnSchedule ? { schedule: ownFormattedBlocks } : {}),
      },
      summary: {
        totalFriends: formattedFriends.length,
        freeCount: freeFriends.length,
        busyCount: busyFriends.length,
        unknownCount: unknownFriends.length,
        restrictedCount,
        missingCount,
      },
      bestWindow,
      friends: formattedFriends,
      groups,
    };
  }

  private static async computeDayOverlap(
    client: TypedSupabaseClient,
    userId: string,
    query: OverlapQueryInput,
    dateKey: string,
    dayOfWeek: number,
    dayKey: string,
    dayName: string,
    activeGroup: { id: string; name: string } | null,
    explicitFriendIds: string[] | null
  ) {
    const timezone = query.timezone || DEFAULT_TIMEZONE;
    const boundStartMin = Math.round(query.startHour * 60);
    const boundEndMin = Math.round(query.endHour * 60);

    const [ownSchedule, friendBundles, extraBlockedOrNonFriends] =
      await Promise.all([
        query.includeMe
          ? this.getOwnSchedulesForDate(client, userId, dateKey, dayOfWeek)
          : Promise.resolve(null),
        this.fetchFriendsSchedulesForDate(
          client,
          userId,
          dateKey,
          dayOfWeek,
          activeGroup ? activeGroup.id : null,
          explicitFriendIds
        ),
        explicitFriendIds
          ? this.resolveUnavailableExplicitTargets(
              client,
              userId,
              explicitFriendIds
            )
          : Promise.resolve([]),
      ]);

    const foundFriendIds = new Set(friendBundles.map((fb) => fb.id));
    const extraMembers = extraBlockedOrNonFriends.filter(
      (m) => !foundFriendIds.has(m.id)
    );

    const members: SharedCalendarMemberResult[] = [];
    const participants: OverlapParticipantInput[] = [];

    if (query.includeMe && ownSchedule) {
      const ownFormatted = ownSchedule.dayBlocks.map(formatAvailabilityBlock);
      const ownState = buildMemberPrivacyState({
        displayName: 'You',
        profileExists: true,
        isBlocked: false,
        isFriend: false,
        isOwner: true,
        scheduleVisibility: 'only_me',
        accessLevel: 'owner',
        hasAnySchedule: ownSchedule.hasAnySchedule,
      });

      members.push({
        id: userId,
        name: 'You',
        initials: 'ME',
        username: '@you',
        avatarUrl: null,
        isMe: true,
        hasSchedule: ownSchedule.hasAnySchedule,
        groupIds: [],
        scheduleByDate: { [dateKey]: ownFormatted },
        ...ownState,
      });

      participants.push({
        id: userId,
        isComputable: ownSchedule.hasAnySchedule,
        busyIntervals: ownFormatted
          .filter((b) => b.isBusy)
          .map((b) => ({ startMin: b.startMinutes, endMin: b.endMinutes })),
      });
    }

    for (const fb of friendBundles) {
      const formatted = fb.dayBlocks.map(formatAvailabilityBlock);
      const isComputable =
        fb.privacyState.canViewSchedule &&
        !fb.privacyState.hasMissingSchedule &&
        !fb.privacyState.isUnavailable;

      members.push({
        id: fb.id,
        name: fb.fullName,
        initials: computeInitials(fb.firstName, fb.lastName, fb.fullName),
        username: fb.username,
        avatarUrl: fb.avatarUrl,
        isMe: false,
        hasSchedule: fb.hasAnySchedule,
        groupIds: fb.groupIds,
        scheduleByDate: { [dateKey]: formatted },
        ...fb.privacyState,
      });

      participants.push({
        id: fb.id,
        isComputable,
        busyIntervals: isComputable
          ? formatted
              .filter((b) => b.isBusy)
              .map((b) => ({
                startMin: b.startMinutes,
                endMin: b.endMinutes,
              }))
          : [],
      });
    }

    for (const em of extraMembers) {
      members.push(em);
      participants.push({
        id: em.id,
        isComputable: false,
        busyIntervals: [],
      });
    }

    const overlap = computeOverlappingWindowsForDay({
      dateKey,
      participants,
      boundStartMin,
      boundEndMin,
      minDurationMinutes: query.minDurationMinutes,
    });

    return {
      mode: 'day' as const,
      date: dateKey,
      dayOfWeek,
      dayKey,
      dayName,
      timezone,
      selectedGroup: activeGroup || { id: 'all', name: 'All Friends' },
      groupSummary: buildGroupSummary(members),
      members,
      allFreeWindows: overlap.allFreeWindows,
      partialWindows: overlap.partialWindows,
      prioritizedWindows: overlap.prioritizedWindows,
      recommendedWindow: overlap.prioritizedWindows[0] || null,
      segments: overlap.segments,
    };
  }

  /**
   * [BE-08] Shared Calendar Overlapping Free Windows Engine
   * Supports daily (`mode=day`) and 7-day Monday–Sunday weekly (`mode=week`) overlap
   * calculations, prioritizing high-value Lunch and Dismissal gaps while surfacing
   * clean `[BE-09]` restricted, missing, and unavailable member states.
   */
  static async getOverlappingWindows(
    client: TypedSupabaseClient,
    userId: string,
    query: OverlapQueryInput
  ) {
    const timezone = query.timezone || DEFAULT_TIMEZONE;
    const zoned = resolveZonedDateTime(timezone, query.date, null);
    const activeGroup = await this.assertOwnedGroupIfSpecified(
      client,
      userId,
      query.groupId
    );

    const explicitFriendIds = query.friendIds
      ? query.friendIds.filter((id) => id !== userId)
      : null;

    if (query.mode === 'day') {
      return this.computeDayOverlap(
        client,
        userId,
        query,
        zoned.dateKey,
        zoned.dayOfWeek,
        zoned.dayKey,
        zoned.dayName,
        activeGroup,
        explicitFriendIds
      );
    }

    // Weekly Mode (Monday–Sunday)
    const weekDays = getWeekDateKeys(zoned.dateKey);
    const dayResults = await Promise.all(
      weekDays.map((day) =>
        this.computeDayOverlap(
          client,
          userId,
          query,
          day.dateKey,
          day.dayOfWeek,
          dayOfWeekToDayKey(day.dayOfWeek) || 'sun',
          day.dayShort,
          activeGroup,
          explicitFriendIds
        )
      )
    );

    const memberMap = new Map<string, SharedCalendarMemberResult>();
    const rows = weekDays.map((day, idx) => {
      const res = dayResults[idx];
      for (const m of res.members) {
        const existing = memberMap.get(m.id);
        if (existing) {
          existing.scheduleByDate[day.dateKey] = m.scheduleByDate[day.dateKey] || [];
        } else {
          memberMap.set(m.id, {
            ...m,
            scheduleByDate: { [day.dateKey]: m.scheduleByDate[day.dateKey] || [] },
          });
        }
      }

      const windowCount = res.allFreeWindows.length;
      const windowLabel =
        windowCount === 0
          ? 'No overlap'
          : windowCount === 1
            ? '1 window'
            : `${windowCount} windows`;

      return {
        day: {
          ...day,
          isToday: day.dateKey === zoned.dateKey,
        },
        windowCount,
        windowLabel,
        hasOverlap: windowCount > 0,
        segments: res.segments,
        allFreeWindows: res.allFreeWindows,
        partialWindows: res.partialWindows,
        prioritizedWindows: res.prioritizedWindows,
        recommendedWindow: res.recommendedWindow,
      };
    });

    const members = Array.from(memberMap.values());
    const totalWeekWindows = rows.reduce((sum, r) => sum + r.windowCount, 0);

    const allWeekPrioritized = rows
      .flatMap((r) =>
        r.prioritizedWindows.map((w) => ({
          date: r.day.dateKey,
          dayLabel: r.day.fullLabel,
          ...w,
        }))
      )
      .sort(
        (a, b) =>
          b.priorityScore - a.priorityScore ||
          b.durationMinutes - a.durationMinutes
      );

    return {
      mode: 'week' as const,
      anchorDate: zoned.dateKey,
      weekRange: {
        startDate: weekDays[0].dateKey,
        endDate: weekDays[6].dateKey,
      },
      timezone,
      selectedGroup: activeGroup || { id: 'all', name: 'All Friends' },
      groupSummary: buildGroupSummary(members),
      totalWeekWindows,
      bestWindowOfWeek: allWeekPrioritized[0] || null,
      members,
      days: rows,
    };
  }

  /**
   * Resolves explicit `friendIds` that did not appear in `fetchFriendsSchedulesForDate`
   * (due to block list, non-friend status, or missing profile) into clean unavailable/restricted states.
   */
  private static async resolveUnavailableExplicitTargets(
    client: TypedSupabaseClient,
    viewerId: string,
    targetIds: string[]
  ): Promise<SharedCalendarMemberResult[]> {
    if (targetIds.length === 0) return [];
    const results: SharedCalendarMemberResult[] = [];

    for (const targetId of targetIds) {
      const decision = await PermissionService.evaluateScheduleAccess(
        client,
        viewerId,
        targetId
      );
      if (!decision.isFriend || decision.isBlocked || !decision.profileExists) {
        results.push({
          id: targetId,
          name: 'Unavailable User',
          initials: '?',
          username: '@unavailable',
          avatarUrl: null,
          isMe: false,
          hasSchedule: false,
          groupIds: [],
          scheduleByDate: {},
          scheduleState: decision.scheduleState,
          accessLevel: decision.accessLevel,
          canViewSchedule: false,
          isPrivate: decision.isPrivate,
          hasMissingSchedule: false,
          isUnavailable: decision.isUnavailable,
          reason: decision.reason,
          privacyNotice: decision.privacyNotice,
          privacyNoticeSub: decision.privacyNoticeSub,
        });
      }
    }
    return results;
  }

  /**
   * [BE-08] + [BE-09] Single Friend Availability & Mutual Free Windows
   * Enforces block-list and friendship checks, masks restricted titles/rooms,
   * and returns clean restricted or missing states.
   */
  static async getFriendAvailability(
    client: TypedSupabaseClient,
    viewerId: string,
    friendId: string,
    query: FriendAvailabilityQueryInput
  ) {
    const decision = await PermissionService.assertCanAccessFriendResource(
      client,
      viewerId,
      friendId
    );

    const timezone = query.timezone || DEFAULT_TIMEZONE;
    const zoned = resolveZonedDateTime(timezone, query.date, query.at);

    const { data: profile, error: profErr } = await client
      .from('profiles')
      .select(
        'id, full_name, first_name, last_name, username, avatar_url, schedule_visibility'
      )
      .eq('id', friendId)
      .maybeSingle();

    if (profErr) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to retrieve friend profile.',
        profErr.message
      );
    }

    if (!profile) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Friend profile not found.');
    }

    const displayName =
      profile.full_name ||
      `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
      profile.username;

    const privacyState = buildMemberPrivacyState({
      displayName,
      profileExists: true,
      isBlocked: decision.isBlocked,
      isFriend: decision.isFriend,
      isOwner: decision.isOwner,
      scheduleVisibility: profile.schedule_visibility,
      accessLevel: decision.accessLevel,
      hasAnySchedule: decision.hasAnySchedule,
    });

    const targetDates =
      query.mode === 'week'
        ? getWeekDateKeys(zoned.dateKey).map((d) => ({
            dateKey: d.dateKey,
            dayOfWeek: d.dayOfWeek,
            dayKey: dayOfWeekToDayKey(d.dayOfWeek),
            dayName: dayOfWeekToName(d.dayOfWeek),
          }))
        : [
            {
              dateKey: zoned.dateKey,
              dayOfWeek: zoned.dayOfWeek,
              dayKey: zoned.dayKey,
              dayName: zoned.dayName,
            },
          ];

    let allSchedRows: RawScheduleBlock[] = [];
    if (privacyState.canViewSchedule && decision.hasAnySchedule) {
      const { data: rows, error: schedErr } = await client
        .from('schedules')
        .select(
          'id, title, day_of_week, specific_date, start_time, end_time, room, notes, is_busy'
        )
        .eq('user_id', friendId)
        .order('start_time', { ascending: true });

      if (schedErr) {
        throw new AppError(
          500,
          'DATABASE_ERROR',
          'Failed to fetch friend schedule.',
          schedErr.message
        );
      }
      allSchedRows = maskScheduleBlocksForAccess(
        rows || [],
        decision.accessLevel
      );
    }

    const scheduleByDate: Record<string, FormattedAvailabilityBlock[]> = {};
    for (const d of targetDates) {
      const matching = allSchedRows
        .filter(
          (r) =>
            r.specific_date === d.dateKey ||
            (r.specific_date === null && r.day_of_week === d.dayOfWeek)
        )
        .map(formatAvailabilityBlock);
      scheduleByDate[d.dateKey] = matching;
    }

    const todayBlocks = scheduleByDate[zoned.dateKey] || [];
    const isComputable =
      privacyState.canViewSchedule &&
      !privacyState.hasMissingSchedule &&
      !privacyState.isUnavailable;

    const realtime = computeRealtimeStatus({
      blocks: todayBlocks,
      evaluatedMinutes: zoned.minutesOfDay,
      hasSchedule: decision.hasAnySchedule,
      canViewSchedule: privacyState.canViewSchedule,
      isPrivate: privacyState.isPrivate,
    });

    // Calculate mutual free windows with caller for target day when computable
    let mutualFreeWindows: OverlappingFreeWindow[] = [];
    if (isComputable && !decision.isOwner) {
      const ownSched = await this.getOwnSchedulesForDate(
        client,
        viewerId,
        zoned.dateKey,
        zoned.dayOfWeek
      );
      if (ownSched.hasAnySchedule) {
        const ownFormatted = ownSched.dayBlocks.map(formatAvailabilityBlock);
        const overlap = computeOverlappingWindowsForDay({
          dateKey: zoned.dateKey,
          participants: [
            {
              id: viewerId,
              isComputable: true,
              busyIntervals: ownFormatted
                .filter((b) => b.isBusy)
                .map((b) => ({ startMin: b.startMinutes, endMin: b.endMinutes })),
            },
            {
              id: friendId,
              isComputable: true,
              busyIntervals: todayBlocks
                .filter((b) => b.isBusy)
                .map((b) => ({ startMin: b.startMinutes, endMin: b.endMinutes })),
            },
          ],
          boundStartMin: 8 * 60,
          boundEndMin: 21 * 60,
          minDurationMinutes: 30,
        });
        mutualFreeWindows = overlap.prioritizedWindows;
      }
    }

    return {
      date: zoned.dateKey,
      mode: query.mode,
      timezone,
      friend: {
        id: profile.id,
        name: displayName,
        fullName: displayName,
        username: profile.username.startsWith('@')
          ? profile.username
          : `@${profile.username}`,
        initials: computeInitials(
          profile.first_name,
          profile.last_name,
          profile.full_name
        ),
        avatarUrl: profile.avatar_url,
        status: isComputable ? realtime.status : 'unknown',
        hasSchedule: decision.hasAnySchedule,
        untilTime: isComputable ? realtime.untilTime : null,
        currentActivity: isComputable ? realtime.currentActivity : null,
        nextActivity: isComputable ? realtime.nextActivity : null,
        freeSlots: isComputable ? realtime.freeSlots : [],
        schedule: todayBlocks,
        scheduleByDate,
        ...privacyState,
      },
      mutualFreeWindows,
    };
  }
}

function buildGroupSummary(members: SharedCalendarMemberResult[]) {
  const nonSelfMembers = members.filter((m) => !m.isMe);
  const targetList = nonSelfMembers.length > 0 ? nonSelfMembers : members;
  const availableCount = targetList.filter(
    (m) => m.scheduleState === 'available'
  ).length;
  const restrictedCount = targetList.filter(
    (m) => m.scheduleState === 'privacy-restricted'
  ).length;
  const missingCount = targetList.filter(
    (m) => m.scheduleState === 'missing'
  ).length;
  const unavailableCount = targetList.filter(
    (m) => m.scheduleState === 'unavailable'
  ).length;

  const totalMembers = members.length;
  const blockedOrUnusable = missingCount + unavailableCount;

  let statusSummary = `${totalMembers} ${totalMembers === 1 ? 'person' : 'people'}`;
  if (totalMembers === 0) {
    statusSummary = '0 people · Empty group';
  } else if (blockedOrUnusable === 0 && restrictedCount === 0) {
    statusSummary = `${totalMembers} ${totalMembers === 1 ? 'person' : 'people'} · All schedules available`;
  } else {
    const parts: string[] = [];
    if (missingCount > 0) parts.push(`${missingCount} missing`);
    if (unavailableCount > 0) parts.push(`${unavailableCount} unavailable`);
    if (restrictedCount > 0) parts.push(`${restrictedCount} limited`);
    statusSummary = `${totalMembers} ${totalMembers === 1 ? 'person' : 'people'} · ${parts.join(' · ')}`;
  }

  return {
    totalMembers,
    availableCount,
    restrictedCount,
    missingCount,
    unavailableCount,
    statusSummary,
  };
}
