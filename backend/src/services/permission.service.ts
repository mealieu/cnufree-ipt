import { TypedSupabaseClient } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { Database } from '../types/database.types';

export type ScheduleAccessLevel =
  | 'owner'
  | 'full_view'
  | 'free_only'
  | 'busy_only'
  | 'restricted'
  | 'blocked'
  | 'none';

export type ScheduleDataState =
  | 'available'
  | 'privacy-restricted'
  | 'missing'
  | 'unavailable';

export type PermissionReason =
  | 'owner'
  | 'allowed'
  | 'limited_access'
  | 'private_visibility'
  | 'not_in_selected_permissions'
  | 'not_friends'
  | 'blocked'
  | 'missing_schedule'
  | 'profile_not_found'
  | 'unavailable';

export interface MemberPrivacyState {
  scheduleState: ScheduleDataState;
  accessLevel: ScheduleAccessLevel;
  canViewSchedule: boolean;
  isPrivate: boolean;
  hasMissingSchedule: boolean;
  isUnavailable: boolean;
  reason: PermissionReason;
  privacyNotice: string | null;
  privacyNoticeSub: string | null;
}

export interface ScheduleAccessDecision extends MemberPrivacyState {
  targetUserId: string;
  profileExists: boolean;
  isOwner: boolean;
  isBlocked: boolean;
  isFriend: boolean;
  scheduleVisibility: string;
  hasAnySchedule: boolean;
}

export interface RawScheduleBlock {
  id: string;
  title: string;
  day_of_week: number | null;
  specific_date: string | null;
  start_time: string;
  end_time: string;
  room: string | null;
  notes: string | null;
  is_busy: boolean;
  is_private?: boolean;
}

type ScheduleVisibilityValue = 'only_me' | 'friends_only' | 'selected_friends';

const ACCESS_RANK: Record<string, number> = {
  full_view: 3,
  free_only: 2,
  busy_only: 1,
};

function getFirstNameLabel(displayName?: string | null): string {
  const cleaned = (displayName || '').trim();
  if (!cleaned) return 'This user';
  return cleaned.split(/\s+/)[0] || cleaned;
}

/**
 * Resolves a clean, domain-aligned state object (`available`, `privacy-restricted`,
 * `missing`, or `unavailable`) and user-facing notice copy for a target user.
 */
export function buildMemberPrivacyState(params: {
  displayName?: string | null;
  profileExists: boolean;
  isBlocked: boolean;
  isFriend: boolean;
  isOwner: boolean;
  scheduleVisibility?: string | null;
  accessLevel: ScheduleAccessLevel;
  hasAnySchedule: boolean;
  hadFetchError?: boolean;
}): MemberPrivacyState {
  const firstName = getFirstNameLabel(params.displayName);

  if (params.hadFetchError || !params.profileExists || params.isBlocked || params.accessLevel === 'blocked') {
    return {
      scheduleState: 'unavailable',
      accessLevel: params.isBlocked ? 'blocked' : params.accessLevel,
      canViewSchedule: false,
      isPrivate: false,
      hasMissingSchedule: false,
      isUnavailable: true,
      reason: params.isBlocked
        ? 'blocked'
        : !params.profileExists
          ? 'profile_not_found'
          : 'unavailable',
      privacyNotice: `Couldn’t load ${firstName}’s schedule`,
      privacyNoticeSub:
        'This isn’t the same as being free. They aren’t counted as available until it loads.',
    };
  }

  if (params.accessLevel === 'restricted' || params.accessLevel === 'none') {
    const reason: PermissionReason = !params.isOwner && !params.isFriend
      ? 'not_friends'
      : params.scheduleVisibility === 'selected_friends'
        ? 'not_in_selected_permissions'
        : 'private_visibility';

    return {
      scheduleState: 'privacy-restricted',
      accessLevel: 'restricted',
      canViewSchedule: false,
      isPrivate: true,
      hasMissingSchedule: false,
      isUnavailable: false,
      reason,
      privacyNotice: `${firstName} limits what they share`,
      privacyNoticeSub:
        reason === 'not_friends'
          ? 'Connect as friends to view availability.'
          : 'This schedule is private.',
    };
  }

  if (!params.hasAnySchedule) {
    return {
      scheduleState: 'missing',
      accessLevel: params.accessLevel,
      canViewSchedule: true,
      isPrivate: params.accessLevel === 'free_only' || params.accessLevel === 'busy_only',
      hasMissingSchedule: true,
      isUnavailable: false,
      reason: 'missing_schedule',
      privacyNotice: `${firstName} hasn’t shared a schedule`,
      privacyNoticeSub: `We can’t tell when ${firstName} is free, so they aren’t counted as available in the group.`,
    };
  }

  if (params.accessLevel === 'free_only' || params.accessLevel === 'busy_only') {
    return {
      scheduleState: 'privacy-restricted',
      accessLevel: params.accessLevel,
      canViewSchedule: true,
      isPrivate: true,
      hasMissingSchedule: false,
      isUnavailable: false,
      reason: 'limited_access',
      privacyNotice: `${firstName} limits what they share`,
      privacyNoticeSub:
        'You can see busy and free times. Titles and rooms are hidden.',
    };
  }

  return {
    scheduleState: 'available',
    accessLevel: params.accessLevel,
    canViewSchedule: true,
    isPrivate: false,
    hasMissingSchedule: false,
    isUnavailable: false,
    reason: params.isOwner ? 'owner' : 'allowed',
    privacyNotice: null,
    privacyNoticeSub: null,
  };
}

