import { TypedSupabaseClient } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import {
  CreateScheduleInput,
  DayKey,
  dayOfWeekToDayKey,
  dayOfWeekToName,
  formatTime12h,
  normalizeDateToSql,
  normalizeTimeToSql,
  parseTimeToMinutes,
  resolveDayOfWeek,
  ScheduleQueryInput,
  UpdateScheduleInput,
} from '../schemas/schedule.schema';
import { Database } from '../types/database.types';

type ScheduleRow = Database['public']['Tables']['schedules']['Row'];
type ScheduleInsert = Database['public']['Tables']['schedules']['Insert'];
type ScheduleUpdate = Database['public']['Tables']['schedules']['Update'];

export interface ScheduleItemResponse {
  id: string;
  userId: string;
  title: string;
  isBusy: boolean;
  dayOfWeek: number | null;
  dayKey: DayKey | null;
  dayName: string | null;
  specificDate: string | null;
  isRecurring: boolean;
  startTime: string;
  endTime: string;
  startTime12h: string;
  endTime12h: string;
  timeRange: string;
  room: string | null;
  notes: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transforms a raw PostgreSQL schedules row into a frontend-ready response model.
 */
export function formatScheduleRow(row: ScheduleRow): ScheduleItemResponse {
  const start12 = formatTime12h(row.start_time);
  const end12 = formatTime12h(row.end_time);
  const dow = row.day_of_week;

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    isBusy: row.is_busy,
    dayOfWeek: dow,
    dayKey: dayOfWeekToDayKey(dow),
    dayName: dayOfWeekToName(dow),
    specificDate: row.specific_date,
    isRecurring: row.specific_date === null && dow !== null,
    startTime: row.start_time,
    endTime: row.end_time,
    startTime12h: start12,
    endTime12h: end12,
    timeRange: `${start12} - ${end12}`,
    room: row.room,
    notes: row.notes,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class ScheduleService {
  /**
   * Retrieves all schedules for the authenticated user matching optional filter criteria.
   */
  static async listSchedules(
    supabase: TypedSupabaseClient,
    userId: string,
    query: ScheduleQueryInput = { type: 'all' }
  ): Promise<ScheduleItemResponse[]> {
    let builder = supabase
      .from('schedules')
      .select('*')
      .eq('user_id', userId);

    // Filter by type (recurring vs date-specific)
    if (query.type === 'recurring') {
      builder = builder.is('specific_date', null);
    } else if (query.type === 'date_specific') {
      builder = builder.not('specific_date', 'is', null);
    }

    // Filter by day of week
    const targetDow =
      query.dayOfWeek !== undefined
        ? resolveDayOfWeek(query.dayOfWeek)
        : query.dayKey
          ? resolveDayOfWeek(query.dayKey)
          : null;

    if (targetDow !== null) {
      builder = builder.eq('day_of_week', targetDow);
    }

    // Filter by specific date
    if (query.specificDate) {
      const normalizedDate = normalizeDateToSql(query.specificDate);
      if (normalizedDate) {
        builder = builder.eq('specific_date', normalizedDate);
      }
    }

    // Filter by date range (for date-specific items)
    if (query.startDate) {
      const normalizedStart = normalizeDateToSql(query.startDate);
      if (normalizedStart) {
        builder = builder.gte('specific_date', normalizedStart);
      }
    }

    if (query.endDate) {
      const normalizedEnd = normalizeDateToSql(query.endDate);
      if (normalizedEnd) {
        builder = builder.lte('specific_date', normalizedEnd);
      }
    }

    // Filter by busy/free status
    if (query.isBusy !== undefined) {
      builder = builder.eq('is_busy', query.isBusy);
    }

    // Order by day of week, then specific date, then start time
    builder = builder
      .order('day_of_week', { ascending: true, nullsFirst: false })
      .order('specific_date', { ascending: true, nullsFirst: false })
      .order('start_time', { ascending: true });

    const { data, error } = await builder;

    if (error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to fetch personal schedules.',
        error.message
      );
    }

    return (data || []).map(formatScheduleRow);
  }

  /**
   * Retrieves a single schedule entry by ID, verifying user ownership.
   */
  static async getScheduleById(
    supabase: TypedSupabaseClient,
    userId: string,
    scheduleId: string
  ): Promise<ScheduleItemResponse> {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', scheduleId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to retrieve schedule entry.',
        error.message
      );
    }

    if (!data) {
      throw new AppError(
        404,
        'SCHEDULE_NOT_FOUND',
        'Schedule entry does not exist or does not belong to you.'
      );
    }

