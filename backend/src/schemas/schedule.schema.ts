import { z } from 'zod';

export const DAY_KEYS = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
] as const;

export type DayKey = (typeof DAY_KEYS)[number];

const DAY_KEY_MAP: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thursday: 4,
  thurs: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

const DAY_OF_WEEK_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/**
 * Converts day string ('mon', 'monday', etc.) or integer into canonical 0-6 day of week.
 */
export function resolveDayOfWeek(
  val?: number | string | null
): number | null {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number') {
    return val >= 0 && val <= 6 ? Math.floor(val) : null;
  }
  const clean = val.toLowerCase().trim();
  if (/^[0-6]$/.test(clean)) {
    return parseInt(clean, 10);
  }
  return DAY_KEY_MAP[clean] !== undefined ? DAY_KEY_MAP[clean] : null;
}

/**
 * Converts 0-6 day of week integer into short day key ('sun'..'sat').
 */
export function dayOfWeekToDayKey(dow?: number | null): DayKey | null {
  if (dow === undefined || dow === null || dow < 0 || dow > 6) return null;
  return DAY_KEYS[dow] || null;
}

/**
 * Returns full day name (e.g., 'Monday').
 */
export function dayOfWeekToName(dow?: number | null): string | null {
  if (dow === undefined || dow === null || dow < 0 || dow > 6) return null;
  return DAY_OF_WEEK_NAMES[dow] || null;
}

/**
 * Parses time formats ('8:00 AM', '12:30 PM', '14:00', '08:00:00') into total minutes from midnight.
 * Returns -1 if invalid.
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') return -1;
  const raw = timeStr.trim().toUpperCase();

  // 12-hour format with AM / PM: e.g. "8:00 AM", "12:30PM", "7:45 AM"
  const match12 = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const modifier = match12[4];

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return -1;
    if (modifier === 'AM' && hours === 12) hours = 0;
    if (modifier === 'PM' && hours < 12) hours += 12;

    return hours * 60 + minutes;
  }

  // 24-hour format: e.g. "08:00", "14:30", "18:00:00"
  const match24 = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return -1;
    return hours * 60 + minutes;
  }

  return -1;
}

/**
 * Normalizes any valid time string into canonical PostgreSQL TIME format 'HH:MM:SS'.
 */
export function normalizeTimeToSql(timeStr: string): string {
  const totalMinutes = parseTimeToMinutes(timeStr);
  if (totalMinutes < 0) {
    throw new Error(`Invalid time string: ${timeStr}`);
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:00`;
}

/**
 * Formats canonical TIME 'HH:MM:SS' or 'HH:MM' into standard display 12-hour format '8:00 AM'.
 */
export function formatTime12h(timeStr: string): string {
  const totalMinutes = parseTimeToMinutes(timeStr);
  if (totalMinutes < 0) return timeStr;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const modifier = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${modifier}`;
}

/**
 * Normalizes user date strings (YYYY-MM-DD, DD/MM/YYYY, '24 / 10 / 2026') into 'YYYY-MM-DD'.
 */
export function normalizeDateToSql(dateStr?: string | null): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const raw = dateStr.trim();

  // ISO standard: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(`${raw}T00:00:00Z`);
    if (!isNaN(d.getTime())) return raw;
  }

  // DD / MM / YYYY or DD/MM/YYYY
  const slashMatch = raw.match(/^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})$/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    const year = slashMatch[3];
    const iso = `${year}-${month}-${day}`;
    const d = new Date(`${iso}T00:00:00Z`);
    if (!isNaN(d.getTime())) return iso;
  }

  return null;
}

const timeStringSchema = z
  .string()
  .trim()
  .refine(
    (val) => parseTimeToMinutes(val) >= 0,
    {
      message:
        'Time must be a valid 24-hr (e.g. "08:00") or 12-hr format (e.g. "8:00 AM").',
    }
  );