/**
 * Enforces field-level schedule privacy masking based on resolved access level.
 */
export function maskScheduleBlocksForAccess(
  blocks: RawScheduleBlock[],
  accessLevel: ScheduleAccessLevel
): RawScheduleBlock[] {
  if (
    accessLevel === 'restricted' ||
    accessLevel === 'blocked' ||
    accessLevel === 'none'
  ) {
    return [];
  }

  if (accessLevel === 'free_only' || accessLevel === 'busy_only') {
    return blocks.map((block) => ({
      ...block,
      title: block.is_busy ? 'Busy' : 'Free',
      room: null,
      notes: null,
      is_private: true,
    }));
  }

  return blocks.map((block) => ({
    ...block,
    is_private: false,
  }));
}

function isRpcMissingError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === 'PGRST202' ||
    error.code === '42883' ||
    (error.message || '').toLowerCase().includes('could not find the function')
  );
}

/**
 * [BE-09] Centralized API-level permission, block-list, and visibility service.
 */
export class PermissionService {
  /**
   * Evaluates whether `viewerId` can view `targetUserId`'s schedule,
   * returning exact access level and clean `available` / `privacy-restricted` / `missing` / `unavailable` state.
   */
  static async evaluateScheduleAccess(
    client: TypedSupabaseClient,
    viewerId: string,
    targetUserId: string,
    targetDisplayName?: string | null
  ): Promise<ScheduleAccessDecision> {
    // 1. Prefer the PostgreSQL SECURITY DEFINER RPC (enforces canonical SQL logic)
    const { data: rpcRows, error: rpcError } = await client.rpc(
      'get_user_schedule_access',
      { p_target_user_id: targetUserId }
    );

    if (!rpcError && Array.isArray(rpcRows) && rpcRows.length > 0) {
      const row = rpcRows[0];
      const resolvedAccess = (row.access_level || 'none') as ScheduleAccessLevel;
      const state = buildMemberPrivacyState({
        displayName: targetDisplayName,
        profileExists: row.profile_exists,
        isBlocked: row.is_blocked,
        isFriend: row.is_friend,
        isOwner: row.is_self,
        scheduleVisibility: row.schedule_visibility,
        accessLevel: resolvedAccess,
        hasAnySchedule: row.has_any_schedule,
      });

      return {
        targetUserId,
        profileExists: row.profile_exists,
        isOwner: row.is_self,
        isBlocked: row.is_blocked,
        isFriend: row.is_friend,
        scheduleVisibility: row.schedule_visibility,
        hasAnySchedule: row.has_any_schedule,
        ...state,
      };
    }

    if (rpcError && !isRpcMissingError(rpcError)) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to evaluate schedule permissions.',
        rpcError.message
      );
    }

    // 2. Resilient query fallback (used before migration push or in unit tests)
    return this.evaluateScheduleAccessViaQueries(
      client,
      viewerId,
      targetUserId,
      targetDisplayName
    );
  }

  /**
   * Query-based permission evaluator using `req.supabase` (RLS-enforced).
   */
  private static async evaluateScheduleAccessViaQueries(
    client: TypedSupabaseClient,
    viewerId: string,
    targetUserId: string,
    targetDisplayName?: string | null
  ): Promise<ScheduleAccessDecision> {
    const isOwner = viewerId === targetUserId;

    const { data: profile, error: profileErr } = await client
      .from('profiles')
      .select('id, full_name, first_name, last_name, username, schedule_visibility')
      .eq('id', targetUserId)
      .maybeSingle();

    if (profileErr) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to load target profile permissions.',
        profileErr.message
      );
    }

    // Check bidirectional block status explicitly
    const { data: blockRows, error: blockErr } = await client
      .from('blocked_users')
      .select('blocker_id, blocked_id')
      .or(
        `and(blocker_id.eq.${viewerId},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${viewerId})`
      );

    if (blockErr) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        'Failed to verify block list status.',
        blockErr.message
      );
    }

    const isBlocked = (blockRows || []).length > 0;
    const displayName =
      targetDisplayName ||
      profile?.full_name ||
      `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
      profile?.username ||
      null;

    if (!profile || isBlocked) {
      const state = buildMemberPrivacyState({
        displayName,
        profileExists: Boolean(profile),
        isBlocked,
        isFriend: false,
        isOwner,
        scheduleVisibility: profile?.schedule_visibility ?? 'only_me',
        accessLevel: isBlocked ? 'blocked' : 'none',
        hasAnySchedule: false,
      });

      return {
        targetUserId,
        profileExists: Boolean(profile),
        isOwner,
        isBlocked,
        isFriend: false,
        scheduleVisibility: profile?.schedule_visibility ?? 'only_me',
        hasAnySchedule: false,
        ...state,
      };
    }

    if (isOwner) {
      const { count } = await client
        .from('schedules')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', targetUserId);

      const hasAnySchedule = (count ?? 0) > 0;
      const state = buildMemberPrivacyState({
        displayName,
        profileExists: true,
        isBlocked: false,
        isFriend: false,
        isOwner: true,
        scheduleVisibility: profile.schedule_visibility,
        accessLevel: 'owner',
        hasAnySchedule,
      });

      return {
        targetUserId,
        profileExists: true,
        isOwner: true,
        isBlocked: false,
        isFriend: false,
        scheduleVisibility: profile.schedule_visibility,
        hasAnySchedule,
        ...state,
      };
    }

    const [u1, u2] =
      viewerId < targetUserId ? [viewerId, targetUserId] : [targetUserId, viewerId];

    const { data: friendship } = await client
      .from('friendships')
      .select('id')
      .eq('user_id_1', u1)
      .eq('user_id_2', u2)
      .maybeSingle();

    const isFriend = Boolean(friendship);
    const visibility = (profile.schedule_visibility || 'friends_only') as ScheduleVisibilityValue;

    let accessLevel: ScheduleAccessLevel = 'restricted';

    if (visibility !== 'only_me' && isFriend) {
      const { data: permissions } = await client
        .from('schedule_permissions')
        .select('target_user_id, target_group_id, access_level')
        .eq('owner_id', targetUserId);

      const directPerm = (permissions || []).find(
        (p) => p.target_user_id === viewerId
      );

      if (directPerm) {
        accessLevel = directPerm.access_level as ScheduleAccessLevel;
      } else {
        const groupPerms = (permissions || []).filter(
          (p) => p.target_group_id !== null
        );
        if (groupPerms.length > 0) {
          const groupIds = groupPerms.map((p) => p.target_group_id as string);
          const { data: memberships } = await client
            .from('friend_group_members')
            .select('group_id')
            .in('group_id', groupIds)
            .eq('member_id', viewerId);

          const memberGroupIds = new Set(
            (memberships || []).map((m) => m.group_id)
          );
          let bestRank = 0;
          let bestLevel: ScheduleAccessLevel | null = null;
          for (const gp of groupPerms) {
            if (gp.target_group_id && memberGroupIds.has(gp.target_group_id)) {
              const rank = ACCESS_RANK[gp.access_level] || 0;
              if (rank > bestRank) {
                bestRank = rank;
                bestLevel = gp.access_level as ScheduleAccessLevel;
              }
            }
          }
          if (bestLevel) {
            accessLevel = bestLevel;
          }
        }

        if (accessLevel === 'restricted' && visibility === 'friends_only') {
          accessLevel = 'full_view';
        }
      }
    }

    const canView =
      accessLevel === 'full_view' ||
      accessLevel === 'free_only' ||
      accessLevel === 'busy_only';

    let hasAnySchedule = false;
    if (canView) {
      const { count } = await client
        .from('schedules')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', targetUserId);
      hasAnySchedule = (count ?? 0) > 0;
    }

    const state = buildMemberPrivacyState({
      displayName,
      profileExists: true,
      isBlocked: false,
      isFriend,
      isOwner: false,
      scheduleVisibility: visibility,
      accessLevel,
      hasAnySchedule,
    });

    return {
      targetUserId,
      profileExists: true,
      isOwner: false,
      isBlocked: false,
      isFriend,
      scheduleVisibility: visibility,
      hasAnySchedule,
      ...state,
    };
  }

  /**
   * Enforces hard API-level gate when directly requesting a specific user's schedule:
   * - 404 USER_NOT_FOUND if profile does not exist
   * - 403 USER_BLOCKED if blocked in either direction
   * - 403 NOT_FRIENDS if caller is neither owner nor a connected friend
   * Connected friends with `only_me` or `missing` return cleanly with explicit states.
   */
  static async assertCanAccessFriendResource(
    client: TypedSupabaseClient,
    viewerId: string,
    targetUserId: string
  ): Promise<ScheduleAccessDecision> {
    const decision = await this.evaluateScheduleAccess(
      client,
      viewerId,
      targetUserId
    );

    if (decision.isBlocked) {
      throw new AppError(
        403,
        'USER_BLOCKED',
        'You cannot access this user’s availability or schedule.',
        { scheduleState: 'unavailable', reason: 'blocked' }
      );
    }

    if (!decision.profileExists) {
      throw new AppError(
        404,
        'USER_NOT_FOUND',
        'Target user does not exist.',
        { scheduleState: 'unavailable', reason: 'profile_not_found' }
      );
    }

    if (!decision.isOwner && !decision.isFriend) {
      throw new AppError(
        403,
        'NOT_FRIENDS',
        'You must be connected as friends to view this schedule.',
        { scheduleState: 'privacy-restricted', reason: 'not_friends' }
      );
    }

    return decision;
  }

  /**
   * Batch-resolves permissions for multiple target friends (avoiding N+1 queries)
   * when falling back outside the PostgreSQL RPC.
   */
  static async resolveBatchFriendAccess(
    client: TypedSupabaseClient,
    viewerId: string,
    friendProfiles: Array<
      Pick<
        Database['public']['Tables']['profiles']['Row'],
        'id' | 'full_name' | 'first_name' | 'last_name' | 'username' | 'schedule_visibility'
      >
    >
  ): Promise<Map<string, { accessLevel: ScheduleAccessLevel; hasAnySchedule: boolean }>> {
    const result = new Map<
      string,
      { accessLevel: ScheduleAccessLevel; hasAnySchedule: boolean }
    >();

    if (friendProfiles.length === 0) {
      return result;
    }

    const friendIds = friendProfiles.map((p) => p.id);

    const [permRes, memberRes, schedPresenceRes] = await Promise.all([
      client
        .from('schedule_permissions')
        .select('owner_id, target_user_id, target_group_id, access_level')
        .in('owner_id', friendIds),
      client
        .from('friend_group_members')
        .select('group_id')
        .eq('member_id', viewerId),
      client
        .from('schedules')
        .select('user_id')
        .in('user_id', friendIds),
    ]);

    const viewerGroupIds = new Set(
      (memberRes.data || []).map((m) => m.group_id)
    );
    const usersWithSchedules = new Set(
      (schedPresenceRes.data || []).map((s) => s.user_id)
    );

    const permsByOwner = new Map<
      string,
      Array<{
        owner_id: string;
        target_user_id: string | null;
        target_group_id: string | null;
        access_level: string;
      }>
    >();

    for (const perm of permRes.data || []) {
      const list = permsByOwner.get(perm.owner_id) || [];
      list.push(perm);
      permsByOwner.set(perm.owner_id, list);
    }

    for (const profile of friendProfiles) {
      const visibility = profile.schedule_visibility;
      if (visibility === 'only_me') {
        result.set(profile.id, {
          accessLevel: 'restricted',
          hasAnySchedule: false,
        });
        continue;
      }

      const ownerPerms = permsByOwner.get(profile.id) || [];
      const direct = ownerPerms.find((p) => p.target_user_id === viewerId);

      let accessLevel: ScheduleAccessLevel = 'restricted';

      if (direct) {
        accessLevel = direct.access_level as ScheduleAccessLevel;
      } else {
        let bestRank = 0;
        let bestGroupLevel: ScheduleAccessLevel | null = null;

        for (const p of ownerPerms) {
          if (p.target_group_id && viewerGroupIds.has(p.target_group_id)) {
            const rank = ACCESS_RANK[p.access_level] || 0;
            if (rank > bestRank) {
              bestRank = rank;
              bestGroupLevel = p.access_level as ScheduleAccessLevel;
            }
          }
        }

        if (bestGroupLevel) {
          accessLevel = bestGroupLevel;
        } else if (visibility === 'friends_only') {
          accessLevel = 'full_view';
        }
      }

      const canView =
        accessLevel === 'full_view' ||
        accessLevel === 'free_only' ||
        accessLevel === 'busy_only';

      result.set(profile.id, {
        accessLevel,
        hasAnySchedule: canView ? usersWithSchedules.has(profile.id) : false,
      });
    }

    return result;
  }
}
