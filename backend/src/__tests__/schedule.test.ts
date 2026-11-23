import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../app';
import { AppError } from '../middleware/errorHandler';
import {
  createScheduleSchema,
  dayOfWeekToDayKey,
  dayOfWeekToName,
  formatTime12h,
  normalizeDateToSql,
  normalizeTimeToSql,
  parseTimeToMinutes,
  resolveDayOfWeek,
  updateScheduleSchema,
} from '../schemas/schedule.schema';
import {
  formatScheduleRow,
  ScheduleService,
} from '../services/schedule.service';

describe('[BE-05] Personal Schedule CRUD - Time & Recurrence Logic', () => {
  describe('Time Parsing & Normalization', () => {
    it('parseTimeToMinutes should parse 24h formats accurately', () => {
      assert.equal(parseTimeToMinutes('00:00'), 0);
      assert.equal(parseTimeToMinutes('08:00'), 480);
      assert.equal(parseTimeToMinutes('13:30'), 810);
      assert.equal(parseTimeToMinutes('23:59'), 1439);
    });

    it('parseTimeToMinutes should parse 12h formats accurately', () => {
      assert.equal(parseTimeToMinutes('12:00 AM'), 0);
      assert.equal(parseTimeToMinutes('7:00 AM'), 420);
      assert.equal(parseTimeToMinutes('12:00 PM'), 720);
      assert.equal(parseTimeToMinutes('1:30 PM'), 810);
      assert.equal(parseTimeToMinutes('11:59 PM'), 1439);
    });

    it('parseTimeToMinutes should return -1 on invalid formats', () => {
      assert.equal(parseTimeToMinutes('not-a-time'), -1);
      assert.equal(parseTimeToMinutes('25:00'), -1);
      assert.equal(parseTimeToMinutes('12:65 AM'), -1);
      assert.equal(parseTimeToMinutes(''), -1);
    });

    it('normalizeTimeToSql should produce canonical HH:MM:SS', () => {
      assert.equal(normalizeTimeToSql('7:00 AM'), '07:00:00');
      assert.equal(normalizeTimeToSql('1:30 PM'), '13:30:00');
      assert.equal(normalizeTimeToSql('08:15'), '08:15:00');
    });

    it('formatTime12h should format times to 12h AM/PM strings', () => {
      assert.equal(formatTime12h('07:00:00'), '7:00 AM');
      assert.equal(formatTime12h('13:30:00'), '1:30 PM');
      assert.equal(formatTime12h('00:00:00'), '12:00 AM');
    });
  });

  describe('Date & Recurrence Resolvers', () => {
    it('normalizeDateToSql should accept YYYY-MM-DD and DD / MM / YYYY', () => {
      assert.equal(normalizeDateToSql('2026-10-25'), '2026-10-25');
      assert.equal(normalizeDateToSql('25 / 10 / 2026'), '2026-10-25');
      assert.equal(normalizeDateToSql('25/10/2026'), '2026-10-25');
      assert.equal(normalizeDateToSql('invalid-date'), null);
    });

    it('resolveDayOfWeek and dayOfWeekToDayKey should map days accurately', () => {
      assert.equal(resolveDayOfWeek('mon'), 1);
      assert.equal(resolveDayOfWeek('Monday'), 1);
      assert.equal(resolveDayOfWeek(1), 1);
      assert.equal(resolveDayOfWeek('sun'), 0);
      assert.equal(resolveDayOfWeek('sat'), 6);
      assert.equal(resolveDayOfWeek('invalid'), null);

      assert.equal(dayOfWeekToDayKey(1), 'mon');
      assert.equal(dayOfWeekToDayKey(0), 'sun');
      assert.equal(dayOfWeekToName(1), 'Monday');
    });
  });

  describe('createScheduleSchema Validation', () => {
    it('should accept valid recurring weekly schedule entries', () => {
      const validRecurring = {
        title: 'UI/UX Design Studio',
        startTime: '7:00 AM',
        endTime: '9:00 AM',
        dayOfWeek: 1,
        room: 'AL211A',
        notes: 'Lecture & critique',
      };
      const parsed = createScheduleSchema.parse(validRecurring);
      assert.equal(parsed.title, 'UI/UX Design Studio');
      assert.equal(parsed.dayOfWeek, 1);
    });

    it('should accept valid date-specific schedule entries', () => {
      const validDateSpecific = {
        title: 'Project Defense',
        startTime: '13:00',
        endTime: '15:00',
        specificDate: '2026-10-25',
      };
      const parsed = createScheduleSchema.parse(validDateSpecific);
      assert.equal(parsed.title, 'Project Defense');
      assert.equal(parsed.specificDate, '2026-10-25');
    });

    it('should block malformed time ranges (endTime <= startTime)', () => {
      assert.throws(
        () =>
          createScheduleSchema.parse({
            title: 'Invalid Slot',
            startTime: '10:00 AM',
            endTime: '9:00 AM', // Reverse time
            dayOfWeek: 1,
          }),
        /End time must be after start time/
      );

      assert.throws(
        () =>
          createScheduleSchema.parse({
            title: 'Zero Length Slot',
            startTime: '10:00 AM',
            endTime: '10:00 AM', // Equal time
            dayOfWeek: 1,
          }),
        /End time must be after start time/
      );
    });

    it('should reject entries with neither dayOfWeek nor specificDate', () => {
      assert.throws(
        () =>
          createScheduleSchema.parse({
            title: 'Floating Slot',
            startTime: '8:00 AM',
            endTime: '9:00 AM',
          }),
        /Either dayOfWeek .* or specificDate .* must be provided/
      );
    });
  });

  describe('updateScheduleSchema Validation', () => {
    it('should block inverted times if both startTime and endTime are updated', () => {
      assert.throws(
        () =>
          updateScheduleSchema.parse({
            startTime: '14:00',
            endTime: '12:00',
          }),
        /End time must be after start time/
      );
    });

    it('should accept partial valid updates', () => {
      const parsed = updateScheduleSchema.parse({
        title: 'Updated Title',
        room: 'P216',
      });
      assert.equal(parsed.title, 'Updated Title');
      assert.equal(parsed.room, 'P216');
    });
  });

  describe('formatScheduleRow DTO Model', () => {
    it('should format recurring row with dayKey and timeRange', () => {
      const row = {
        id: '00000000-0000-0000-0000-000000000001',
        user_id: '00000000-0000-0000-0000-000000000099',
        title: 'Database Systems',
        start_time: '08:00:00',
        end_time: '10:00:00',
        day_of_week: 2,
        specific_date: null,
        room: 'Lab 1',
        notes: null,
        is_busy: true,
        source: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const formatted = formatScheduleRow(row);
      assert.equal(formatted.dayKey, 'tue');
      assert.equal(formatted.dayName, 'Tuesday');
      assert.equal(formatted.isRecurring, true);
      assert.equal(formatted.timeRange, '8:00 AM - 10:00 AM');
    });

    it('should format date-specific row with isRecurring=false', () => {
      const row = {
        id: '00000000-0000-0000-0000-000000000002',
        user_id: '00000000-0000-0000-0000-000000000099',
        title: 'Midterm Exam',
        start_time: '13:00:00',
        end_time: '15:00:00',
        day_of_week: null,
        specific_date: '2026-10-25',
        room: null,
        notes: 'Bring calculator',
        is_busy: true,
        source: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const formatted = formatScheduleRow(row);
      assert.equal(formatted.isRecurring, false);
      assert.equal(formatted.specificDate, '2026-10-25');
    });
  });

  describe('ScheduleService Mock Unit Tests', () => {
    it('getScheduleById should throw 404 AppError when schedule does not exist', async () => {
      const mockSupabase: any = {
        from: () => ({
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
            }),
          }),
        }),
      };

      await assert.rejects(
        async () => {
          await ScheduleService.getScheduleById(
            mockSupabase,
            'user-1',
            '00000000-0000-0000-0000-000000000000'
          );
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 404 &&
          err.code === 'SCHEDULE_NOT_FOUND'
      );
    });

    it('deleteSchedule should throw 404 AppError when item does not belong to user', async () => {
      const mockSupabase: any = {
        from: () => ({
          delete: () => ({
            eq: () => ({
              eq: () => ({
                select: () => ({
                  maybeSingle: async () => ({ data: null, error: null }),
                }),
              }),
            }),
          }),
        }),
      };

      await assert.rejects(
        async () => {
          await ScheduleService.deleteSchedule(
            mockSupabase,
            'user-1',
            '00000000-0000-0000-0000-000000000000'
          );
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 404 &&
          err.code === 'SCHEDULE_NOT_FOUND'
      );
    });
  });
});

describe('[BE-05] HTTP Integration - Endpoint & Route Protection Tests', () => {
  let server: ReturnType<typeof createServer>;
  let baseUrl: string;

  before(async () => {
    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (typeof addr === 'object' && addr !== null) {
          baseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('GET /api/schedules should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/schedules`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('POST /api/schedules should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Class',
        startTime: '08:00',
        endTime: '10:00',
        dayOfWeek: 1,
      }),
    });
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('GET /api/schedules/:id should return 401 UNAUTHORIZED without token', async () => {
    const validUuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const res = await fetch(`${baseUrl}/api/schedules/${validUuid}`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('PATCH /api/schedules/:id should return 401 UNAUTHORIZED without token', async () => {
    const validUuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const res = await fetch(`${baseUrl}/api/schedules/${validUuid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Title' }),
    });
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('DELETE /api/schedules/:id should return 401 UNAUTHORIZED without token', async () => {
    const validUuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const res = await fetch(`${baseUrl}/api/schedules/${validUuid}`, {
      method: 'DELETE',
    });
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });
});
