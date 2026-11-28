import { z } from 'zod';
import {
  DAY_KEYS,
  DayKey,
  dayOfWeekToDayKey,
  dayOfWeekToName,
  formatTime12h,
  normalizeDateToSql,
  parseTimeToMinutes,
} from './schedule.schema';

export const DEFAULT_TIMEZONE = 'Asia/Manila';

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return uuidRegex.test(value.trim());
}

export function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolves the local date ('YYYY-MM-DD'), day of week (0=Sun..6=Sat), and minutes
 * since midnight (0..1439) for a given Date/ISO string in the specified IANA timezone.
 */
export function resolveZonedDateTime(
  timezone: string = DEFAULT_TIMEZONE,
  dateOverride?: string | null,
  atOverride?: string | null
): {
  dateKey: string;
  dayOfWeek: number;
  dayKey: DayKey;
  dayName: string;
  minutesOfDay: number;
  evaluatedAtIso: string;
} {
  let baseDate = new Date();
  let explicitMinutes: number | null = null;

  if (atOverride) {
    const trimmedAt = atOverride.trim();
    const parsedTimeOnly = parseTimeToMinutes(trimmedAt);
    if (parsedTimeOnly >= 0) {
      explicitMinutes = parsedTimeOnly;
    } else {
      const parsedInstant = new Date(trimmedAt);
      if (!isNaN(parsedInstant.getTime())) {
        baseDate = parsedInstant;
      }
    }
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(baseDate);
  const partMap = new Map<string, string>();
  for (const part of parts) {
    partMap.set(part.type, part.value);
  }

  const zonedDateKey = `${partMap.get('year')}-${partMap.get('month')}-${partMap.get('day')}`;
  const rawHour = Number(partMap.get('hour') ?? '0');
  const zonedHour = rawHour === 24 ? 0 : rawHour;
  const zonedMinute = Number(partMap.get('minute') ?? '0');

  const finalDateKey = dateOverride
    ? normalizeDateToSql(dateOverride) ?? zonedDateKey
    : zonedDateKey;

  const finalMinutes =
    explicitMinutes !== null ? explicitMinutes : zonedHour * 60 + zonedMinute;

  const [yearNum, monthNum, dayNum] = finalDateKey.split('-').map(Number);
  const utcDate = new Date(Date.UTC(yearNum, monthNum - 1, dayNum));
  const dayOfWeek = utcDate.getUTCDay();

  return {
    dateKey: finalDateKey,
    dayOfWeek,
    dayKey: dayOfWeekToDayKey(dayOfWeek) || DAY_KEYS[0],
    dayName: dayOfWeekToName(dayOfWeek) || 'Sunday',
    minutesOfDay: finalMinutes,
    evaluatedAtIso: baseDate.toISOString(),
  };
}

/**
 * Formats minutes since midnight (0..1440) to 12-hour display string (e.g., "11:30 AM").
 */
export function formatMinutes12h(minutes: number): string {
  const clamped = Math.max(0, Math.min(1440, Math.round(minutes)));
  if (clamped === 1440) {
    return '12:00 AM';
  }
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return formatTime12h(
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
  );
}

/**
 * Formats decimal hour (e.g., 13.5) cleanly to 2 decimal places.
 */
export function minutesToDecimalHour(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100;
}

const groupIdSchema = z
  .string()
  .trim()
  .default('all')
  .refine((val) => val === 'all' || isValidUuid(val), {
    message: 'groupId must be "all" or a valid group UUID.',
  });

const timezoneSchema = z
  .string()
  .trim()
  .default(DEFAULT_TIMEZONE)
  .refine((val) => isValidTimezone(val), {
    message: 'timezone must be a valid IANA timezone (e.g., "Asia/Manila").',
  });

const optionalDateSchema = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || normalizeDateToSql(val) !== null, {
    message: 'date must be a valid calendar date in YYYY-MM-DD or DD/MM/YYYY format.',
  });

const optionalAtSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => {
      if (!val) return true;
      if (parseTimeToMinutes(val) >= 0) return true;
      return !isNaN(new Date(val).getTime());
    },
    {
      message:
        'at must be a valid ISO timestamp or time string (e.g., "12:15 PM" or "14:30").',
    }
  );

const booleanQuerySchema = z.preprocess((val) => {
  if (val === 'true' || val === true) return true;
  if (val === 'false' || val === false) return false;
  return val;
}, z.boolean());

export const dashboardAvailabilityQuerySchema = z.object({
  groupId: groupIdSchema,
  date: optionalDateSchema,
  at: optionalAtSchema,
  timezone: timezoneSchema,
  includeOwnSchedule: booleanQuerySchema.default(true),
});

export type DashboardAvailabilityQueryInput = z.infer<
  typeof dashboardAvailabilityQuerySchema
>;

export const overlapQuerySchema = z
  .object({
    date: optionalDateSchema,
    mode: z.enum(['day', 'week']).default('day'),
    groupId: groupIdSchema,
    friendIds: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const rawList = Array.isArray(val) ? val : val.split(',');
        const cleaned = rawList.map((s) => s.trim()).filter(Boolean);
        return cleaned.length > 0 ? Array.from(new Set(cleaned)) : undefined;
      })
      .refine(
        (ids) => !ids || ids.every((id) => isValidUuid(id)),
        { message: 'friendIds must contain valid UUIDs.' }
      ),
    includeMe: booleanQuerySchema.default(true),
    minDurationMinutes: z.coerce
      .number()
      .int()
      .min(15, 'minDurationMinutes must be at least 15 minutes.')
      .max(720, 'minDurationMinutes cannot exceed 720 minutes.')
      .default(30),
    startHour: z.coerce
      .number()
      .min(0, 'startHour must be between 0 and 23.')
      .max(23, 'startHour must be between 0 and 23.')
      .default(8),
    endHour: z.coerce
      .number()
      .min(1, 'endHour must be between 1 and 24.')
      .max(24, 'endHour must be between 1 and 24.')
      .default(21),
    timezone: timezoneSchema,
  })
  .refine((data) => data.endHour > data.startHour, {
    message: 'endHour must be greater than startHour.',
    path: ['endHour'],
  });

export type OverlapQueryInput = z.infer<typeof overlapQuerySchema>;

export const friendAvailabilityParamsSchema = z.object({
  friendId: z.string().uuid('friendId must be a valid UUID.'),
});

export type FriendAvailabilityParams = z.infer<
  typeof friendAvailabilityParamsSchema
>;

export const friendAvailabilityQuerySchema = z.object({
  date: optionalDateSchema,
  mode: z.enum(['day', 'week']).default('day'),
  at: optionalAtSchema,
  timezone: timezoneSchema,
});

export type FriendAvailabilityQueryInput = z.infer<
  typeof friendAvailabilityQuerySchema
>;

export const permissionCheckParamsSchema = z.object({
  targetUserId: z.string().uuid('targetUserId must be a valid UUID.'),
});

export type PermissionCheckParams = z.infer<typeof permissionCheckParamsSchema>;
