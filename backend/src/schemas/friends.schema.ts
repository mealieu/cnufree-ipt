import { z } from 'zod';

export const uuidSchema = z
  .string()
  .uuid({ message: 'Invalid ID: must be a valid UUID.' });

export const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;

/**
 * Query schema for user search / friend discovery
 * GET /api/friends/search
 */
export const searchUsersQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .optional()
    .default(''),
  query: z
    .string()
    .trim()
    .optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
      message: 'Limit must be an integer between 1 and 100.',
    }),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: 'Offset must be a non-negative integer.',
    }),
});

export type SearchUsersQueryInput = z.infer<typeof searchUsersQuerySchema>;

/**
 * Payload schema for sending a friend request
 * POST /api/friends/requests
 */
export const sendFriendRequestSchema = z
  .object({
    receiverId: z.string().uuid({ message: 'receiverId must be a valid UUID.' }).optional(),
    targetUserId: z.string().uuid({ message: 'targetUserId must be a valid UUID.' }).optional(),
    username: z
      .string()
      .trim()
      .regex(usernameRegex, {
        message: 'Username must be 3-30 characters containing only letters, numbers, and underscores.',
      })
      .optional(),
  })
  .refine(
    (data) => Boolean(data.receiverId || data.targetUserId || data.username),
    {
      message: 'A receiverId, targetUserId, or username must be provided.',
      path: ['receiverId'],
    }
  );

export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;

/**
 * Route parameter schema for friend request actions
 * POST /api/friends/requests/:id/accept
 * POST /api/friends/requests/:id/decline
 * POST /api/friends/requests/:id/cancel
 * DELETE /api/friends/requests/:id
 */
export const requestIdParamsSchema = z.object({
  id: uuidSchema,
});

export type RequestIdParams = z.infer<typeof requestIdParamsSchema>;

/**
 * Route parameter schema for unfriend / remove friend
 * DELETE /api/friends/:friendId
 */
export const friendIdParamsSchema = z.object({
  friendId: uuidSchema,
});

export type FriendIdParams = z.infer<typeof friendIdParamsSchema>;

/**
 * Payload schema for blocking a user
 * POST /api/friends/block
 */
export const blockUserSchema = z
  .object({
    userId: z.string().uuid({ message: 'userId must be a valid UUID.' }).optional(),
    targetUserId: z.string().uuid({ message: 'targetUserId must be a valid UUID.' }).optional(),
  })
  .refine((data) => Boolean(data.userId || data.targetUserId), {
    message: 'A userId or targetUserId must be provided to block a user.',
    path: ['userId'],
  });

export type BlockUserInput = z.infer<typeof blockUserSchema>;

/**
 * Route parameter schema for user actions (e.g. unblock)
 * DELETE /api/friends/block/:userId
 */
export const userIdParamsSchema = z.object({
  userId: uuidSchema,
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>;

/**
 * Query schema for listing friend requests
 * GET /api/friends/requests
 */
export const listFriendRequestsQuerySchema = z.object({
  direction: z
    .enum(['received', 'sent', 'all'])
    .optional()
    .default('received'),
  status: z
    .enum(['pending', 'accepted', 'declined', 'cancelled', 'all'])
    .optional()
    .default('pending'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
      message: 'Limit must be an integer between 1 and 100.',
    }),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: 'Offset must be a non-negative integer.',
    }),
});

export type ListFriendRequestsQueryInput = z.infer<
  typeof listFriendRequestsQuerySchema
>;
