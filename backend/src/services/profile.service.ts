import { TypedSupabaseClient } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import {
  CanonicalScheduleVisibility,
  normalizeVisibilityOption,
  UpdateNotificationPreferencesInput,
  UpdateProfileInput,
  UpdateScheduleVisibilityInput,
} from '../schemas/profile.schema';
import { Database } from '../types/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type SchedulePermissionRow = Database['public']['Tables']['schedule_permissions']['Row'];
type SchedulePermissionInsert = Database['public']['Tables']['schedule_permissions']['Insert'];

export interface FormattedNotificationPreferences {
  notifyFriendRequests: boolean;
  notifyRequestAccepted: boolean;
  notifyScheduleUpdates: boolean;
  // Aliases matching frontend NotificationPreferences (src/types/profile.ts)
  newFriendRequests: boolean;
  friendRequestAccepted: boolean;
  friendsScheduleUpdates: boolean;
}

export interface FormattedPermissionItem {
  id: string;
  ownerId: string;
  targetUserId: string | null;
  targetGroupId: string | null;
  accessLevel: string;
  targetUser?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
  targetGroup?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface FormattedScheduleVisibility {
  scheduleVisibility: CanonicalScheduleVisibility;
  selectedFriendIds: string[];
  selectedGroupIds: string[];
  permissions: FormattedPermissionItem[];
}

export interface UserProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
  bio: string;
  scheduleVisibility: CanonicalScheduleVisibility;
  notificationPreferences: FormattedNotificationPreferences;
  selectedFriendIds: string[];
  selectedGroupIds: string[];
  schedulePermissions: FormattedPermissionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicProfileResponse {
  id: string;
  username: string;
  fullName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  initials: string;
  bio: string;
  scheduleVisibility: string;
}

/**
 * Computes display initials (e.g., 'BC' for 'Bernadette Cruz').
 */
export function computeInitials(
  firstName?: string | null,
  lastName?: string | null,
  fullName?: string | null
): string {
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();
  if (first && last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }
  const full = (fullName || '').trim();
  if (full) {
    const parts = full.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    if (parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return parts[0].toUpperCase();
  }
  return 'U';
}

function formatNotificationPreferences(
  row: Pick<
    ProfileRow,
    'notify_friend_requests' | 'notify_request_accepted' | 'notify_schedule_updates'
  >
): FormattedNotificationPreferences {
  return {
    notifyFriendRequests: row.notify_friend_requests,
    notifyRequestAccepted: row.notify_request_accepted,
    notifyScheduleUpdates: row.notify_schedule_updates,
    newFriendRequests: row.notify_friend_requests,
    friendRequestAccepted: row.notify_request_accepted,
    friendsScheduleUpdates: row.notify_schedule_updates,
  };
}

function formatPermissions(
  rows: Array<
    SchedulePermissionRow & {
      target_user?: {
        id: string;
        username: string;
        full_name: string;
        avatar_url: string | null;
      } | null;
      target_group?: {
        id: string;
        name: string;
      } | null;
    }
  >
): FormattedPermissionItem[] {
  return rows.map((p) => ({
    id: p.id,
    ownerId: p.owner_id,
    targetUserId: p.target_user_id,
    targetGroupId: p.target_group_id,
    accessLevel: p.access_level,
    targetUser: p.target_user
      ? {
          id: p.target_user.id,
          username: p.target_user.username,
          fullName: p.target_user.full_name,
          avatarUrl: p.target_user.avatar_url,
        }
      : undefined,
    targetGroup: p.target_group
      ? {
          id: p.target_group.id,
          name: p.target_group.name,
        }
      : undefined,
    createdAt: p.created_at,
  }));
}

function formatUserProfile(
  profile: ProfileRow,
  permissions: Array<any> = []
): UserProfileResponse {
  const formattedPermissions = formatPermissions(permissions);
  const selectedFriendIds = formattedPermissions
    .filter((p) => p.targetUserId !== null)
    .map((p) => p.targetUserId as string);
  const selectedGroupIds = formattedPermissions
    .filter((p) => p.targetGroupId !== null)
    .map((p) => p.targetGroupId as string);

  return {
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    fullName: profile.full_name,
    username: profile.username,
    email: profile.email,
    avatarUrl: profile.avatar_url,
    initials: computeInitials(
      profile.first_name,
      profile.last_name,
      profile.full_name
    ),
    bio: profile.bio,
    scheduleVisibility: normalizeVisibilityOption(profile.schedule_visibility),
    notificationPreferences: formatNotificationPreferences(profile),
    selectedFriendIds,
    selectedGroupIds,
    schedulePermissions: formattedPermissions,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

/**
 * Service to manage User Profile, Notification Preferences, and Schedule Visibility Rules.
 */
export class ProfileService {
  /**
   * Fetches the complete profile and settings for the authenticated user.
   */
  static async getProfileByUserId(
    supabase: TypedSupabaseClient,
    userId: string
  ): Promise<UserProfileResponse> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to fetch user profile.',
        error.message
      );
    }

    if (!profile) {
      throw new AppError(
        404,
        'PROFILE_NOT_FOUND',
        'User profile does not exist.'
      );
    }

    const { data: permissions } = await supabase
      .from('schedule_permissions')
      .select(
        `
        id,
        owner_id,
        target_user_id,
        target_group_id,
        access_level,
        created_at,
        target_user:profiles!schedule_permissions_target_user_id_fkey(id, username, full_name, avatar_url),
        target_group:friend_groups!schedule_permissions_target_group_id_fkey(id, name)
      `
      )
      .eq('owner_id', userId);

    return formatUserProfile(profile, permissions || []);
  }

  /**
   * Updates personal details, notification preferences, and/or schedule visibility rules.
   */
  static async updateProfileDetails(
    supabase: TypedSupabaseClient,
    userId: string,
    payload: UpdateProfileInput
  ): Promise<UserProfileResponse> {
    // 1. Fetch current profile to ensure existence and handle partial name calculation
    const { data: currentProfile, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (fetchErr) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to check current profile before update.',
        fetchErr.message
      );
    }

    if (!currentProfile) {
      throw new AppError(
        404,
        'PROFILE_NOT_FOUND',
        'Cannot update a non-existent profile.'
      );
    }

    // 2. Validate username uniqueness if changed
    if (
      payload.username &&
      payload.username.toLowerCase() !== currentProfile.username.toLowerCase()
    ) {
      const { data: existing, error: checkErr } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', payload.username)
        .neq('id', userId)
        .maybeSingle();

      if (checkErr) {
        throw new AppError(
          500,
          'DATABASE_ERROR',
          'Failed to verify username availability.',
          checkErr.message
        );
      }

      if (existing) {
        throw new AppError(
          409,
          'USERNAME_TAKEN',
          `The username "${payload.username}" is already in use by another user.`
        );
      }
    }

    // 3. Prepare column updates
    const updates: ProfileUpdate = {};

    let newFirst = currentProfile.first_name;
    let newLast = currentProfile.last_name;
    let nameChanged = false;

    if (payload.firstName !== undefined) {
      newFirst = payload.firstName.trim();
      updates.first_name = newFirst;
      nameChanged = true;
    }

    if (payload.lastName !== undefined) {
      newLast = payload.lastName.trim();
      updates.last_name = newLast;
      nameChanged = true;
    }

    if (nameChanged) {
      const computedFull = `${newFirst} ${newLast}`.trim();
      updates.full_name = computedFull || currentProfile.full_name;
    }

    if (payload.username !== undefined) {
      updates.username = payload.username.trim();
    }

    if (payload.avatarUrl !== undefined) {
      updates.avatar_url = payload.avatarUrl ? payload.avatarUrl.trim() : null;
    }

    if (payload.bio !== undefined) {
      updates.bio = payload.bio.trim();
    }

    // Notification preferences if provided in profile payload
    if (payload.notificationPreferences) {
      const prefs = payload.notificationPreferences;
      if (prefs.notifyFriendRequests !== undefined || prefs.newFriendRequests !== undefined) {
        updates.notify_friend_requests =
          prefs.notifyFriendRequests ?? prefs.newFriendRequests;
      }
      if (prefs.notifyRequestAccepted !== undefined || prefs.friendRequestAccepted !== undefined) {
        updates.notify_request_accepted =
          prefs.notifyRequestAccepted ?? prefs.friendRequestAccepted;
      }
      if (prefs.notifyScheduleUpdates !== undefined || prefs.friendsScheduleUpdates !== undefined) {
        updates.notify_schedule_updates =
          prefs.notifyScheduleUpdates ?? prefs.friendsScheduleUpdates;
      }
    }

    // Schedule visibility setting if provided in profile payload
    if (payload.scheduleVisibility !== undefined) {
      updates.schedule_visibility = normalizeVisibilityOption(
        payload.scheduleVisibility
      );
    }

    // 4. Execute profile table update if there are field changes
    if (Object.keys(updates).length > 0) {
      const { error: updateErr } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (updateErr) {
        if (updateErr.code === '23505') {
          throw new AppError(
            409,
            'USERNAME_TAKEN',
            'This username is already taken.'
          );
        }
        throw new AppError(
          500,
          'DATABASE_ERROR',
          'Failed to update profile.',
          updateErr.message
        );
      }
    }

    // 5. Update schedule permissions if provided
    if (
      payload.permissions !== undefined ||
      payload.selectedFriendIds !== undefined ||
      payload.selectedGroupIds !== undefined
    ) {
      await this.syncSchedulePermissions(
        supabase,
        userId,
        payload.permissions,
        payload.selectedFriendIds,
        payload.selectedGroupIds
      );
    }

    // 6. Return refreshed profile
    return this.getProfileByUserId(supabase, userId);
  }