    return formatScheduleRow(data);
  }

  /**
   * Creates a new personal schedule entry with strict server-side validation.
   */
  static async createSchedule(
    supabase: TypedSupabaseClient,
    userId: string,
    payload: CreateScheduleInput
  ): Promise<ScheduleItemResponse> {
    // 1. Validate & normalize times
    const startMinutes = parseTimeToMinutes(payload.startTime);
    const endMinutes = parseTimeToMinutes(payload.endTime);

    if (startMinutes < 0 || endMinutes < 0) {
      throw new AppError(
        400,
        'INVALID_TIME_FORMAT',
        'Malformed time format. Expected 24-hr ("08:00") or 12-hr ("8:00 AM") time.'
      );
    }

    if (endMinutes <= startMinutes) {
      throw new AppError(
        400,
        'INVALID_TIME_RANGE',
        'End time must be strictly after start time.'
      );
    }

    const startTimeSql = normalizeTimeToSql(payload.startTime);
    const endTimeSql = normalizeTimeToSql(payload.endTime);

    // 2. Resolve recurring weekly vs. date-specific entry
    let dayOfWeek =
      payload.dayOfWeek !== undefined && payload.dayOfWeek !== null
        ? resolveDayOfWeek(payload.dayOfWeek)
        : payload.dayKey
          ? resolveDayOfWeek(payload.dayKey)
          : null;

    let specificDate = normalizeDateToSql(payload.specificDate);

    // Auto-derive day of week from specific date if dayOfWeek was omitted
    if (specificDate && dayOfWeek === null) {
      const parsedUtc = new Date(`${specificDate}T00:00:00Z`);
      if (!isNaN(parsedUtc.getTime())) {
        dayOfWeek = parsedUtc.getUTCDay();
      }
    }

    if (dayOfWeek === null && specificDate === null) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'Either dayOfWeek (for recurring entries) or specificDate (for date-specific entries) must be provided.'
      );
    }

    // 3. Assemble insert payload
    const insertData: ScheduleInsert = {
      user_id: userId,
      title: payload.title.trim(),
      start_time: startTimeSql,
      end_time: endTimeSql,
      day_of_week: dayOfWeek,
      specific_date: specificDate,
      room: payload.room ? payload.room.trim() : null,
      notes: payload.notes ? payload.notes.trim() : null,
      is_busy: payload.isBusy !== undefined ? payload.isBusy : true,
      source: payload.source || 'manual',
    };

    const { data, error } = await supabase
      .from('schedules')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      if (error.code === '23514') {
        throw new AppError(
          400,
          'INVALID_TIME_RANGE',
          'End time must be strictly after start time.'
        );
      }
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to create schedule entry.',
        error.message
      );
    }

    return formatScheduleRow(data);
  }

  /**
   * Updates an existing schedule entry, verifying user ownership and resulting time boundaries.
   */
  static async updateSchedule(
    supabase: TypedSupabaseClient,
    userId: string,
    scheduleId: string,
    payload: UpdateScheduleInput
  ): Promise<ScheduleItemResponse> {
    // 1. Fetch existing entry to check ownership and base values
    const { data: existing, error: fetchErr } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', scheduleId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to inspect existing schedule entry.',
        fetchErr.message
      );
    }

    if (!existing) {
      throw new AppError(
        404,
        'SCHEDULE_NOT_FOUND',
        'Schedule entry does not exist or does not belong to you.'
      );
    }

    // 2. Validate resulting time range
    const effectiveStartTime = payload.startTime
      ? normalizeTimeToSql(payload.startTime)
      : existing.start_time;

    const effectiveEndTime = payload.endTime
      ? normalizeTimeToSql(payload.endTime)
      : existing.end_time;

    const startMinutes = parseTimeToMinutes(effectiveStartTime);
    const endMinutes = parseTimeToMinutes(effectiveEndTime);

    if (endMinutes <= startMinutes) {
      throw new AppError(
        400,
        'INVALID_TIME_RANGE',
        'End time must be strictly after start time.'
      );
    }

    // 3. Prepare column updates
    const updates: ScheduleUpdate = {};

    if (payload.title !== undefined) {
      updates.title = payload.title.trim();
    }

    if (payload.startTime !== undefined) {
      updates.start_time = effectiveStartTime;
    }

    if (payload.endTime !== undefined) {
      updates.end_time = effectiveEndTime;
    }

    if (payload.dayOfWeek !== undefined || payload.dayKey !== undefined) {
      const rawDow =
        payload.dayOfWeek !== undefined ? payload.dayOfWeek : payload.dayKey;
      updates.day_of_week = resolveDayOfWeek(rawDow);
    }

    if (payload.specificDate !== undefined) {
      updates.specific_date = normalizeDateToSql(payload.specificDate);
    }

    // Verify resulting record still satisfies recurrence/date constraint
    const resultingDow =
      updates.day_of_week !== undefined
        ? updates.day_of_week
        : existing.day_of_week;
    const resultingDate =
      updates.specific_date !== undefined
        ? updates.specific_date
        : existing.specific_date;

    if (resultingDow === null && resultingDate === null) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'Schedule entry must have either a recurring dayOfWeek or a specificDate.'
      );
    }

    if (payload.room !== undefined) {
      updates.room = payload.room ? payload.room.trim() : null;
    }

    if (payload.notes !== undefined) {
      updates.notes = payload.notes ? payload.notes.trim() : null;
    }

    if (payload.isBusy !== undefined) {
      updates.is_busy = payload.isBusy;
    }

    if (payload.source !== undefined) {
      updates.source = payload.source;
    }

    const { data: updated, error: updateErr } = await supabase
      .from('schedules')
      .update(updates)
      .eq('id', scheduleId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (updateErr) {
      if (updateErr.code === '23514') {
        throw new AppError(
          400,
          'INVALID_TIME_RANGE',
          'End time must be strictly after start time.'
        );
      }
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to update schedule entry.',
        updateErr.message
      );
    }

    return formatScheduleRow(updated);
  }

  /**
   * Deletes a schedule entry by ID, verifying user ownership.
   */
  static async deleteSchedule(
    supabase: TypedSupabaseClient,
    userId: string,
    scheduleId: string
  ): Promise<{ id: string }> {
    const { data, error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', scheduleId)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to delete schedule entry.',
        error.message
      );
    }

    if (!data) {
      throw new AppError(
        404,
        'SCHEDULE_NOT_FOUND',
        'Schedule entry does not exist or does not belong to you.'
      );
    }

    return { id: scheduleId };
  }
}
