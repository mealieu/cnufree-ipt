import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../app';
import { AppError } from '../middleware/errorHandler';
import {
  addGroupMemberSchema,
  createGroupSchema,
  groupIdParamsSchema,
  groupMemberParamsSchema,
  updateGroupSchema,
} from '../schemas/groups.schema';
import { GroupsService } from '../services/groups.service';

describe('[BE-07] Friend Group Management - Unit & Schema Tests', () => {
  describe('createGroupSchema Validation', () => {
    it('should validate valid group creation payloads', () => {
      const valid = createGroupSchema.parse({
        name: 'Blockmates',
      });
      assert.equal(valid.name, 'Blockmates');
      assert.deepEqual(valid.memberIds, []);

      const validWithMembers = createGroupSchema.parse({
        name: 'Study Group',
        memberIds: ['11111111-1111-1111-1111-111111111111'],
      });
      assert.equal(validWithMembers.name, 'Study Group');
      assert.equal(validWithMembers.memberIds?.length, 1);
    });

    it('should reject empty or whitespace-only group names', () => {
      assert.throws(
        () => createGroupSchema.parse({ name: '' }),
        /Group name is required and cannot be empty/
      );
      assert.throws(
        () => createGroupSchema.parse({ name: '   ' }),
        /Group name is required and cannot be empty/
      );
    });

    it('should reject group names exceeding 50 characters', () => {
      assert.throws(
        () => createGroupSchema.parse({ name: 'A'.repeat(51) }),
        /Group name cannot exceed 50 characters/
      );
    });

    it('should reject malformed UUIDs in memberIds', () => {
      assert.throws(
        () =>
          createGroupSchema.parse({
            name: 'Valid Name',
            memberIds: ['not-a-uuid'],
          }),
        /must be a valid UUID/
      );
    });
  });

  describe('updateGroupSchema Validation', () => {
    it('should validate partial update payloads', () => {
      const parsedName = updateGroupSchema.parse({ name: 'Renamed Group' });
      assert.equal(parsedName.name, 'Renamed Group');

      const parsedMembers = updateGroupSchema.parse({
        memberIds: ['22222222-2222-2222-2222-222222222222'],
      });
      assert.equal(parsedMembers.memberIds?.length, 1);
    });

    it('should reject completely empty update payloads', () => {
      assert.throws(
        () => updateGroupSchema.parse({}),
        /At least one field \(name or memberIds\) must be provided/
      );
    });

    it('should reject names longer than 50 characters on update', () => {
      assert.throws(
        () => updateGroupSchema.parse({ name: 'X'.repeat(51) }),
        /Group name cannot exceed 50 characters/
      );
    });
  });

  describe('UUID Parameter Schemas Validation', () => {
    it('groupIdParamsSchema should accept valid UUID and reject invalid', () => {
      const validUuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const parsed = groupIdParamsSchema.parse({ id: validUuid });
      assert.equal(parsed.id, validUuid);

      assert.throws(() => groupIdParamsSchema.parse({ id: 'bad-uuid' }));
    });

    it('groupMemberParamsSchema should validate both group id and memberId', () => {
      const gId = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
      const mId = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
      const parsed = groupMemberParamsSchema.parse({ id: gId, memberId: mId });
      assert.equal(parsed.id, gId);
      assert.equal(parsed.memberId, mId);

      assert.throws(() =>
        groupMemberParamsSchema.parse({ id: gId, memberId: 'invalid' })
      );
    });
  });

  describe('addGroupMemberSchema Validation', () => {
    it('should accept memberId, userId, or memberIds array', () => {
      const mId = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';
      const parsed1 = addGroupMemberSchema.parse({ memberId: mId });
      assert.equal(parsed1.memberId, mId);

      const parsed2 = addGroupMemberSchema.parse({ userId: mId });
      assert.equal(parsed2.userId, mId);

      const parsed3 = addGroupMemberSchema.parse({ memberIds: [mId] });
      assert.equal(parsed3.memberIds?.length, 1);
    });

    it('should reject empty payloads', () => {
      assert.throws(
        () => addGroupMemberSchema.parse({}),
        /A memberId, userId, or non-empty memberIds array must be provided/
      );
    });
  });

  describe('GroupsService Mock Unit Tests', () => {
    const ownerId = '11111111-1111-1111-1111-111111111111';
    const groupId = '22222222-2222-2222-2222-222222222222';
    const memberId = '33333333-3333-3333-3333-333333333333';

    it('getGroupById should throw 404 GROUP_NOT_FOUND when group does not exist', async () => {
      const mockSupabase: any = {
        from: (table: string) => {
          if (table === 'friend_groups') {
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
          return {};
        },
      };

      await assert.rejects(
        async () => {
          await GroupsService.getGroupById(mockSupabase, ownerId, groupId);
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 404 &&
          err.code === 'GROUP_NOT_FOUND'
      );
    });

    it('createGroup should throw 409 GROUP_NAME_EXISTS when group name is already taken by owner', async () => {
      const mockSupabase: any = {
        from: (table: string) => {
          if (table === 'friend_groups') {
            return {
              select: () => ({
                eq: () => ({
                  ilike: () => ({
                    maybeSingle: async () => ({
                      data: { id: 'existing-group-id' },
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
          await GroupsService.createGroup(mockSupabase, ownerId, {
            name: 'Existing Group',
          });
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 409 &&
          err.code === 'GROUP_NAME_EXISTS'
      );
    });

    it('updateGroup should throw 409 GROUP_NAME_EXISTS when renaming to a name already used by another group', async () => {
      const mockSupabase: any = {
        from: (table: string) => {
          if (table === 'friend_groups') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: async () => ({
                      data: {
                        id: groupId,
                        owner_id: ownerId,
                        name: 'Original Name',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      },
                      error: null,
                    }),
                  }),
                  ilike: () => ({
                    neq: () => ({
                      maybeSingle: async () => ({
                        data: { id: 'another-group-id' },
                        error: null,
                      }),
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
          await GroupsService.updateGroup(mockSupabase, ownerId, groupId, {
            name: 'Taken Name',
          });
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 409 &&
          err.code === 'GROUP_NAME_EXISTS'
      );
    });

    it('addMembers should reject adding only self (INVALID_MEMBER)', async () => {
      const mockSupabase: any = {
        from: (table: string) => {
          if (table === 'friend_groups') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: async () => ({
                      data: { id: groupId, owner_id: ownerId, name: 'Group' },
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
          await GroupsService.addMembers(mockSupabase, ownerId, groupId, {
            memberId: ownerId,
          });
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 400 &&
          err.code === 'INVALID_MEMBER'
      );
    });

    it('addMembers should reject when candidate member profile is missing (USER_NOT_FOUND)', async () => {
      const mockSupabase: any = {
        from: (table: string) => {
          if (table === 'friend_groups') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: async () => ({
                      data: { id: groupId, owner_id: ownerId, name: 'Group' },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'profiles') {
            return {
              select: () => ({
                in: async () => ({ data: [], error: null }),
              }),
            };
          }
          return {};
        },
      };

      await assert.rejects(
        async () => {
          await GroupsService.addMembers(mockSupabase, ownerId, groupId, {
            memberId,
          });
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 404 &&
          err.code === 'USER_NOT_FOUND'
      );
    });

    it('addMembers should reject when candidate is blocked (USER_BLOCKED)', async () => {
      const mockSupabase: any = {
        from: (table: string) => {
          if (table === 'friend_groups') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: async () => ({
                      data: { id: groupId, owner_id: ownerId, name: 'Group' },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'profiles') {
            return {
              select: () => ({
                in: async () => ({
                  data: [{ id: memberId }],
                  error: null,
                }),
              }),
            };
          }
          if (table === 'blocked_users') {
            return {
              select: () => ({
                or: async () => ({
                  data: [{ blocker_id: ownerId, blocked_id: memberId }],
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
          await GroupsService.addMembers(mockSupabase, ownerId, groupId, {
            memberId,
          });
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 403 &&
          err.code === 'USER_BLOCKED'
      );
    });

    it('addMembers should reject when single member is already in group (MEMBER_ALREADY_IN_GROUP)', async () => {
      const mockSupabase: any = {
        from: (table: string) => {
          if (table === 'friend_groups') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: async () => ({
                      data: { id: groupId, owner_id: ownerId, name: 'Group' },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'profiles') {
            return {
              select: () => ({
                in: async () => ({
                  data: [{ id: memberId }],
                  error: null,
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
          if (table === 'friend_group_members') {
            return {
              select: () => ({
                eq: () => ({
                  in: async () => ({
                    data: [{ member_id: memberId }],
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
          await GroupsService.addMembers(mockSupabase, ownerId, groupId, {
            memberId,
          });
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 409 &&
          err.code === 'MEMBER_ALREADY_IN_GROUP'
      );
    });

    it('removeMember should throw 404 MEMBER_NOT_FOUND when member is not in the group', async () => {
      const mockSupabase: any = {
        from: (table: string) => {
          if (table === 'friend_groups') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: async () => ({
                      data: { id: groupId, owner_id: ownerId, name: 'Group' },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'friend_group_members') {
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
          await GroupsService.removeMember(
            mockSupabase,
            ownerId,
            groupId,
            memberId
          );
        },
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 404 &&
          err.code === 'MEMBER_NOT_FOUND'
      );
    });
  });
});

describe('[BE-07] HTTP Integration - Endpoint & Route Protection Tests', () => {
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

  it('GET /api/groups should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/groups`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('POST /api/groups should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(`${baseUrl}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Group' }),
    });
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('GET /api/groups/:id should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(
      `${baseUrl}/api/groups/00000000-0000-0000-0000-000000000001`
    );
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('PATCH /api/groups/:id should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(
      `${baseUrl}/api/groups/00000000-0000-0000-0000-000000000001`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Renamed' }),
      }
    );
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('DELETE /api/groups/:id should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(
      `${baseUrl}/api/groups/00000000-0000-0000-0000-000000000001`,
      { method: 'DELETE' }
    );
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('GET /api/groups/:id/members should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(
      `${baseUrl}/api/groups/00000000-0000-0000-0000-000000000001/members`
    );
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('POST /api/groups/:id/members should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(
      `${baseUrl}/api/groups/00000000-0000-0000-0000-000000000001/members`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: '00000000-0000-0000-0000-000000000002',
        }),
      }
    );
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('DELETE /api/groups/:id/members/:memberId should return 401 UNAUTHORIZED without token', async () => {
    const res = await fetch(
      `${baseUrl}/api/groups/00000000-0000-0000-0000-000000000001/members/00000000-0000-0000-0000-000000000002`,
      { method: 'DELETE' }
    );
    assert.equal(res.status, 401);
    const body = (await res.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });
});
