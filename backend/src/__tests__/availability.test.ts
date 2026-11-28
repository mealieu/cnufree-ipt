import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../app';
import {
  dashboardAvailabilityQuerySchema,
  friendAvailabilityParamsSchema,
  overlapQuerySchema,
  permissionCheckParamsSchema,
} from '../schemas/availability.schema';
import {
  AvailabilityService,
  computeFreeIntervals,
  computeOverlappingWindowsForDay,
  computeRealtimeStatus,
  formatAvailabilityBlock,
  mergeMinuteIntervals,
  scoreAndClassifyWindow,
} from '../services/availability.service';

const USER_ME = '00000000-0000-0000-0000-000000000001';
const FRIEND_AVA = '00000000-0000-0000-0000-000000000002';
const FRIEND_CHLOE = '00000000-0000-0000-0000-000000000003';
const FRIEND_PRIYA = '00000000-0000-0000-0000-000000000004';
const GROUP_TEAM = '10000000-0000-0000-0000-000000000001';

describe('[BE-08] Availability & Overlap Engine - Unit & Schema Tests', () => {
  describe('Request Schema Validation', () => {
    it('dashboardAvailabilityQuerySchema should accept defaults and valid query params', () => {
      const defaults = dashboardAvailabilityQuerySchema.parse({});
      assert.equal(defaults.groupId, 'all');
      assert.equal(defaults.timezone, 'Asia/Manila');
      assert.equal(defaults.includeOwnSchedule, true);

      const custom = dashboardAvailabilityQuerySchema.parse({
        groupId: GROUP_TEAM,
        date: '2026-10-19',
        at: '12:15 PM',
        timezone: 'UTC',
        includeOwnSchedule: 'false',
      });
      assert.equal(custom.groupId, GROUP_TEAM);
      assert.equal(custom.date, '2026-10-19');
      assert.equal(custom.includeOwnSchedule, false);
    });

    it('dashboardAvailabilityQuerySchema should reject invalid groupId, date, or timezone', () => {
      assert.throws(() =>
        dashboardAvailabilityQuerySchema.parse({ groupId: 'not-a-uuid' })
      );
      assert.throws(() =>
        dashboardAvailabilityQuerySchema.parse({ date: 'bad-date' })
      );
      assert.throws(() =>
        dashboardAvailabilityQuerySchema.parse({ timezone: 'Mars/Olympus' })
      );
    });

    it('overlapQuerySchema should parse comma-separated friendIds and enforce hour bounds', () => {
      const parsed = overlapQuerySchema.parse({
        mode: 'week',
        friendIds: `${FRIEND_AVA},${FRIEND_CHLOE}`,
        minDurationMinutes: '45',
        startHour: '8',
        endHour: '18',
      });
      assert.equal(parsed.mode, 'week');
      assert.deepEqual(parsed.friendIds, [FRIEND_AVA, FRIEND_CHLOE]);
      assert.equal(parsed.minDurationMinutes, 45);

      assert.throws(() =>
        overlapQuerySchema.parse({ startHour: '18', endHour: '9' })
      );
      assert.throws(() =>
        overlapQuerySchema.parse({ friendIds: 'not-a-uuid' })
      );
    });

    it('UUID param schemas should validate friendId and targetUserId', () => {
      assert.equal(
        friendAvailabilityParamsSchema.parse({ friendId: FRIEND_AVA }).friendId,
        FRIEND_AVA
      );
      assert.throws(() =>
        friendAvailabilityParamsSchema.parse({ friendId: 'invalid' })
      );
      assert.equal(
        permissionCheckParamsSchema.parse({ targetUserId: FRIEND_AVA })
          .targetUserId,
        FRIEND_AVA
      );
      assert.throws(() =>
        permissionCheckParamsSchema.parse({ targetUserId: 'invalid' })
      );
    });
  });

  describe('[BE-08] Interval Arithmetic & Real-Time Status Engine', () => {
    it('mergeMinuteIntervals and computeFreeIntervals should merge busy slots and compute gaps', () => {
      const merged = mergeMinuteIntervals([
        { startMin: 540, endMin: 630 }, // 9:00 - 10:30
        { startMin: 600, endMin: 690 }, // 10:00 - 11:30 (overlaps)
        { startMin: 810, endMin: 900 }, // 1:30 - 3:00
      ]);
      assert.deepEqual(merged, [
        { startMin: 540, endMin: 690 },
        { startMin: 810, endMin: 900 },
      ]);

      const free = computeFreeIntervals(merged, 480, 1080); // 8:00 AM - 6:00 PM
      assert.deepEqual(free, [
        { startMin: 480, endMin: 540 },  // 8:00 - 9:00 AM
        { startMin: 690, endMin: 810 },  // 11:30 AM - 1:30 PM (Lunch)
        { startMin: 900, endMin: 1080 }, // 3:00 - 6:00 PM
      ]);
    });

    it('computeRealtimeStatus should accurately compute free, busy, and masked states', () => {
      const sampleBlocks = [
        formatAvailabilityBlock({
          id: 'b1',
          title: 'UI/UX',
          day_of_week: 1,
          specific_date: null,
          start_time: '09:00:00',
          end_time: '10:30:00',
          room: 'AL211A',
          notes: null,
          is_busy: true,
        }),
        formatAvailabilityBlock({
          id: 'b2',
          title: 'IPT2',
          day_of_week: 1,
          specific_date: null,
          start_time: '13:30:00',
          end_time: '15:00:00',
          room: 'P216',
          notes: null,
          is_busy: true,
        }),
      ];

      // At 9:30 AM (570 mins) -> Busy in UI/UX AL211A until 10:30 AM
      const busyStatus = computeRealtimeStatus({
        blocks: sampleBlocks,
        evaluatedMinutes: 9 * 60 + 30,
        hasSchedule: true,
        canViewSchedule: true,
        isPrivate: false,
      });
      assert.equal(busyStatus.status, 'busy');
      assert.equal(busyStatus.untilTime, '10:30 AM');
      assert.equal(busyStatus.currentActivity, 'UI/UX AL211A');

      // At 12:00 PM (720 mins) -> Free until 1:30 PM
      const freeStatus = computeRealtimeStatus({
        blocks: sampleBlocks,
        evaluatedMinutes: 12 * 60,
        hasSchedule: true,
        canViewSchedule: true,
        isPrivate: false,
      });
      assert.equal(freeStatus.status, 'free');
      assert.equal(freeStatus.untilTime, '1:30 PM');
      assert.equal(freeStatus.nextActivity, '1:30 PM P216 IPT2');

      // Private (busy_only) masks activity titles & rooms
      const privateBusyStatus = computeRealtimeStatus({
        blocks: sampleBlocks,
        evaluatedMinutes: 9 * 60 + 30,
        hasSchedule: true,
        canViewSchedule: true,
        isPrivate: true,
      });
      assert.equal(privateBusyStatus.status, 'busy');
      assert.equal(privateBusyStatus.currentActivity, 'Busy');
      assert.equal(privateBusyStatus.nextActivity, '1:30 PM Busy');
    });

    it('scoreAndClassifyWindow should prioritize Lunch and Dismissal gaps over Morning/Afternoon gaps', () => {
      const morning = scoreAndClassifyWindow({
        startMin: 8 * 60,
        endMin: 9 * 60,
        freeCount: 4,
        totalCount: 4,
        isAllFree: true,
      });
      const lunch = scoreAndClassifyWindow({
        startMin: 11 * 60 + 30,
        endMin: 12 * 60 + 30,
        freeCount: 4,
        totalCount: 4,
        isAllFree: true,
      });
      const dismissal = scoreAndClassifyWindow({
        startMin: 16 * 60 + 30,
        endMin: 17 * 60 + 30,
        freeCount: 4,
        totalCount: 4,
        isAllFree: true,
      });

      assert.equal(lunch.priorityCategory, 'lunch');
      assert.equal(lunch.isHighValueGap, true);
      assert.equal(dismissal.priorityCategory, 'dismissal');
      assert.equal(dismissal.isHighValueGap, true);
      assert.equal(morning.priorityCategory, 'morning');
      assert.equal(morning.isHighValueGap, false);

      assert.ok(lunch.priorityScore > morning.priorityScore);
      assert.ok(dismissal.priorityScore > morning.priorityScore);
    });

    it('computeOverlappingWindowsForDay should compute exact windows and never count missing members as free', () => {
      // Scenario A: 3 computable friends, all free during Morning (8-9), Lunch (11:30-1:30), Dismissal (4:30-6:00)
      const result = computeOverlappingWindowsForDay({
        dateKey: '2026-10-19',
        participants: [
          {
            id: USER_ME,
            isComputable: true,
            busyIntervals: [
              { startMin: 9 * 60, endMin: 11 * 60 + 30 },
              { startMin: 13 * 60 + 30, endMin: 16 * 60 + 30 },
            ],
          },
          {
            id: FRIEND_AVA,
            isComputable: true,
            busyIntervals: [
              { startMin: 9 * 60, endMin: 10 * 60 + 30 },
              { startMin: 14 * 60, endMin: 15 * 60 + 30 },
            ],
          },
          {
            id: FRIEND_CHLOE,
            isComputable: true,
            busyIntervals: [
              { startMin: 9 * 60 + 30, endMin: 11 * 60 },
              { startMin: 15 * 60, endMin: 16 * 60 + 30 },
            ],
          },
        ],
        boundStartMin: 8 * 60,
        boundEndMin: 18 * 60,
        minDurationMinutes: 30,
      });

      assert.equal(result.allFreeWindows.length, 3);
      // Prioritized order puts Lunch (120 mins) first, then Dismissal (90 mins), then Morning (60 mins)
      assert.equal(result.prioritizedWindows[0].priorityCategory, 'lunch');
      assert.equal(result.prioritizedWindows[0].timeRange, '11:30 AM – 1:30 PM');
      assert.equal(result.prioritizedWindows[0].isRecommended, true);
      assert.equal(result.prioritizedWindows[1].priorityCategory, 'dismissal');
      assert.equal(result.prioritizedWindows[1].timeRange, '4:30 PM – 6:00 PM');
      assert.equal(result.prioritizedWindows[2].priorityCategory, 'morning');

      // Scenario B: Adding a friend with missing schedule prevents isAllFree from returning true
      const withMissing = computeOverlappingWindowsForDay({
        dateKey: '2026-10-19',
        participants: [
          { id: USER_ME, isComputable: true, busyIntervals: [] },
          { id: FRIEND_AVA, isComputable: true, busyIntervals: [] },
          { id: FRIEND_PRIYA, isComputable: false, busyIntervals: [] },
        ],
        boundStartMin: 8 * 60,
        boundEndMin: 18 * 60,
        minDurationMinutes: 30,
      });

      assert.equal(withMissing.allFreeWindows.length, 0);
      assert.equal(withMissing.partialWindows.length, 1);
      assert.equal(withMissing.partialWindows[0].freeCount, 2);
      assert.equal(withMissing.partialWindows[0].totalCount, 3);
      assert.equal(withMissing.partialWindows[0].isAllFree, false);
    });
  });

  describe('[BE-08] AvailabilityService Integration with Mocked PostgreSQL RPC', () => {
    function createMockAvailabilityClient() {
      const ownSchedules = [
        {
          id: 'me-1',
          title: 'UI/UX',
          day_of_week: 1,
          specific_date: null,
          start_time: '09:00:00',
          end_time: '11:30:00',
          room: 'AL211A',
          notes: null,
          is_busy: true,
        },
        {
          id: 'me-2',
          title: 'IPT2',
          day_of_week: 1,
          specific_date: null,
          start_time: '13:30:00',
          end_time: '16:30:00',
          room: 'P216',
          notes: null,
          is_busy: true,
        },
      ];

      const rpcFriendsRows = [
        {
          friend_id: FRIEND_AVA,
          full_name: 'Ava Chen',
          first_name: 'Ava',
          last_name: 'Chen',
          username: 'avachen',
          avatar_url: null,
          schedule_visibility: 'friends_only',
          access_level: 'full_view',
          can_view_schedule: true,
          has_any_schedule: true,
          group_ids: [GROUP_TEAM],
          schedules_json: [
            {
              id: 'ava-1',
              title: 'Calc II',
              day_of_week: 1,
              specific_date: null,
              start_time: '09:00:00',
              end_time: '10:30:00',
              room: 'Hall B',
              notes: null,
              is_busy: true,
              is_private: false,
            },
            {
              id: 'ava-2',
              title: 'Studio',
              day_of_week: 1,
              specific_date: null,
              start_time: '14:00:00',
              end_time: '16:00:00',
              room: 'Design Lab',
              notes: null,
              is_busy: true,
              is_private: false,
            },
            {
              id: 'ava-3',
              title: 'Evening Seminar',
              day_of_week: 1,
              specific_date: null,
              start_time: '17:30:00',
              end_time: '20:30:00',
              room: 'Auditorium',
              notes: null,
              is_busy: true,
              is_private: false,
            },
          ],
        },
        {
          friend_id: FRIEND_CHLOE,
          full_name: 'Chloe Park',
          first_name: 'Chloe',
          last_name: 'Park',
          username: 'chloepark',
          avatar_url: null,
          schedule_visibility: 'selected_friends',
          access_level: 'busy_only',
          can_view_schedule: true,
          has_any_schedule: true,
          group_ids: [GROUP_TEAM],
          schedules_json: [
            {
              id: 'chloe-1',
              title: 'Secret Class',
              day_of_week: 1,
              specific_date: null,
              start_time: '09:30:00',
              end_time: '11:00:00',
              room: 'Secret Room',
              notes: 'Private note',
              is_busy: true,
              is_private: true,
            },
          ],
        },
        {
          friend_id: FRIEND_PRIYA,
          full_name: 'Priya Nair',
          first_name: 'Priya',
          last_name: 'Nair',
          username: 'priyanair',
          avatar_url: null,
          schedule_visibility: 'friends_only',
          access_level: 'full_view',
          can_view_schedule: true,
          has_any_schedule: false,
          group_ids: [GROUP_TEAM],
          schedules_json: [],
        },
      ];

      return {
        rpc: async (fnName: string) => {
          if (fnName === 'get_friends_schedules_for_date') {
            return { data: rpcFriendsRows, error: null };
          }
          return { data: [], error: null };
        },
        from: (table: string) => {
          const chain: any = {
            select: () => chain,
            eq: () => chain,
            in: () => chain,
            or: () => chain,
            order: () => chain,
            maybeSingle: async () => {
              if (table === 'friend_groups') {
                return { data: { id: GROUP_TEAM, name: 'Project Team' }, error: null };
              }
              if (table === 'profiles') {
                return {
                  data: {
                    id: USER_ME,
                    full_name: 'Bernadette Cruz',
                    first_name: 'Bernadette',
                    last_name: 'Cruz',
                    username: 'berna',
                    avatar_url: null,
                  },
                  error: null,
                };
              }
              return { data: null, error: null };
            },
            then: (resolve: any) => {
              if (table === 'schedules') {
                return resolve({
                  data: ownSchedules,
                  count: ownSchedules.length,
                  error: null,
                });
              }
              if (table === 'friend_groups') {
                return resolve({
                  data: [{ id: GROUP_TEAM, name: 'Project Team' }],
                  error: null,
                });
              }
              if (table === 'friend_group_members') {
                return resolve({
                  data: [
                    { group_id: GROUP_TEAM, member_id: FRIEND_AVA },
                    { group_id: GROUP_TEAM, member_id: FRIEND_CHLOE },
                    { group_id: GROUP_TEAM, member_id: FRIEND_PRIYA },
                  ],
                  error: null,
                });
              }
              return resolve({ data: [], count: 0, error: null });
            },
          };
          return chain;
        },
      } as any;
    }

    it('getDashboardAvailability should compute real-time statuses, mask busy_only, and surface missing schedules', async () => {
      const client = createMockAvailabilityClient();
      const result = await AvailabilityService.getDashboardAvailability(
        client,
        USER_ME,
        {
          groupId: GROUP_TEAM,
          date: '2026-10-19',
          at: '10:00 AM',
          timezone: 'Asia/Manila',
          includeOwnSchedule: true,
        }
      );

      assert.equal(result.currentUser.status, 'busy');
      assert.equal(result.currentUser.currentActivity, 'UI/UX AL211A');

      assert.equal(result.summary.totalFriends, 3);
      assert.equal(result.summary.missingCount, 1);

      const ava = result.friends.find((f) => f.id === FRIEND_AVA)!;
      assert.equal(ava.status, 'busy');
      assert.equal(ava.currentActivity, 'Calc II Hall B');
      assert.equal(ava.scheduleState, 'available');

      const chloe = result.friends.find((f) => f.id === FRIEND_CHLOE)!;
      assert.equal(chloe.status, 'busy');
      assert.equal(chloe.isPrivate, true);
      assert.equal(chloe.scheduleState, 'privacy-restricted');
      assert.equal(chloe.currentActivity, 'Busy');
      assert.equal(chloe.schedule[0].title, 'Busy');
      assert.equal(chloe.schedule[0].room, null);

      const priya = result.friends.find((f) => f.id === FRIEND_PRIYA)!;
      assert.equal(priya.status, 'unknown');
      assert.equal(priya.hasMissingSchedule, true);
      assert.equal(priya.scheduleState, 'missing');

      assert.ok(result.bestWindow !== null);
      assert.equal(result.bestWindow?.priorityCategory, 'lunch');
      assert.equal(result.bestWindow?.isHighValueGap, true);
    });

    it('getOverlappingWindows in week mode should return 7 days and highlight best window of the week', async () => {
      const client = createMockAvailabilityClient();
      const result = await AvailabilityService.getOverlappingWindows(
        client,
        USER_ME,
        {
          mode: 'week',
          date: '2026-10-19',
          groupId: 'all',
          includeMe: true,
          minDurationMinutes: 30,
          startHour: 8,
          endHour: 21,
          timezone: 'Asia/Manila',
        }
      );

      assert.equal(result.mode, 'week');
      assert.equal(result.days.length, 7);
      assert.equal(result.weekRange.startDate, '2026-10-19');
      assert.equal(result.weekRange.endDate, '2026-10-25');
      assert.ok(result.groupSummary.missingCount === 1);
    });
  });
});

describe('[BE-08] & [BE-09] HTTP Integration - Endpoint & Route Protection Tests', () => {
  const app = createApp();
  let server: ReturnType<typeof createServer>;
  let baseUrl = '';

  before(async () => {
    server = createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });
    const address = server.address();
    if (address && typeof address === 'object') {
      baseUrl = `http://127.0.0.1:${address.port}`;
    }
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it('GET /api/health should return 200 OK', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.status, 'ok');
  });

  it('GET /api/availability/dashboard should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/availability/dashboard`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('GET /api/availability/overlap should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/availability/overlap`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('GET /api/availability/friends/:friendId should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/availability/friends/${FRIEND_AVA}`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('GET /api/availability/permissions/:targetUserId should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(
      `${baseUrl}/api/availability/permissions/${FRIEND_AVA}`
    );
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });
});
