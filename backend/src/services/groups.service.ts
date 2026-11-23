import { TypedSupabaseClient } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import {
  AddGroupMemberInput,
  CreateGroupInput,
  UpdateGroupInput,
} from '../schemas/groups.schema';
import { computeInitials } from './profile.service';
import { Database } from '../types/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type FriendGroupRow = Database['public']['Tables']['friend_groups']['Row'];
type FriendGroupMemberRow = Database['public']['Tables']['friend_group_members']['Row'];

export interface GroupMemberResponse {
  id: string;
  name: string;
  fullName: string;
  username: string;
  initials: string;
  avatarUrl: string | null;
  addedAt: string;
}

export interface FriendGroupResponse {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  memberCount: number;
  members: GroupMemberResponse[];
  createdAt: string;
  updatedAt: string;
}

type PartialProfile = Pick<
  ProfileRow,
  'id' | 'full_name' | 'first_name' | 'last_name' | 'username' | 'avatar_url'
>;

export class GroupsService {
  /**
   * Helper to format a member from profile and member join rows.
   */
  private static formatMember(
    profile: PartialProfile | undefined,
    memberId: string,
    addedAt: string
  ): GroupMemberResponse {
    const displayName =
      profile?.full_name ||
      `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
      profile?.username ||
      'User';

    const username = profile?.username
      ? profile.username.startsWith('@')
        ? profile.username
        : `@${profile.username}`
      : '@unknown';

    return {
      id: memberId,
      name: displayName,
      fullName: displayName,
      username,
      initials: computeInitials(
        profile?.first_name,
        profile?.last_name,
        profile?.full_name
      ),
      avatarUrl: profile?.avatar_url || null,
      addedAt,
    };
  }

  /**
   * Helper to verify group ownership. Throws 404 if not found or unauthorized.
   */
  private static async getOwnedGroup(
    client: TypedSupabaseClient,
    ownerId: string,
    groupId: string
  ): Promise<FriendGroupRow> {
    const { data: group, error } = await client
      .from('friend_groups')
      .select('*')
      .eq('id', groupId)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to retrieve group: ${error.message}`
      );
    }

    if (!group) {
      throw new AppError(404, 'GROUP_NOT_FOUND', 'Friend group not found.');
    }

    return group;
  }

  /**
   * [BE-07] List all friend groups owned by the authenticated user.
   */
  static async listGroups(
    client: TypedSupabaseClient,
    ownerId: string
  ): Promise<FriendGroupResponse[]> {
    // 1. Fetch user's friend groups
    const { data: groups, error: gError } = await client
      .from('friend_groups')
      .select('*')
      .eq('owner_id', ownerId)
      .order('name', { ascending: true });

    if (gError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to list friend groups: ${gError.message}`
      );
    }

    if (!groups || groups.length === 0) {
      return [];
    }

    const groupIds = groups.map((g) => g.id);

    // 2. Fetch all members belonging to these groups
    const { data: groupMembers, error: mError } = await client
      .from('friend_group_members')
      .select('group_id, member_id, added_at')
      .in('group_id', groupIds)
      .order('added_at', { ascending: true });

    if (mError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to retrieve group members: ${mError.message}`
      );
    }

    // 3. Batch load profiles for all members
    const memberIds = Array.from(
      new Set((groupMembers || []).map((gm) => gm.member_id))
    );

    const profileMap = new Map<string, PartialProfile>();
    if (memberIds.length > 0) {
      const { data: profiles, error: pError } = await client
        .from('profiles')
        .select('id, full_name, first_name, last_name, username, avatar_url')
        .in('id', memberIds);

      if (pError) {
        throw new AppError(
          500,
          'DATABASE_ERROR',
          `Failed to load member profiles: ${pError.message}`
        );
      }

      for (const p of profiles || []) {
        profileMap.set(p.id, p);
      }
    }

    // 4. Map members per group
    const membersByGroup = new Map<string, GroupMemberResponse[]>();
    for (const gId of groupIds) {
      membersByGroup.set(gId, []);
    }

    for (const gm of groupMembers || []) {
      const prof = profileMap.get(gm.member_id);
      const formatted = this.formatMember(prof, gm.member_id, gm.added_at);
      membersByGroup.get(gm.group_id)?.push(formatted);
    }

    return groups.map((g) => {
      const members = membersByGroup.get(g.id) || [];
      return {
        id: g.id,
        name: g.name,
        ownerId: g.owner_id,
        memberIds: members.map((m) => m.id),
        memberCount: members.length,
        members,
        createdAt: g.created_at,
        updatedAt: g.updated_at,
      };
    });
  }

  /**
   * [BE-07] Get single friend group by ID.
   */
  static async getGroupById(
    client: TypedSupabaseClient,
    ownerId: string,
    groupId: string
  ): Promise<FriendGroupResponse> {
    const group = await this.getOwnedGroup(client, ownerId, groupId);

    // Fetch members
    const { data: groupMembers, error: mError } = await client
      .from('friend_group_members')
      .select('group_id, member_id, added_at')
      .eq('group_id', groupId)
      .order('added_at', { ascending: true });

    if (mError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to retrieve group members: ${mError.message}`
      );
    }

    const memberIds = (groupMembers || []).map((gm) => gm.member_id);
    const profileMap = new Map<string, PartialProfile>();

    if (memberIds.length > 0) {
      const { data: profiles, error: pError } = await client
        .from('profiles')
        .select('id, full_name, first_name, last_name, username, avatar_url')
        .in('id', memberIds);

      if (pError) {
        throw new AppError(
          500,
          'DATABASE_ERROR',
          `Failed to load member profiles: ${pError.message}`
        );
      }

      for (const p of profiles || []) {
        profileMap.set(p.id, p);
      }
    }

    const members: GroupMemberResponse[] = (groupMembers || []).map((gm) =>
      this.formatMember(profileMap.get(gm.member_id), gm.member_id, gm.added_at)
    );

    return {
      id: group.id,
      name: group.name,
      ownerId: group.owner_id,
      memberIds: members.map((m) => m.id),
      memberCount: members.length,
      members,
      createdAt: group.created_at,
      updatedAt: group.updated_at,
    };
  }

  /**
   * [BE-07] Create friend group with optional initial members.
   * Enforces PostgreSQL unique constraint uq_friend_groups_owner_name.
   */
  static async createGroup(
    client: TypedSupabaseClient,
    ownerId: string,
    input: { name: string; memberIds?: string[] }
  ): Promise<FriendGroupResponse> {
    const trimmedName = input.name.trim();

    // 1. Check for existing group name for this owner
    const { data: existingGroup } = await client
      .from('friend_groups')
      .select('id')
      .eq('owner_id', ownerId)
      .ilike('name', trimmedName)
      .maybeSingle();

    if (existingGroup) {
      throw new AppError(
        409,
        'GROUP_NAME_EXISTS',
        `A friend group named "${trimmedName}" already exists.`
      );
    }

    // 2. Insert new friend group
    const { data: newGroup, error: insertError } = await client
      .from('friend_groups')
      .insert({
        owner_id: ownerId,
        name: trimmedName,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        throw new AppError(
          409,
          'GROUP_NAME_EXISTS',
          `A friend group named "${trimmedName}" already exists.`
        );
      }
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to create friend group: ${insertError.message}`
      );
    }

    // 3. Add initial members if provided
    const candidateMemberIds = Array.from(
      new Set((input.memberIds || []).filter((id) => id !== ownerId))
    );

    if (candidateMemberIds.length > 0) {
      // Verify blocked users
      const { data: blockedRows } = await client
        .from('blocked_users')
        .select('blocker_id, blocked_id')
        .or(
          `and(blocker_id.eq.${ownerId},blocked_id.in.(${candidateMemberIds.join(',')})),and(blocked_id.eq.${ownerId},blocker_id.in.(${candidateMemberIds.join(',')}))`
        );

      const blockedSet = new Set<string>();
      for (const row of blockedRows || []) {
        blockedSet.add(row.blocker_id === ownerId ? row.blocked_id : row.blocker_id);
      }

      const validMemberIds = candidateMemberIds.filter((id) => !blockedSet.has(id));

      if (validMemberIds.length > 0) {
        const rowsToInsert = validMemberIds.map((mId) => ({
          group_id: newGroup.id,
          member_id: mId,
        }));

        const { error: membersInsertError } = await client
          .from('friend_group_members')
          .insert(rowsToInsert);

        if (membersInsertError && membersInsertError.code !== '23505') {
          console.warn('[GroupsService] Failed to insert initial members:', membersInsertError);
        }
      }
    }

    return this.getGroupById(client, ownerId, newGroup.id);
  }

  /**
   * [BE-07] Update / Rename friend group and/or synchronize members.
   */
  static async updateGroup(
    client: TypedSupabaseClient,
    ownerId: string,
    groupId: string,
    input: UpdateGroupInput
  ): Promise<FriendGroupResponse> {
    const currentGroup = await this.getOwnedGroup(client, ownerId, groupId);

    // 1. Handle renaming if provided
    if (input.name !== undefined) {
      const trimmedName = input.name.trim();

      if (trimmedName.toLowerCase() !== currentGroup.name.toLowerCase()) {
        const { data: conflict } = await client
          .from('friend_groups')
          .select('id')
          .eq('owner_id', ownerId)
          .ilike('name', trimmedName)
          .neq('id', groupId)
          .maybeSingle();

        if (conflict) {
          throw new AppError(
            409,
            'GROUP_NAME_EXISTS',
            `A friend group named "${trimmedName}" already exists.`
          );
        }
      }

      const { error: updateError } = await client
        .from('friend_groups')
        .update({
          name: trimmedName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', groupId)
        .eq('owner_id', ownerId);

      if (updateError) {
        if (updateError.code === '23505') {
          throw new AppError(
            409,
            'GROUP_NAME_EXISTS',
            `A friend group named "${trimmedName}" already exists.`
          );
        }
        throw new AppError(
          500,
          'DATABASE_ERROR',
          `Failed to rename friend group: ${updateError.message}`
        );
      }
    }

    // 2. Handle member synchronization if memberIds provided
    if (input.memberIds !== undefined) {
      const targetMemberIds = Array.from(
        new Set(input.memberIds.filter((id) => id !== ownerId))
      );

      // Delete existing group members
      await client
        .from('friend_group_members')
        .delete()
        .eq('group_id', groupId);

      // Insert new members
      if (targetMemberIds.length > 0) {
        const rowsToInsert = targetMemberIds.map((mId) => ({
          group_id: groupId,
          member_id: mId,
        }));

        const { error: insertError } = await client
          .from('friend_group_members')
          .insert(rowsToInsert);

        if (insertError && insertError.code !== '23505') {
          throw new AppError(
            500,
            'DATABASE_ERROR',
            `Failed to update group members: ${insertError.message}`
          );
        }
      }
    }

    return this.getGroupById(client, ownerId, groupId);
  }

  /**
   * [BE-07] Delete friend group.
   * Cascades via PostgreSQL foreign keys to friend_group_members and schedule_permissions.
   */
  static async deleteGroup(
    client: TypedSupabaseClient,
    ownerId: string,
    groupId: string
  ): Promise<void> {
    await this.getOwnedGroup(client, ownerId, groupId);

    // Delete schedule permissions targeting this group
    await client
      .from('schedule_permissions')
      .delete()
      .eq('target_group_id', groupId);

    // Delete friend group
    const { error } = await client
      .from('friend_groups')
      .delete()
      .eq('id', groupId)
      .eq('owner_id', ownerId);

    if (error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to delete friend group: ${error.message}`
      );
    }
  }

  /**
   * [BE-07] Add member(s) to a friend group.
   * Enforces no-self-membership, blocker validation, and duplicate member prevention.
   */
  static async addMembers(
    client: TypedSupabaseClient,
    ownerId: string,
    groupId: string,
    input: AddGroupMemberInput
  ): Promise<FriendGroupResponse> {
    await this.getOwnedGroup(client, ownerId, groupId);

    // 1. Gather candidate member IDs
    const rawIds: string[] = [];
    if (input.memberId) rawIds.push(input.memberId);
    if (input.userId) rawIds.push(input.userId);
    if (input.memberIds) rawIds.push(...input.memberIds);

    const candidateIds = Array.from(new Set(rawIds.filter((id) => id !== ownerId)));

    if (candidateIds.length === 0) {
      throw new AppError(
        400,
        'INVALID_MEMBER',
        'Cannot add yourself or an empty member list to the friend group.'
      );
    }

    // 2. Verify profiles exist
    const { data: profiles, error: pError } = await client
      .from('profiles')
      .select('id')
      .in('id', candidateIds);

    if (pError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to verify members: ${pError.message}`
      );
    }

    const foundProfileIds = new Set((profiles || []).map((p) => p.id));
    for (const id of candidateIds) {
      if (!foundProfileIds.has(id)) {
        throw new AppError(404, 'USER_NOT_FOUND', `User with ID "${id}" was not found.`);
      }
    }

    // 3. Verify neither user is blocked
    const { data: blockedRows } = await client
      .from('blocked_users')
      .select('blocker_id, blocked_id')
      .or(
        `and(blocker_id.eq.${ownerId},blocked_id.in.(${candidateIds.join(',')})),and(blocked_id.eq.${ownerId},blocker_id.in.(${candidateIds.join(',')}))`
      );

    if (blockedRows && blockedRows.length > 0) {
      throw new AppError(
        403,
        'USER_BLOCKED',
        'Cannot add blocked users to a friend group.'
      );
    }

    // 4. Check existing members
    const { data: existingMembers, error: emError } = await client
      .from('friend_group_members')
      .select('member_id')
      .eq('group_id', groupId)
      .in('member_id', candidateIds);

    if (emError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to check existing members: ${emError.message}`
      );
    }

    const existingSet = new Set((existingMembers || []).map((em) => em.member_id));

    // If single member was requested and is already in group, throw 409
    if (candidateIds.length === 1 && existingSet.has(candidateIds[0])) {
      throw new AppError(
        409,
        'MEMBER_ALREADY_IN_GROUP',
        'User is already a member of this friend group.'
      );
    }

    const toInsert = candidateIds
      .filter((id) => !existingSet.has(id))
      .map((id) => ({
        group_id: groupId,
        member_id: id,
      }));

    if (toInsert.length > 0) {
      const { error: insertError } = await client
        .from('friend_group_members')
        .insert(toInsert);

      if (insertError && insertError.code !== '23505') {
        throw new AppError(
          500,
          'DATABASE_ERROR',
          `Failed to add members: ${insertError.message}`
        );
      }
    }

    return this.getGroupById(client, ownerId, groupId);
  }

  /**
   * [BE-07] Remove member from friend group.
   */
  static async removeMember(
    client: TypedSupabaseClient,
    ownerId: string,
    groupId: string,
    memberId: string
  ): Promise<void> {
    await this.getOwnedGroup(client, ownerId, groupId);

    const { data: deleted, error } = await client
      .from('friend_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('member_id', memberId)
      .select('member_id');

    if (error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to remove member: ${error.message}`
      );
    }

    if (!deleted || deleted.length === 0) {
      throw new AppError(
        404,
        'MEMBER_NOT_FOUND',
        'Member is not in this friend group.'
      );
    }
  }

  /**
   * [BE-07] List members of a friend group.
   */
  static async listMembers(
    client: TypedSupabaseClient,
    ownerId: string,
    groupId: string
  ): Promise<GroupMemberResponse[]> {
    const group = await this.getGroupById(client, ownerId, groupId);
    return group.members;
  }
}