export const createScheduleSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Activity/class title is required.')
      .max(150, 'Title cannot exceed 150 characters.'),
    startTime: timeStringSchema,
    endTime: timeStringSchema,
    dayOfWeek: z
      .union([
        z.number().int().min(0).max(6),
        z.enum(DAY_KEYS),
        z.enum(['0', '1', '2', '3', '4', '5', '6']),
      ])
      .optional()
      .nullable(),
    dayKey: z.enum(DAY_KEYS).optional().nullable(),
    specificDate: z.string().trim().optional().nullable(),
    room: z.string().trim().max(100, 'Room cannot exceed 100 characters.').optional().nullable(),
    notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters.').optional().nullable(),
    isBusy: z.boolean().default(true),
    source: z.enum(['manual', 'ocr']).default('manual'),
  })
  .refine(
    (data) => {
      const startMin = parseTimeToMinutes(data.startTime);
      const endMin = parseTimeToMinutes(data.endTime);
      return startMin >= 0 && endMin >= 0 && endMin > startMin;
    },
    {
      message:
        'End time must be after start time. Overlapping, equal, or reverse time ranges are not allowed.',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      const resolvedDow =
        data.dayOfWeek !== undefined && data.dayOfWeek !== null
          ? resolveDayOfWeek(data.dayOfWeek)
          : data.dayKey
            ? resolveDayOfWeek(data.dayKey)
            : null;

      const resolvedDate = normalizeDateToSql(data.specificDate);

      return resolvedDow !== null || resolvedDate !== null;
    },
    {
      message:
        'Either dayOfWeek (for recurring weekly entries) or specificDate (for date-specific entries) must be provided.',
      path: ['dayOfWeek'],
    }
  )
  .refine(
    (data) => {
      if (data.specificDate) {
        return normalizeDateToSql(data.specificDate) !== null;
      }
      return true;
    },
    {
      message:
        'specificDate must be a valid calendar date in YYYY-MM-DD or DD/MM/YYYY format.',
      path: ['specificDate'],
    }
  );

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;

export const updateScheduleSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Activity/class title cannot be empty.')
      .max(150, 'Title cannot exceed 150 characters.')
      .optional(),
    startTime: timeStringSchema.optional(),
    endTime: timeStringSchema.optional(),
    dayOfWeek: z
      .union([
        z.number().int().min(0).max(6),
        z.enum(DAY_KEYS),
        z.enum(['0', '1', '2', '3', '4', '5', '6']),
      ])
      .optional()
      .nullable(),
    dayKey: z.enum(DAY_KEYS).optional().nullable(),
    specificDate: z.string().trim().optional().nullable(),
    room: z.string().trim().max(100, 'Room cannot exceed 100 characters.').optional().nullable(),
    notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters.').optional().nullable(),
    isBusy: z.boolean().optional(),
    source: z.enum(['manual', 'ocr']).optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const startMin = parseTimeToMinutes(data.startTime);
        const endMin = parseTimeToMinutes(data.endTime);
        return endMin > startMin;
      }
      return true;
    },
    {
      message: 'End time must be after start time.',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      if (data.specificDate !== undefined && data.specificDate !== null) {
        return normalizeDateToSql(data.specificDate) !== null;
      }
      return true;
    },
    {
      message:
        'specificDate must be a valid calendar date in YYYY-MM-DD or DD/MM/YYYY format.',
      path: ['specificDate'],
    }
  );

export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

export const scheduleQuerySchema = z.object({
  type: z.enum(['all', 'recurring', 'date_specific']).default('all'),
  dayOfWeek: z
    .union([
      z.string().regex(/^[0-6]$/),
      z.enum(DAY_KEYS),
    ])
    .optional(),
  dayKey: z.enum(DAY_KEYS).optional(),
  specificDate: z.string().trim().optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  isBusy: z
    .preprocess(
      (val) => (val === 'true' ? true : val === 'false' ? false : val),
      z.boolean().optional()
    ),
});

export type ScheduleQueryInput = z.infer<typeof scheduleQuerySchema>;

export const scheduleIdParamsSchema = z.object({
  id: z.string().uuid('Schedule ID must be a valid UUID.'),
});

export type ScheduleIdParams = z.infer<typeof scheduleIdParamsSchema>;