  /**
   * Fetches notification preferences for the authenticated user.
   */
  static async getNotificationPreferences(
    supabase: TypedSupabaseClient,
    userId: string
  ): Promise<FormattedNotificationPreferences> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(
        'notify_friend_requests, notify_request_accepted, notify_schedule_updates'
      )
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to retrieve notification preferences.',
        error.message
      );
    }

    if (!profile) {
      throw new AppError(
        404,
        'PROFILE_NOT_FOUND',
        'User profile does not exist.'
      );
    }

    return formatNotificationPreferences(profile);
  }

  /**
   * Updates notification preferences for the authenticated user.
   */
  static async updateNotificationPreferences(
    supabase: TypedSupabaseClient,
    userId: string,
    payload: UpdateNotificationPreferencesInput
  ): Promise<FormattedNotificationPreferences> {
    const updates: ProfileUpdate = {};

    if (
      payload.notifyFriendRequests !== undefined ||
      payload.newFriendRequests !== undefined
    ) {
      updates.notify_friend_requests =
        (payload.notifyFriendRequests ?? payload.newFriendRequests)!;
    }

    if (
      payload.notifyRequestAccepted !== undefined ||
      payload.friendRequestAccepted !== undefined
    ) {
      updates.notify_request_accepted =
        (payload.notifyRequestAccepted ?? payload.friendRequestAccepted)!;
    }

    if (
      payload.notifyScheduleUpdates !== undefined ||
      payload.friendsScheduleUpdates !== undefined
    ) {
      updates.notify_schedule_updates =
        (payload.notifyScheduleUpdates ?? payload.friendsScheduleUpdates)!;
    }

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select(
        'notify_friend_requests, notify_request_accepted, notify_schedule_updates'
      )
      .single();

    if (error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to update notification preferences.',
        error.message
      );
    }

    return formatNotificationPreferences(updated);
  }

  /**
   * Fetches current schedule visibility rule and configured permissions/groups.
   */
  static async getScheduleVisibility(
    supabase: TypedSupabaseClient,
    userId: string
  ): Promise<FormattedScheduleVisibility> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('schedule_visibility')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to fetch schedule visibility.',
        error.message
      );
    }

    if (!profile) {
      throw new AppError(
        404,
        'PROFILE_NOT_FOUND',
        'User profile does not exist.'
      );
    }

    const { data: permissions } = await supabase
      .from('schedule_permissions')
      .select(
        `
        id,
        owner_id,
        target_user_id,
        target_group_id,
        access_level,
        created_at,
        target_user:profiles!schedule_permissions_target_user_id_fkey(id, username, full_name, avatar_url),
        target_group:friend_groups!schedule_permissions_target_group_id_fkey(id, name)
      `
      )
      .eq('owner_id', userId);

    const formattedPermissions = formatPermissions(permissions || []);
    const selectedFriendIds = formattedPermissions
      .filter((p) => p.targetUserId !== null)
      .map((p) => p.targetUserId as string);
    const selectedGroupIds = formattedPermissions
      .filter((p) => p.targetGroupId !== null)
      .map((p) => p.targetGroupId as string);

    return {
      scheduleVisibility: normalizeVisibilityOption(profile.schedule_visibility),
      selectedFriendIds,
      selectedGroupIds,
      permissions: formattedPermissions,
    };
  }

  /**
   * Updates schedule visibility mode and synchronizes selected friends or groups.
   */
  static async updateScheduleVisibility(
    supabase: TypedSupabaseClient,
    userId: string,
    payload: UpdateScheduleVisibilityInput
  ): Promise<FormattedScheduleVisibility> {
    const canonicalVisibility = normalizeVisibilityOption(
      payload.scheduleVisibility
    );

    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ schedule_visibility: canonicalVisibility })
      .eq('id', userId);

    if (profileErr) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to update schedule visibility.',
        profileErr.message
      );
    }

    if (
      payload.permissions !== undefined ||
      payload.selectedFriendIds !== undefined ||
      payload.selectedGroupIds !== undefined
    ) {
      await this.syncSchedulePermissions(
        supabase,
        userId,
        payload.permissions,
        payload.selectedFriendIds,
        payload.selectedGroupIds
      );
    }

    return this.getScheduleVisibility(supabase, userId);
  }

  /**
   * Looks up a user's public profile by UUID or username.
   */
  static async getPublicProfileByIdentifier(
    supabase: TypedSupabaseClient,
    identifier: string
  ): Promise<PublicProfileResponse> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identifier
      );

    let query = supabase
      .from('profiles')
      .select(
        'id, username, full_name, first_name, last_name, avatar_url, bio, schedule_visibility'
      );

    if (isUuid) {
      query = query.eq('id', identifier);
    } else {
      query = query.ilike('username', identifier);
    }

    const { data: profile, error } = await query.maybeSingle();

    if (error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to search user profile.',
        error.message
      );
    }

    if (!profile) {
      throw new AppError(
        404,
        'PROFILE_NOT_FOUND',
        `No profile found for "${identifier}".`
      );
    }

    return {
      id: profile.id,
      username: profile.username,
      fullName: profile.full_name,
      firstName: profile.first_name,
      lastName: profile.last_name,
      avatarUrl: profile.avatar_url,
      initials: computeInitials(
        profile.first_name,
        profile.last_name,
        profile.full_name
      ),
      bio: profile.bio,
      scheduleVisibility: profile.schedule_visibility,
    };
  }

  /**
   * Synchronizes the schedule_permissions join table for the given owner.
   */
  private static async syncSchedulePermissions(
    supabase: TypedSupabaseClient,
    userId: string,
    permissions?: Array<{
      targetUserId?: string;
      targetGroupId?: string;
      accessLevel: string;
    }>,
    selectedFriendIds?: string[],
    selectedGroupIds?: string[]
  ): Promise<void> {
    const itemsToInsert: SchedulePermissionInsert[] = [];

    if (permissions && permissions.length > 0) {
      for (const p of permissions) {
        if (p.targetUserId) {
          itemsToInsert.push({
            owner_id: userId,
            target_user_id: p.targetUserId,
            target_group_id: null,
            access_level: p.accessLevel || 'free_only',
          });
        } else if (p.targetGroupId) {
          itemsToInsert.push({
            owner_id: userId,
            target_user_id: null,
            target_group_id: p.targetGroupId,
            access_level: p.accessLevel || 'free_only',
          });
        }
      }
    } else {
      if (selectedFriendIds && selectedFriendIds.length > 0) {
        for (const friendId of selectedFriendIds) {
          itemsToInsert.push({
            owner_id: userId,
            target_user_id: friendId,
            target_group_id: null,
            access_level: 'free_only',
          });
        }
      }

      if (selectedGroupIds && selectedGroupIds.length > 0) {
        for (const groupId of selectedGroupIds) {
          itemsToInsert.push({
            owner_id: userId,
            target_user_id: null,
            target_group_id: groupId,
            access_level: 'free_only',
          });
        }
      }
    }

    // Clear previous permissions for this owner
    const { error: delErr } = await supabase
      .from('schedule_permissions')
      .delete()
      .eq('owner_id', userId);

    if (delErr) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to reset schedule permissions.',
        delErr.message
      );
    }

    if (itemsToInsert.length > 0) {
      const { error: insErr } = await supabase
        .from('schedule_permissions')
        .insert(itemsToInsert);

      if (insErr) {
        if (insErr.code === '23503') {
          throw new AppError(
            400,
            'INVALID_TARGET',
            'One or more selected friend or group IDs do not exist in the database.',
            insErr.message
          );
        }
        throw new AppError(
          500,
          'DATABASE_ERROR',
          'Failed to record schedule permissions.',
          insErr.message
        );
      }
    }
  }
}
