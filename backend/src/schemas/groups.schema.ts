import { z } from 'zod';

export const uuidSchema = z
  .string()
  .uuid({ message: 'Invalid ID: must be a valid UUID.' });

/**
 * Payload schema for creating a friend group
 * POST /api/groups
 */
export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Group name is required and cannot be empty.' })
    .max(50, { message: 'Group name cannot exceed 50 characters.' }),
  memberIds: z
    .array(uuidSchema, {
      message: 'Each memberId must be a valid UUID.',
    })
    .optional()
    .default([]),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type CreateGroupRawInput = z.input<typeof createGroupSchema>;

/**
 * Payload schema for updating / renaming a friend group
 * PATCH /api/groups/:id
 * PUT /api/groups/:id
 */
export const updateGroupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: 'Group name cannot be empty.' })
      .max(50, { message: 'Group name cannot exceed 50 characters.' })
      .optional(),
    memberIds: z
      .array(uuidSchema, {
        message: 'Each memberId must be a valid UUID.',
      })
      .optional(),
  })
  .refine(
    (data) => data.name !== undefined || data.memberIds !== undefined,
    {
      message: 'At least one field (name or memberIds) must be provided for update.',
    }
  );

export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;

/**
 * Route parameter schema for group by ID
 * GET /api/groups/:id
 * PATCH /api/groups/:id
 * PUT /api/groups/:id
 * DELETE /api/groups/:id
 * GET /api/groups/:id/members
 * POST /api/groups/:id/members
 */
export const groupIdParamsSchema = z.object({
  id: uuidSchema,
});

export type GroupIdParams = z.infer<typeof groupIdParamsSchema>;

/**
 * Route parameter schema for group member actions
 * DELETE /api/groups/:id/members/:memberId
 */
export const groupMemberParamsSchema = z.object({
  id: uuidSchema,
  memberId: uuidSchema,
});

export type GroupMemberParams = z.infer<typeof groupMemberParamsSchema>;

/**
 * Payload schema for adding member(s) to a friend group
 * POST /api/groups/:id/members
 */
export const addGroupMemberSchema = z
  .object({
    memberId: uuidSchema.optional(),
    userId: uuidSchema.optional(),
    memberIds: z.array(uuidSchema).optional(),
  })
  .refine(
    (data) =>
      Boolean(
        data.memberId ||
          data.userId ||
          (data.memberIds && data.memberIds.length > 0)
      ),
    {
      message: 'A memberId, userId, or non-empty memberIds array must be provided.',
      path: ['memberId'],
    }
  );

export type AddGroupMemberInput = z.infer<typeof addGroupMemberSchema>;
