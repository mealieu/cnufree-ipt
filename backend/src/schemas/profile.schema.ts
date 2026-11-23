import { z } from 'zod';

/**
 * Validates usernames: 3-30 characters, alphanumeric and underscores only.
 * Matches PostgreSQL check constraint: CHECK (username ~ '^[a-zA-Z0-9_]{3,30}$')
 */
export const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;

export const scheduleVisibilityEnum = z.enum([
  'only_me',
  'friends_only',
  'selected_friends',
  'private',
  'friends',
  'public',
]);

export const canonicalVisibilityEnum = z.enum([
  'only_me',
  'friends_only',
  'selected_friends',
]);

export type CanonicalScheduleVisibility = z.infer<typeof canonicalVisibilityEnum>;

export const accessLevelEnum = z.enum(['full_view', 'free_only', 'busy_only']);

export type ScheduleAccessLevel = z.infer<typeof accessLevelEnum>;

export const permissionEntityInputSchema = z
  .object({
    targetUserId: z.string().uuid('targetUserId must be a valid UUID.').optional(),
    targetGroupId: z.string().uuid('targetGroupId must be a valid UUID.').optional(),
    accessLevel: accessLevelEnum.default('free_only'),
  })
  .refine(
    (data) =>
      (data.targetUserId && !data.targetGroupId) ||
      (!data.targetUserId && data.targetGroupId),
    {
      message:
        'Each permission entity must specify either targetUserId or targetGroupId, but not both or neither.',
    }
  );

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required.')
    .max(50, 'First name cannot exceed 50 characters.')
    .optional(),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required.')
    .max(50, 'Last name cannot exceed 50 characters.')
    .optional(),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(30, 'Username cannot exceed 30 characters.')
    .regex(usernameRegex, 'Username can only contain letters, numbers, and underscores.')
    .optional(),
  avatarUrl: z
    .string()
    .url('Avatar URL must be a valid URL.')
    .nullable()
    .optional()
    .or(z.literal('')),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters.').optional(),
  notificationPreferences: z
    .object({
      notifyFriendRequests: z.boolean().optional(),
      notifyRequestAccepted: z.boolean().optional(),
      notifyScheduleUpdates: z.boolean().optional(),
      newFriendRequests: z.boolean().optional(),
      friendRequestAccepted: z.boolean().optional(),
      friendsScheduleUpdates: z.boolean().optional(),
    })
    .optional(),
  scheduleVisibility: scheduleVisibilityEnum.optional(),
  selectedFriendIds: z
    .array(z.string().uuid('Friend ID must be a valid UUID.'))
    .optional(),
  selectedGroupIds: z
    .array(z.string().uuid('Group ID must be a valid UUID.'))
    .optional(),
  permissions: z.array(permissionEntityInputSchema).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updateNotificationPreferencesSchema = z
  .object({
    notifyFriendRequests: z.boolean().optional(),
    notifyRequestAccepted: z.boolean().optional(),
    notifyScheduleUpdates: z.boolean().optional(),
    newFriendRequests: z.boolean().optional(),
    friendRequestAccepted: z.boolean().optional(),
    friendsScheduleUpdates: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.notifyFriendRequests !== undefined ||
      data.notifyRequestAccepted !== undefined ||
      data.notifyScheduleUpdates !== undefined ||
      data.newFriendRequests !== undefined ||
      data.friendRequestAccepted !== undefined ||
      data.friendsScheduleUpdates !== undefined,
    {
      message: 'At least one notification preference must be provided.',
    }
  );

export type UpdateNotificationPreferencesInput = z.infer<
  typeof updateNotificationPreferencesSchema
>;

export const updateScheduleVisibilitySchema = z.object({
  scheduleVisibility: scheduleVisibilityEnum,
  selectedFriendIds: z
    .array(z.string().uuid('Friend ID must be a valid UUID.'))
    .optional(),
  selectedGroupIds: z
    .array(z.string().uuid('Group ID must be a valid UUID.'))
    .optional(),
  permissions: z.array(permissionEntityInputSchema).optional(),
});

export type UpdateScheduleVisibilityInput = z.infer<
  typeof updateScheduleVisibilitySchema
>;

export const profileIdentifierParamsSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Identifier parameter cannot be empty.')
    .max(100, 'Identifier parameter is too long.'),
});

export type ProfileIdentifierParams = z.infer<
  typeof profileIdentifierParamsSchema
>;

/**
 * Normalizes frontend / API visibility aliases to PostgreSQL database constraint values:
 * 'only_me' | 'friends_only' | 'selected_friends'
 */
export function normalizeVisibilityOption(raw?: string): CanonicalScheduleVisibility {
  if (!raw) return 'friends_only';
  const cleaned = raw.toLowerCase().trim().replace(/-/g, '_');
  if (cleaned === 'only_me' || cleaned === 'private') {
    return 'only_me';
  }
  if (
    cleaned === 'selected_friends' ||
    cleaned === 'selected_groups' ||
    cleaned === 'public'
  ) {
    return 'selected_friends';
  }
  return 'friends_only';
}
