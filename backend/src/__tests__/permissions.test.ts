import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AppError } from '../middleware/errorHandler';
import {
  buildMemberPrivacyState,
  maskScheduleBlocksForAccess,
  PermissionService,
  RawScheduleBlock,
} from '../services/permission.service';

const USER_ME = '00000000-0000-0000-0000-000000000001';
const FRIEND_AVA = '00000000-0000-0000-0000-000000000002';
const BLOCKED_USER = '00000000-0000-0000-0000-000000000005';

describe('[BE-09] Visibility Enforcement, Masking & State Handling', () => {
  const rawSample: RawScheduleBlock[] = [
    {
      id: 's1',
      title: 'CS 314 Web Systems',
      day_of_week: 1,
      specific_date: null,
      start_time: '09:00:00',
      end_time: '10:30:00',
      room: 'AL211A',
      notes: 'Bring laptop',
      is_busy: true,
    },
  ];

  it('maskScheduleBlocksForAccess should strip titles, rooms, and notes for busy_only / free_only and empty restricted', () => {
    const full = maskScheduleBlocksForAccess(rawSample, 'full_view');
    assert.equal(full[0].title, 'CS 314 Web Systems');
    assert.equal(full[0].room, 'AL211A');
    assert.equal(full[0].is_private, false);

    const busyOnly = maskScheduleBlocksForAccess(rawSample, 'busy_only');
    assert.equal(busyOnly[0].title, 'Busy');
    assert.equal(busyOnly[0].room, null);
    assert.equal(busyOnly[0].notes, null);
    assert.equal(busyOnly[0].is_private, true);

    const freeOnly = maskScheduleBlocksForAccess(rawSample, 'free_only');
    assert.equal(freeOnly[0].title, 'Busy');
    assert.equal(freeOnly[0].room, null);
    assert.equal(freeOnly[0].is_private, true);

    const restricted = maskScheduleBlocksForAccess(rawSample, 'restricted');
    assert.deepEqual(restricted, []);

    const blocked = maskScheduleBlocksForAccess(rawSample, 'blocked');
    assert.deepEqual(blocked, []);
  });

  it('buildMemberPrivacyState should return clean restricted, missing, and unavailable states', () => {
    const blockedState = buildMemberPrivacyState({
      displayName: 'Marcus Kim',
      profileExists: true,
      isBlocked: true,
      isFriend: false,
      isOwner: false,
      accessLevel: 'blocked',
      hasAnySchedule: true,
    });
    assert.equal(blockedState.scheduleState, 'unavailable');
    assert.equal(blockedState.isUnavailable, true);
    assert.equal(blockedState.canViewSchedule, false);

    const onlyMeState = buildMemberPrivacyState({
      displayName: 'Joshua Emmanuel',
      profileExists: true,
      isBlocked: false,
      isFriend: true,
      isOwner: false,
      scheduleVisibility: 'only_me',
      accessLevel: 'restricted',
      hasAnySchedule: true,
    });
    assert.equal(onlyMeState.scheduleState, 'privacy-restricted');
    assert.equal(onlyMeState.isPrivate, true);
    assert.equal(onlyMeState.canViewSchedule, false);

    const missingState = buildMemberPrivacyState({
      displayName: 'Priya Nair',
      profileExists: true,
      isBlocked: false,
      isFriend: true,
      isOwner: false,
      scheduleVisibility: 'friends_only',
      accessLevel: 'full_view',
      hasAnySchedule: false,
    });
    assert.equal(missingState.scheduleState, 'missing');
    assert.equal(missingState.hasMissingSchedule, true);
    assert.equal(missingState.canViewSchedule, true);

    const limitedState = buildMemberPrivacyState({
      displayName: 'Chloe Park',
      profileExists: true,
      isBlocked: false,
      isFriend: true,
      isOwner: false,
      scheduleVisibility: 'selected_friends',
      accessLevel: 'busy_only',
      hasAnySchedule: true,
    });
    assert.equal(limitedState.scheduleState, 'privacy-restricted');
    assert.equal(limitedState.isPrivate, true);
    assert.equal(limitedState.canViewSchedule, true);
  });

  it('PermissionService.assertCanAccessFriendResource should throw 403 USER_BLOCKED when blocked', async () => {
    const mockRpcClient = {
      rpc: async () => ({
        data: [
          {
            target_user_id: BLOCKED_USER,
            profile_exists: true,
            is_self: false,
            is_blocked: true,
            is_friend: false,
            schedule_visibility: 'friends_only',
            access_level: 'blocked',
            can_view_schedule: false,
            has_any_schedule: false,
          },
        ],
        error: null,
      }),
    } as any;

    await assert.rejects(
      () =>
        PermissionService.assertCanAccessFriendResource(
          mockRpcClient,
          USER_ME,
          BLOCKED_USER
        ),
      (err: unknown) =>
        err instanceof AppError &&
        err.statusCode === 403 &&
        err.code === 'USER_BLOCKED'
    );
  });

  it('PermissionService.assertCanAccessFriendResource should throw 404 USER_NOT_FOUND for unknown profile', async () => {
    const mockRpcClient = {
      rpc: async () => ({
        data: [
          {
            target_user_id: BLOCKED_USER,
            profile_exists: false,
            is_self: false,
            is_blocked: false,
            is_friend: false,
            schedule_visibility: 'only_me',
            access_level: 'none',
            can_view_schedule: false,
            has_any_schedule: false,
          },
        ],
        error: null,
      }),
    } as any;

    await assert.rejects(
      () =>
        PermissionService.assertCanAccessFriendResource(
          mockRpcClient,
          USER_ME,
          BLOCKED_USER
        ),
      (err: unknown) =>
        err instanceof AppError &&
        err.statusCode === 404 &&
        err.code === 'USER_NOT_FOUND'
    );
  });

  it('PermissionService.assertCanAccessFriendResource should throw 403 NOT_FRIENDS for non-friends', async () => {
    const mockRpcClient = {
      rpc: async () => ({
        data: [
          {
            target_user_id: FRIEND_AVA,
            profile_exists: true,
            is_self: false,
            is_blocked: false,
            is_friend: false,
            schedule_visibility: 'friends_only',
            access_level: 'restricted',
            can_view_schedule: false,
            has_any_schedule: true,
          },
        ],
        error: null,
      }),
    } as any;

    await assert.rejects(
      () =>
        PermissionService.assertCanAccessFriendResource(
          mockRpcClient,
          USER_ME,
          FRIEND_AVA
        ),
      (err: unknown) =>
        err instanceof AppError &&
        err.statusCode === 403 &&
        err.code === 'NOT_FRIENDS'
    );
  });
});
