import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../app';
import {
  computeInitials,
  FormattedPermissionItem,
  ProfileService,
} from '../services/profile.service';
import {
  normalizeVisibilityOption,
  updateNotificationPreferencesSchema,
  updateProfileSchema,
  updateScheduleVisibilitySchema,
  usernameRegex,
} from '../schemas/profile.schema';
import { AppError } from '../middleware/errorHandler';

describe('[BE-04] User Profile & Settings - Unit & Schema Tests', () => {
  describe('Username Regex & Validation', () => {
    it('should accept valid usernames between 3 and 30 characters', () => {
      assert.equal(usernameRegex.test('bernadette_c'), true);
      assert.equal(usernameRegex.test('user123'), true);
      assert.equal(usernameRegex.test('abc'), true);
      assert.equal(usernameRegex.test('A_B_C_1_2_3'), true);
    });

    it('should reject invalid usernames', () => {
      assert.equal(usernameRegex.test('ab'), false, 'Too short (< 3 chars)');
      assert.equal(usernameRegex.test('a'.repeat(31)), false, 'Too long (> 30 chars)');
      assert.equal(usernameRegex.test('user-name'), false, 'Hyphens not permitted by DB constraint');
      assert.equal(usernameRegex.test('user@name'), false, 'Special symbols not allowed');
      assert.equal(usernameRegex.test('user name'), false, 'Spaces not allowed');
    });
  });

  describe('updateProfileSchema Validation', () => {
    it('should validate valid profile update payloads', () => {
      const validPayload = {
        firstName: 'Bernadette',
        lastName: 'Cruz',
        username: 'bernadette_c',
        bio: 'BS Computer Science student',
        avatarUrl: 'https://example.com/avatar.jpg',
      };
      const parsed = updateProfileSchema.parse(validPayload);
      assert.equal(parsed.firstName, 'Bernadette');
      assert.equal(parsed.lastName, 'Cruz');
      assert.equal(parsed.username, 'bernadette_c');
    });

    it('should reject invalid avatarUrl or invalid username format', () => {
      assert.throws(
        () => updateProfileSchema.parse({ username: 'ab' }),
        /Username must be at least 3 characters/
      );
      assert.throws(
        () => updateProfileSchema.parse({ avatarUrl: 'not-a-valid-url' }),
        /Avatar URL must be a valid URL/
      );
    });
  });

  describe('updateNotificationPreferencesSchema Validation', () => {
    it('should accept camelCase preferences', () => {
      const parsed = updateNotificationPreferencesSchema.parse({
        notifyFriendRequests: false,
        notifyRequestAccepted: true,
      });
      assert.equal(parsed.notifyFriendRequests, false);
      assert.equal(parsed.notifyRequestAccepted, true);
    });

    it('should accept frontend aliases', () => {
      const parsed = updateNotificationPreferencesSchema.parse({
        newFriendRequests: true,
        friendsScheduleUpdates: false,
      });
      assert.equal(parsed.newFriendRequests, true);
      assert.equal(parsed.friendsScheduleUpdates, false);
    });

    it('should reject completely empty preference payloads', () => {
      assert.throws(
        () => updateNotificationPreferencesSchema.parse({}),
        /At least one notification preference must be provided/
      );
    });
  });

  describe('updateScheduleVisibilitySchema Validation', () => {
    it('should validate canonical visibility options', () => {
      const parsed = updateScheduleVisibilitySchema.parse({
        scheduleVisibility: 'friends_only',
      });
      assert.equal(parsed.scheduleVisibility, 'friends_only');
    });

    it('should validate visibility aliases and friend/group UUIDs', () => {
      const validUuid1 = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const validUuid2 = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

      const parsed = updateScheduleVisibilitySchema.parse({
        scheduleVisibility: 'private',
        selectedFriendIds: [validUuid1],
        selectedGroupIds: [validUuid2],
      });
      assert.equal(parsed.scheduleVisibility, 'private');
      assert.equal(parsed.selectedFriendIds?.length, 1);
    });

    it('should reject malformed UUIDs in selectedFriendIds', () => {
      assert.throws(
        () =>
          updateScheduleVisibilitySchema.parse({
            scheduleVisibility: 'selected_friends',
            selectedFriendIds: ['not-a-uuid'],
          }),
        /Friend ID must be a valid UUID/
      );
    });
  });

  describe('Helper Functions', () => {
    it('normalizeVisibilityOption should map aliases accurately', () => {
      assert.equal(normalizeVisibilityOption('private'), 'only_me');
      assert.equal(normalizeVisibilityOption('only_me'), 'only_me');
      assert.equal(normalizeVisibilityOption('friends'), 'friends_only');
      assert.equal(normalizeVisibilityOption('friends_only'), 'friends_only');
      assert.equal(normalizeVisibilityOption('selected_friends'), 'selected_friends');
      assert.equal(normalizeVisibilityOption('selected_groups'), 'selected_friends');
      assert.equal(normalizeVisibilityOption('public'), 'selected_friends');
      assert.equal(normalizeVisibilityOption(undefined), 'friends_only');
    });

    it('computeInitials should produce accurate display initials', () => {
      assert.equal(computeInitials('Bernadette', 'Cruz'), 'BC');
      assert.equal(computeInitials('', '', 'Bernadette Cruz'), 'BC');
      assert.equal(computeInitials('', '', 'SingleName'), 'SI');
      assert.equal(computeInitials('', '', ''), 'U');
    });
  });

  describe('ProfileService Mock Tests', () => {
    it('getProfileByUserId should throw 404 AppError when profile is missing', async () => {
      const mockSupabase: any = {
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        }),
      };

      await assert.rejects(
        async () => {
          await ProfileService.getProfileByUserId(
            mockSupabase,
            '00000000-0000-0000-0000-000000000001'
          );
        },
        (err: any) => {
          return err instanceof AppError && err.statusCode === 404 && err.code === 'PROFILE_NOT_FOUND';
        }
      );
    });

    it('updateProfileDetails should throw 409 AppError when username is already taken', async () => {
      const mockUserId = '11111111-1111-1111-1111-111111111111';
      const mockSupabase: any = {
        from: (table: string) => {
          if (table === 'profiles') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: mockUserId,
                      username: 'current_user',
                      first_name: 'Current',
                      last_name: 'User',
                      full_name: 'Current User',
                    },
                    error: null,
                  }),
                }),
                ilike: () => ({
                  neq: () => ({
                    maybeSingle: async () => ({
                      data: { id: 'other-user-id' },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        },
      };

      await assert.rejects(
        async () => {
          await ProfileService.updateProfileDetails(mockSupabase, mockUserId, {
            username: 'taken_user',
          });
        },
        (err: any) => {
          return err instanceof AppError && err.statusCode === 409 && err.code === 'USERNAME_TAKEN';
        }
      );
    });
  });
});

describe('[BE-04] HTTP Integration - Endpoint & Route Protection Tests', () => {
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

  it('GET /api/health should return 200 OK', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.status, 'ok');
  });

  it('GET /api/profile should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/profile`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('GET /api/profile/me should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/profile/me`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('PATCH /api/profile should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'Test' }),
    });
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('GET /api/profile/notifications should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/profile/notifications`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('PATCH /api/profile/notifications should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/profile/notifications`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifyFriendRequests: true }),
    });
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('GET /api/profile/visibility should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/profile/visibility`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('PUT /api/profile/visibility should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/profile/visibility`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleVisibility: 'friends_only' }),
    });
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('GET /api/profile/:identifier for non-existent user should return 404 PROFILE_NOT_FOUND', async () => {
    const res = await fetch(`${baseUrl}/api/profile/non_existent_mock_user_9999`);
    assert.equal(res.status, 404);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'PROFILE_NOT_FOUND');
  });
});
