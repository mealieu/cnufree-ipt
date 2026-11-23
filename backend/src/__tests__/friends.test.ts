import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../app';
import { AppError } from '../middleware/errorHandler';
import {
  blockUserSchema,
  friendIdParamsSchema,
  listFriendRequestsQuerySchema,
  requestIdParamsSchema,
  searchUsersQuerySchema,
  sendFriendRequestSchema,
  userIdParamsSchema,
} from '../schemas/friends.schema';
import {
  FriendsService,
  getCanonicalPair,
} from '../services/friends.service';

describe('[BE-06] Friend Discovery & Connection - Unit & Schema Tests', () => {
  describe('Canonical Pair Ordering', () => {
    it('should always order user_id_1 < user_id_2', () => {
      const uA = '11111111-1111-1111-1111-111111111111';
      const uB = '99999999-9999-9999-9999-999999999999';

      const pair1 = getCanonicalPair(uA, uB);
      assert.equal(pair1.user1, uA);
      assert.equal(pair1.user2, uB);

      const pair2 = getCanonicalPair(uB, uA);
      assert.equal(pair2.user1, uA);
      assert.equal(pair2.user2, uB);
    });
  });

  describe('searchUsersQuerySchema Validation', () => {
    it('should parse valid search query params and defaults', () => {
      const parsedDefault = searchUsersQuerySchema.parse({});
      assert.equal(parsedDefault.q, '');
      assert.equal(parsedDefault.limit, 20);
      assert.equal(parsedDefault.offset, 0);

      const parsedCustom = searchUsersQuerySchema.parse({
        q: 'deborah',
        limit: '15',
        offset: '30',
      });
      assert.equal(parsedCustom.q, 'deborah');
      assert.equal(parsedCustom.limit, 15);
      assert.equal(parsedCustom.offset, 30);
    });

    it('should reject invalid limit or offset values', () => {
      assert.throws(
        () => searchUsersQuerySchema.parse({ limit: '0' }),
        /Limit must be an integer between 1 and 100/
      );
      assert.throws(
        () => searchUsersQuerySchema.parse({ limit: '150' }),
        /Limit must be an integer between 1 and 100/
      );
      assert.throws(
        () => searchUsersQuerySchema.parse({ offset: '-5' }),
        /Offset must be a non-negative integer/
      );
    });
  });

  describe('sendFriendRequestSchema Validation', () => {
    it('should accept valid receiverId UUID', () => {
      const validUuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const parsed = sendFriendRequestSchema.parse({ receiverId: validUuid });
      assert.equal(parsed.receiverId, validUuid);
    });

    it('should accept valid username', () => {
      const parsed = sendFriendRequestSchema.parse({ username: 'kai_pagod' });
      assert.equal(parsed.username, 'kai_pagod');
    });

    it('should reject completely empty request payloads', () => {
      assert.throws(
        () => sendFriendRequestSchema.parse({}),
        /A receiverId, targetUserId, or username must be provided/
      );
    });

    it('should reject malformed UUIDs or invalid usernames', () => {
      assert.throws(
        () => sendFriendRequestSchema.parse({ receiverId: 'not-a-uuid' }),
        /receiverId must be a valid UUID/
      );
      assert.throws(
        () => sendFriendRequestSchema.parse({ username: 'ab' }),
        /Username must be 3-30 characters/
      );
    });
  });

  describe('UUID Parameter Schemas Validation', () => {
    it('requestIdParamsSchema should validate UUIDs', () => {
      const validUuid = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
      const parsed = requestIdParamsSchema.parse({ id: validUuid });
      assert.equal(parsed.id, validUuid);

      assert.throws(() => requestIdParamsSchema.parse({ id: 'invalid' }));
    });

    it('friendIdParamsSchema should validate UUIDs', () => {
      const validUuid = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';
      const parsed = friendIdParamsSchema.parse({ friendId: validUuid });
      assert.equal(parsed.friendId, validUuid);

      assert.throws(() => friendIdParamsSchema.parse({ friendId: 'bad' }));
    });

    it('userIdParamsSchema should validate UUIDs', () => {
      const validUuid = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55';
      const parsed = userIdParamsSchema.parse({ userId: validUuid });
      assert.equal(parsed.userId, validUuid);

      assert.throws(() => userIdParamsSchema.parse({ userId: 'bad' }));
    });
  });

  describe('blockUserSchema Validation', () => {
    it('should accept userId or targetUserId', () => {
      const validUuid = 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66';
      const parsed = blockUserSchema.parse({ targetUserId: validUuid });
      assert.equal(parsed.targetUserId, validUuid);
    });

    it('should reject empty block payloads', () => {
      assert.throws(
        () => blockUserSchema.parse({}),
        /A userId or targetUserId must be provided/
      );
    });
  });

  describe('listFriendRequestsQuerySchema Validation', () => {
    it('should accept valid direction and status filters', () => {
      const parsed = listFriendRequestsQuerySchema.parse({
        direction: 'sent',
        status: 'pending',
      });
      assert.equal(parsed.direction, 'sent');
      assert.equal(parsed.status, 'pending');
    });

    it('should reject unknown directions or statuses', () => {
      assert.throws(() =>
        listFriendRequestsQuerySchema.parse({ direction: 'invalid' as any })
      );
      assert.throws(() =>
        listFriendRequestsQuerySchema.parse({ status: 'invalid' as any })
      );
    });
  });

  describe('FriendsService Mock Unit Tests', () => {
    const callerId = '11111111-1111-1111-1111-111111111111';
    const targetId = '22222222-2222-2222-2222-222222222222';

    it('sendFriendRequest should block sending request to self (CANNOT_FRIEND_SELF)', async () => {
      const mockSupabase: any = {};
      await assert.rejects(
        async () => {
          await FriendsService.sendFriendRequest(mockSupabase, callerId, {
            receiverId: callerId,
          });
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 400 &&
          err.code === 'CANNOT_FRIEND_SELF'
      );
    });

    it('sendFriendRequest should reject if target user does not exist (USER_NOT_FOUND)', async () => {
      const mockSupabase: any = {
        from: (table: string) => {
          if (table === 'profiles') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: null, error: null }),
                }),
              }),
            };
          }
          return {};
        },
      };

      await assert.rejects(
        async () => {
          await FriendsService.sendFriendRequest(mockSupabase, callerId, {
            receiverId: targetId,
          });
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 404 &&
          err.code === 'USER_NOT_FOUND'
      );
    });

    it('sendFriendRequest should reject if blocked (USER_BLOCKED)', async () => {
      const mockSupabase: any = {
        from: (table: string) => {
          if (table === 'profiles') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: targetId,
                      username: 'target_user',
                      full_name: 'Target User',
                      first_name: 'Target',
                      last_name: 'User',
                      notify_friend_requests: true,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'blocked_users') {
            return {
              select: () => ({
                or: async () => ({
                  data: [{ blocker_id: targetId, blocked_id: callerId }],
                  error: null,
                }),
              }),
            };
          }
          return {};
        },
      };

      await assert.rejects(
        async () => {
          await FriendsService.sendFriendRequest(mockSupabase, callerId, {
            receiverId: targetId,
          });
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 403 &&
          err.code === 'USER_BLOCKED'
      );
    });

    it('sendFriendRequest should reject if already friends (ALREADY_FRIENDS)', async () => {
      const mockSupabase: any = {
        from: (table: string) => {
          if (table === 'profiles') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: targetId,
                      username: 'target_user',
                      full_name: 'Target User',
                      first_name: 'Target',
                      last_name: 'User',
                      notify_friend_requests: true,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'blocked_users') {
            return {
              select: () => ({
                or: async () => ({ data: [], error: null }),
              }),
            };
          }
          if (table === 'friendships') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: async () => ({
                      data: { id: 'f-1' },
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
          await FriendsService.sendFriendRequest(mockSupabase, callerId, {
            receiverId: targetId,
          });
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 409 &&
          err.code === 'ALREADY_FRIENDS'
      );
    });

    it('sendFriendRequest should reject if pending request already sent (FRIEND_REQUEST_EXISTS)', async () => {
      const mockSupabase: any = {
        from: (table: string) => {
          if (table === 'profiles') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: targetId,
                      username: 'target_user',
                      full_name: 'Target User',
                      first_name: 'Target',
                      last_name: 'User',
                      notify_friend_requests: true,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'blocked_users') {
            return {
              select: () => ({
                or: async () => ({ data: [], error: null }),
              }),
            };
          }
          if (table === 'friendships') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: async () => ({ data: null, error: null }),
                  }),
                }),
              }),
            };
          }
          if (table === 'friend_requests') {
            return {
              select: () => ({
                eq: (col1: string, val1: string) => ({
                  eq: (col2: string, val2: string) => ({
                    eq: () => ({
                      maybeSingle: async () => {
                        if (val1 === callerId && val2 === targetId) {
                          return { data: { id: 'existing-req-id' }, error: null };
                        }
                        return { data: null, error: null };
                      },
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
          await FriendsService.sendFriendRequest(mockSupabase, callerId, {
            receiverId: targetId,
          });
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 409 &&
          err.code === 'FRIEND_REQUEST_EXISTS'
      );
    });

    it('acceptFriendRequest should reject if caller is not the receiver (FORBIDDEN)', async () => {
      const mockSupabase: any = {
        from: (table: string) => {
          if (table === 'friend_requests') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: 'req-1',
                      sender_id: 'other-user',
                      receiver_id: 'not-caller-id',
                      status: 'pending',
                    },
                    error: null,
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
          await FriendsService.acceptFriendRequest(
            mockSupabase,
            callerId,
            'req-1'
          );
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 403 &&
          err.code === 'FORBIDDEN'
      );
    });

    it('acceptFriendRequest should reject if request is already accepted (ALREADY_ACCEPTED)', async () => {
      const mockSupabase: any = {
        from: (table: string) => {
          if (table === 'friend_requests') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: 'req-1',
                      sender_id: 'other-user',
                      receiver_id: callerId,
                      status: 'accepted',
                    },
                    error: null,
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
          await FriendsService.acceptFriendRequest(
            mockSupabase,
            callerId,
            'req-1'
          );
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 409 &&
          err.code === 'ALREADY_ACCEPTED'
      );
    });

    it('removeFriend should reject if user is not currently a friend (FRIENDSHIP_NOT_FOUND)', async () => {
      const mockSupabase: any = {
        from: (table: string) => {
          if (table === 'friendships') {
            return {
              delete: () => ({
                eq: () => ({
                  eq: () => ({
                    select: async () => ({ data: [], error: null }),
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
          await FriendsService.removeFriend(mockSupabase, callerId, targetId);
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 404 &&
          err.code === 'FRIENDSHIP_NOT_FOUND'
      );
    });

    it('blockUser should reject blocking oneself (CANNOT_BLOCK_SELF)', async () => {
      const mockSupabase: any = {};
      await assert.rejects(
        async () => {
          await FriendsService.blockUser(mockSupabase, callerId, callerId);
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 400 &&
          err.code === 'CANNOT_BLOCK_SELF'
      );
    });
  });
});

describe('[BE-06] HTTP Integration - Endpoint & Route Protection Tests', () => {
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

  it('GET /api/friends/search should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/friends/search?q=test`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('GET /api/friends/discover should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/friends/discover`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('GET /api/friends should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/friends`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('GET /api/friends/requests should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/friends/requests`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('POST /api/friends/requests should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/friends/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiverId: '00000000-0000-0000-0000-000000000001',
      }),
    });
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('POST /api/friends/requests/:id/accept should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(
      `${baseUrl}/api/friends/requests/00000000-0000-0000-0000-000000000001/accept`,
      { method: 'POST' }
    );
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('POST /api/friends/requests/:id/decline should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(
      `${baseUrl}/api/friends/requests/00000000-0000-0000-0000-000000000001/decline`,
      { method: 'POST' }
    );
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('DELETE /api/friends/:friendId should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(
      `${baseUrl}/api/friends/00000000-0000-0000-0000-000000000001`,
      { method: 'DELETE' }
    );
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('POST /api/friends/block should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/friends/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetUserId: '00000000-0000-0000-0000-000000000001',
      }),
    });
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('DELETE /api/friends/block/:userId should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(
      `${baseUrl}/api/friends/block/00000000-0000-0000-0000-000000000001`,
      { method: 'DELETE' }
    );
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('GET /api/friends/blocked should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/friends/blocked`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });
});
