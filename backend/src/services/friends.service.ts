import { TypedSupabaseClient } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import {
  ListFriendRequestsQueryInput,
  SearchUsersQueryInput,
  SendFriendRequestInput,
} from '../schemas/friends.schema';
import { computeInitials } from './profile.service';
import { Database } from '../types/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type FriendRequestRow = Database['public']['Tables']['friend_requests']['Row'];
type FriendshipRow = Database['public']['Tables']['friendships']['Row'];
type BlockedUserRow = Database['public']['Tables']['blocked_users']['Row'];

export interface FormattedUserProfilePreview {
  id: string;
  fullName: string;
  username: string;
  initials: string;
  avatarUrl: string | null;
  bio?: string;
}

export type ConnectionStatus =
  | 'none'
  | 'pending_sent'
  | 'pending_received'
  | 'connected';

export interface DiscoverableUserResponse {
  id: string;
  name: string;
  fullName: string;
  username: string;
  initials: string;
  avatarUrl: string | null;
  bio: string;
  mutualFriendsCount: number;
  connectionStatus: ConnectionStatus;
}

export interface ConnectedFriendResponse {
  id: string;
  name: string;
  fullName: string;
  username: string;
  initials: string;
  avatarUrl: string | null;
  bio: string;
  mutualFriendsCount: number;
  connectedSince: string;
}

export interface FriendRequestResponse {
  id: string;
  senderId: string;
  receiverId: string;
  direction: 'received' | 'sent';
  status: string;
  requestedAt: string;
  name: string;
  username: string;
  initials: string;
  avatarUrl: string | null;
  bioNote?: string;
  mutualFriendsCount: number;
  sender?: FormattedUserProfilePreview;
  receiver?: FormattedUserProfilePreview;
}

export interface BlockedUserResponse {
  id: string;
  name: string;
  fullName: string;
  username: string;
  initials: string;
  avatarUrl: string | null;
  blockedAt: string;
}

/**
 * Ensures user_id_1 < user_id_2 for canonical database ordering
 */
export function getCanonicalPair(userA: string, userB: string): { user1: string; user2: string } {
  return userA < userB
    ? { user1: userA, user2: userB }
    : { user1: userB, user2: userA };
}

export class FriendsService {
  /**
   * Helper to retrieve all friend IDs for a given user.
   */
  static async getUserFriendIds(
    client: TypedSupabaseClient,
    userId: string
  ): Promise<Set<string>> {
    const { data, error } = await client
      .from('friendships')
      .select('user_id_1, user_id_2')
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

    if (error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to retrieve friends: ${error.message}`
      );
    }

    const friendIds = new Set<string>();
    for (const row of data || []) {
      if (row.user_id_1 === userId) {
        friendIds.add(row.user_id_2);
      } else {
        friendIds.add(row.user_id_1);
      }
    }
    return friendIds;
  }

  /**
   * Helper to retrieve blocked IDs in both directions (users blocked by caller OR who blocked caller).
   */
  static async getBlockedUserIds(
    client: TypedSupabaseClient,
    userId: string
  ): Promise<{ blockedByMe: Set<string>; blockedMe: Set<string>; allBlocked: Set<string> }> {
    const { data, error } = await client
      .from('blocked_users')
      .select('blocker_id, blocked_id')
      .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

    if (error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to retrieve blocked users: ${error.message}`
      );
    }

    const blockedByMe = new Set<string>();
    const blockedMe = new Set<string>();
    const allBlocked = new Set<string>();

    for (const row of data || []) {
      if (row.blocker_id === userId) {
        blockedByMe.add(row.blocked_id);
        allBlocked.add(row.blocked_id);
      }
      if (row.blocked_id === userId) {
        blockedMe.add(row.blocker_id);
        allBlocked.add(row.blocker_id);
      }
    }

    return { blockedByMe, blockedMe, allBlocked };
  }

  /**
   * [BE-06] User Search & Discovery API
   * Searches users excluding caller and blocked users, returning connection statuses.
   */
  static async searchUsers(
    client: TypedSupabaseClient,
    currentUserId: string,
    queryInput: SearchUsersQueryInput
  ): Promise<DiscoverableUserResponse[]> {
    const searchTerm = (queryInput.q || queryInput.query || '').trim();
    const limit = queryInput.limit || 20;
    const offset = queryInput.offset || 0;

    // 1. Fetch blocked relationships to filter out
    const { allBlocked } = await this.getBlockedUserIds(client, currentUserId);
    const myFriendIds = await this.getUserFriendIds(client, currentUserId);

    // 2. Query profiles
    let profilesQuery = client
      .from('profiles')
      .select('id, full_name, first_name, last_name, username, avatar_url, bio')
      .neq('id', currentUserId);

    if (searchTerm) {
      // Clean leading '@' if user searched with '@username'
      const cleanTerm = searchTerm.replace(/^@/, '');
      profilesQuery = profilesQuery.or(
        `username.ilike.%${cleanTerm}%,full_name.ilike.%${cleanTerm}%,first_name.ilike.%${cleanTerm}%,last_name.ilike.%${cleanTerm}%`
      );
    }

    profilesQuery = profilesQuery
      .order('full_name', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: profiles, error: profilesError } = await profilesQuery;

    if (profilesError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to search users: ${profilesError.message}`
      );
    }

    const candidateProfiles = (profiles || []).filter(
      (p) => !allBlocked.has(p.id)
    );

    if (candidateProfiles.length === 0) {
      return [];
    }

    const candidateIds = candidateProfiles.map((p) => p.id);

    // 3. Batch query pending friend requests between caller and candidates
    const { data: pendingRequests, error: reqError } = await client
      .from('friend_requests')
      .select('id, sender_id, receiver_id, status')
      .eq('status', 'pending')
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.in.(${candidateIds.join(',')})),and(receiver_id.eq.${currentUserId},sender_id.in.(${candidateIds.join(',')}))`
      );

    if (reqError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to resolve friend requests: ${reqError.message}`
      );
    }

    const sentPendingSet = new Set<string>();
    const receivedPendingSet = new Set<string>();

    for (const req of pendingRequests || []) {
      if (req.sender_id === currentUserId) {
        sentPendingSet.add(req.receiver_id);
      } else if (req.receiver_id === currentUserId) {
        receivedPendingSet.add(req.sender_id);
      }
    }

    // 4. Batch query friends of candidates to calculate mutual friends count
    const { data: candidateFriendships, error: fError } = await client
      .from('friendships')
      .select('user_id_1, user_id_2')
      .or(
        `user_id_1.in.(${candidateIds.join(',')}),user_id_2.in.(${candidateIds.join(',')})`
      );

    if (fError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to calculate mutual friends: ${fError.message}`
      );
    }

    const candidateFriendMap = new Map<string, Set<string>>();
    for (const id of candidateIds) {
      candidateFriendMap.set(id, new Set<string>());
    }

    for (const row of candidateFriendships || []) {
      if (candidateFriendMap.has(row.user_id_1)) {
        candidateFriendMap.get(row.user_id_1)!.add(row.user_id_2);
      }
      if (candidateFriendMap.has(row.user_id_2)) {
        candidateFriendMap.get(row.user_id_2)!.add(row.user_id_1);
      }
    }

    // 5. Build response objects
    return candidateProfiles.map((p) => {
      let connectionStatus: ConnectionStatus = 'none';
      if (myFriendIds.has(p.id)) {
        connectionStatus = 'connected';
      } else if (sentPendingSet.has(p.id)) {
        connectionStatus = 'pending_sent';
      } else if (receivedPendingSet.has(p.id)) {
        connectionStatus = 'pending_received';
      }

      const theirFriends = candidateFriendMap.get(p.id) || new Set();
      let mutualCount = 0;
      for (const fId of theirFriends) {
        if (myFriendIds.has(fId)) {
          mutualCount++;
        }
      }

      const initials = computeInitials(p.first_name, p.last_name, p.full_name);
      const displayName = p.full_name || `${p.first_name} ${p.last_name}`.trim() || p.username;

      return {
        id: p.id,
        name: displayName,
        fullName: displayName,
        username: p.username.startsWith('@') ? p.username : `@${p.username}`,
        initials,
        avatarUrl: p.avatar_url,
        bio: p.bio || '',
        mutualFriendsCount: mutualCount,
        connectionStatus,
      };
    });
  }

  /**
   * [BE-06] List Connected Friends
   */
  static async listFriends(
    client: TypedSupabaseClient,
    currentUserId: string
  ): Promise<ConnectedFriendResponse[]> {
    const { data: friendships, error: fError } = await client
      .from('friendships')
      .select('id, user_id_1, user_id_2, created_at')
      .or(`user_id_1.eq.${currentUserId},user_id_2.eq.${currentUserId}`)
      .order('created_at', { ascending: false });

    if (fError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to retrieve friends list: ${fError.message}`
      );
    }

    if (!friendships || friendships.length === 0) {
      return [];
    }

    const friendIdToSince = new Map<string, string>();
    for (const f of friendships) {
      const friendId = f.user_id_1 === currentUserId ? f.user_id_2 : f.user_id_1;
      friendIdToSince.set(friendId, f.created_at);
    }

    const friendIds = Array.from(friendIdToSince.keys());

    const { data: profiles, error: pError } = await client
      .from('profiles')
      .select('id, full_name, first_name, last_name, username, avatar_url, bio')
      .in('id', friendIds);

    if (pError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to retrieve friend profiles: ${pError.message}`
      );
    }

    // Mutual friends calculation
    const myFriendIds = new Set<string>(friendIds);
    const { data: mutualFriendships } = await client
      .from('friendships')
      .select('user_id_1, user_id_2')
      .or(
        `user_id_1.in.(${friendIds.join(',')}),user_id_2.in.(${friendIds.join(',')})`
      );

    const friendToTheirFriends = new Map<string, Set<string>>();
    for (const id of friendIds) {
      friendToTheirFriends.set(id, new Set());
    }
    for (const row of mutualFriendships || []) {
      if (friendToTheirFriends.has(row.user_id_1)) {
        friendToTheirFriends.get(row.user_id_1)!.add(row.user_id_2);
      }
      if (friendToTheirFriends.has(row.user_id_2)) {
        friendToTheirFriends.get(row.user_id_2)!.add(row.user_id_1);
      }
    }

    return (profiles || []).map((p) => {
      const theirFriends = friendToTheirFriends.get(p.id) || new Set();
      let mutualCount = 0;
      for (const fId of theirFriends) {
        if (fId !== currentUserId && myFriendIds.has(fId)) {
          mutualCount++;
        }
      }

      const displayName = p.full_name || `${p.first_name} ${p.last_name}`.trim() || p.username;
      return {
        id: p.id,
        name: displayName,
        fullName: displayName,
        username: p.username.startsWith('@') ? p.username : `@${p.username}`,
        initials: computeInitials(p.first_name, p.last_name, p.full_name),
        avatarUrl: p.avatar_url,
        bio: p.bio || '',
        mutualFriendsCount: mutualCount,
        connectedSince: friendIdToSince.get(p.id) || new Date().toISOString(),
      };
    });
  }

  /**
   * [BE-06] Send Friend Request
   * Enforces PostgreSQL constraints (no self-requests, unique pending requests),
   * blocking checks, and existing friendships.
   */
  static async sendFriendRequest(
    client: TypedSupabaseClient,
    currentUserId: string,
    input: SendFriendRequestInput
  ): Promise<FriendRequestResponse> {
    let targetUserId = input.receiverId || input.targetUserId;

    // 1. Resolve target by username if UUID wasn't provided directly
    if (!targetUserId && input.username) {
      const cleanUsername = input.username.replace(/^@/, '').trim();
      const { data: targetProfile, error: userError } = await client
        .from('profiles')
        .select('id, username')
        .ilike('username', cleanUsername)
        .maybeSingle();

      if (userError) {
        throw new AppError(
          500,
          'DATABASE_ERROR',
          `Failed to lookup user: ${userError.message}`
        );
      }

      if (!targetProfile) {
        throw new AppError(
          404,
          'USER_NOT_FOUND',
          `User with username '@${cleanUsername}' does not exist.`
        );
      }

      targetUserId = targetProfile.id;
    }

    if (!targetUserId) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'Receiver user ID or username is required.'
      );
    }

    // 2. Prevent sending request to self (enforced by DB check constraint chk_friend_requests_no_self)
    if (targetUserId === currentUserId) {
      throw new AppError(
        400,
        'CANNOT_FRIEND_SELF',
        'You cannot send a friend request to yourself.'
      );
    }

    // 3. Verify target profile exists and fetch notification preferences
    const { data: targetProfile, error: pError } = await client
      .from('profiles')
      .select('id, full_name, first_name, last_name, username, avatar_url, bio, notify_friend_requests')
      .eq('id', targetUserId)
      .maybeSingle();

    if (pError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to retrieve target user profile: ${pError.message}`
      );
    }

    if (!targetProfile) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Target user does not exist.');
    }

    // 4. Verify neither user has blocked the other
    const { allBlocked } = await this.getBlockedUserIds(client, currentUserId);
    if (allBlocked.has(targetUserId)) {
      throw new AppError(
        403,
        'USER_BLOCKED',
        'Unable to send friend request to this user.'
      );
    }

    // 5. Check if already friends in friendships
    const canonical = getCanonicalPair(currentUserId, targetUserId);
    const { data: existingFriendship, error: friendshipError } = await client
      .from('friendships')
      .select('id')
      .eq('user_id_1', canonical.user1)
      .eq('user_id_2', canonical.user2)
      .maybeSingle();

    if (friendshipError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to check friendship status: ${friendshipError.message}`
      );
    }

    if (existingFriendship) {
      throw new AppError(
        409,
        'ALREADY_FRIENDS',
        'You are already friends with this user.'
      );
    }

    // 6. Check if incoming request is already pending from target user to caller
    const { data: incomingPending } = await client
      .from('friend_requests')
      .select('id')
      .eq('sender_id', targetUserId)
      .eq('receiver_id', currentUserId)
      .eq('status', 'pending')
      .maybeSingle();

    if (incomingPending) {
      throw new AppError(
        409,
        'INCOMING_REQUEST_PENDING',
        'This user has already sent you a friend request. You can accept their request.'
      );
    }

    // 7. Check for existing pending request from caller to target user
    // (Backed by PostgreSQL unique index uq_friend_requests_pending_pair)
    const { data: outgoingPending } = await client
      .from('friend_requests')
      .select('id')
      .eq('sender_id', currentUserId)
      .eq('receiver_id', targetUserId)
      .eq('status', 'pending')
      .maybeSingle();

    if (outgoingPending) {
      throw new AppError(
        409,
        'FRIEND_REQUEST_EXISTS',
        'A pending friend request already exists for this user.'
      );
    }

    // 8. Insert or revive friend request
    // Check if an earlier non-pending request exists (e.g., declined or cancelled) to update, or insert new
    const { data: priorRequest } = await client
      .from('friend_requests')
      .select('id')
      .eq('sender_id', currentUserId)
      .eq('receiver_id', targetUserId)
      .maybeSingle();

    let savedRequestId: string;
    let savedCreatedAt: string = new Date().toISOString();

    if (priorRequest) {
      const { data: updatedReq, error: updateError } = await client
        .from('friend_requests')
        .update({
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', priorRequest.id)
        .select()
        .single();

      if (updateError) {
        if (updateError.code === '23505') {
          throw new AppError(
            409,
            'FRIEND_REQUEST_EXISTS',
            'A pending friend request already exists for this user.'
          );
        }
        throw new AppError(
          500,
          'DATABASE_ERROR',
          `Failed to send friend request: ${updateError.message}`
        );
      }
      savedRequestId = updatedReq.id;
      savedCreatedAt = updatedReq.created_at;
    } else {
      const { data: newReq, error: insertError } = await client
        .from('friend_requests')
        .insert({
          sender_id: currentUserId,
          receiver_id: targetUserId,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          throw new AppError(
            409,
            'FRIEND_REQUEST_EXISTS',
            'A pending friend request already exists for this user.'
          );
        }
        throw new AppError(
          500,
          'DATABASE_ERROR',
          `Failed to send friend request: ${insertError.message}`
        );
      }
      savedRequestId = newReq.id;
      savedCreatedAt = newReq.created_at;
    }

    // 9. Fetch caller profile to craft friendly notification (aligned with BE-11)
    const { data: callerProfile } = await client
      .from('profiles')
      .select('id, full_name, first_name, last_name, username, avatar_url')
      .eq('id', currentUserId)
      .maybeSingle();

    if (targetProfile.notify_friend_requests) {
      const callerName = callerProfile?.full_name || callerProfile?.username || 'A CNU Free user';
      // Fire-and-forget notification creation
      try {
        await client
          .from('notifications')
          .insert({
            user_id: targetUserId,
            actor_id: currentUserId,
            category: 'friend_request_received',
            title: 'New Friend Request',
            detail_text: `${callerName} sent you a friend request.`,
            is_read: false,
            metadata: {
              requestId: savedRequestId,
              senderUsername: callerProfile?.username,
            },
          });
      } catch (err: unknown) {
        console.warn('[FriendsService] Failed to create friend request notification:', err);
      }
    }

    const targetDisplayName =
      targetProfile.full_name ||
      `${targetProfile.first_name} ${targetProfile.last_name}`.trim() ||
      targetProfile.username;

    return {
      id: savedRequestId,
      senderId: currentUserId,
      receiverId: targetUserId,
      direction: 'sent',
      status: 'pending',
      requestedAt: savedCreatedAt,
      name: targetDisplayName,
      username: targetProfile.username.startsWith('@')
        ? targetProfile.username
        : `@${targetProfile.username}`,
      initials: computeInitials(
        targetProfile.first_name,
        targetProfile.last_name,
        targetProfile.full_name
      ),
      avatarUrl: targetProfile.avatar_url,
      bioNote: targetProfile.bio || '',
      mutualFriendsCount: 0,
      receiver: {
        id: targetProfile.id,
        fullName: targetDisplayName,
        username: targetProfile.username,
        initials: computeInitials(
          targetProfile.first_name,
          targetProfile.last_name,
          targetProfile.full_name
        ),
        avatarUrl: targetProfile.avatar_url,
      },
    };
  }

  /**
   * [BE-06] List Friend Requests (incoming/received, outgoing/sent, or all)
   */
  static async listFriendRequests(
    client: TypedSupabaseClient,
    currentUserId: string,
    queryInput: ListFriendRequestsQueryInput
  ): Promise<FriendRequestResponse[]> {
    const direction = queryInput.direction || 'received';
    const status = queryInput.status || 'pending';
    const limit = queryInput.limit || 50;
    const offset = queryInput.offset || 0;

    let query = client.from('friend_requests').select('*');

    if (direction === 'received') {
      query = query.eq('receiver_id', currentUserId);
    } else if (direction === 'sent') {
      query = query.eq('sender_id', currentUserId);
    } else {
      query = query.or(
        `receiver_id.eq.${currentUserId},sender_id.eq.${currentUserId}`
      );
    }

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: requests, error } = await query;

    if (error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to retrieve friend requests: ${error.message}`
      );
    }

    if (!requests || requests.length === 0) {
      return [];
    }

    // Collect profile IDs to load
    const profileIds = new Set<string>();
    for (const r of requests) {
      profileIds.add(r.sender_id);
      profileIds.add(r.receiver_id);
    }

    const { data: profiles, error: pError } = await client
      .from('profiles')
      .select('id, full_name, first_name, last_name, username, avatar_url, bio')
      .in('id', Array.from(profileIds));

    if (pError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to load request profiles: ${pError.message}`
      );
    }

    type PartialProfile = Pick<
      ProfileRow,
      | 'id'
      | 'full_name'
      | 'first_name'
      | 'last_name'
      | 'username'
      | 'avatar_url'
      | 'bio'
    >;

    const profileMap = new Map<string, PartialProfile>();
    for (const p of profiles || []) {
      profileMap.set(p.id, p);
    }

    const myFriendIds = await this.getUserFriendIds(client, currentUserId);

    return requests.map((req) => {
      const isReceived = req.receiver_id === currentUserId;
      const otherUserId = isReceived ? req.sender_id : req.receiver_id;
      const otherProfile = profileMap.get(otherUserId);
      const senderProfile = profileMap.get(req.sender_id);
      const receiverProfile = profileMap.get(req.receiver_id);

      const displayName =
        otherProfile?.full_name ||
        `${otherProfile?.first_name || ''} ${otherProfile?.last_name || ''}`.trim() ||
        otherProfile?.username ||
        'User';

      const formatPreview = (
        p?: PartialProfile
      ): FormattedUserProfilePreview | undefined => {
        if (!p) return undefined;
        return {
          id: p.id,
          fullName:
            p.full_name || `${p.first_name} ${p.last_name}`.trim() || p.username,
          username: p.username.startsWith('@') ? p.username : `@${p.username}`,
          initials: computeInitials(p.first_name, p.last_name, p.full_name),
          avatarUrl: p.avatar_url,
          bio: p.bio,
        };
      };

      return {
        id: req.id,
        senderId: req.sender_id,
        receiverId: req.receiver_id,
        direction: isReceived ? 'received' : 'sent',
        status: req.status,
        requestedAt: req.created_at,
        name: displayName,
        username: otherProfile?.username
          ? otherProfile.username.startsWith('@')
            ? otherProfile.username
            : `@${otherProfile.username}`
          : '@unknown',
        initials: computeInitials(
          otherProfile?.first_name,
          otherProfile?.last_name,
          otherProfile?.full_name
        ),
        avatarUrl: otherProfile?.avatar_url || null,
        bioNote: otherProfile?.bio || '',
        mutualFriendsCount: 0,
        sender: formatPreview(senderProfile),
        receiver: formatPreview(receiverProfile),
      };
    });
  }

  /**
   * [BE-06] Accept Friend Request
   * Validates receiver authorization and status, establishes canonical friendship,
   * updates request to 'accepted', and creates accepted notification.
   */
  static async acceptFriendRequest(
    client: TypedSupabaseClient,
    currentUserId: string,
    requestId: string
  ): Promise<{ request: FriendRequestRow; friendship: FriendshipRow }> {
    // 1. Fetch friend request
    const { data: request, error: fetchError } = await client
      .from('friend_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (fetchError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to retrieve friend request: ${fetchError.message}`
      );
    }

    if (!request) {
      throw new AppError(404, 'REQUEST_NOT_FOUND', 'Friend request not found.');
    }

    // 2. Authorize caller as the request receiver
    if (request.receiver_id !== currentUserId) {
      throw new AppError(
        403,
        'FORBIDDEN',
        'You are not authorized to accept this friend request.'
      );
    }

    // 3. Verify status
    if (request.status !== 'pending') {
      if (request.status === 'accepted') {
        throw new AppError(
          409,
          'ALREADY_ACCEPTED',
          'This friend request has already been accepted.'
        );
      }
      throw new AppError(
        400,
        'INVALID_REQUEST_STATUS',
        `Cannot accept friend request with status "${request.status}".`
      );
    }

    // 4. Verify no block between users
    const { allBlocked } = await this.getBlockedUserIds(client, currentUserId);
    if (allBlocked.has(request.sender_id)) {
      throw new AppError(
        403,
        'USER_BLOCKED',
        'Cannot accept friend request from a blocked user.'
      );
    }

    // 5. Update request status to 'accepted'
    const { data: updatedRequest, error: updateError } = await client
      .from('friend_requests')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to update friend request status: ${updateError.message}`
      );
    }

    // 6. Establish canonical friendship in friendships table (user_id_1 < user_id_2)
    const canonical = getCanonicalPair(request.sender_id, request.receiver_id);
    let establishedFriendship: FriendshipRow;

    const { data: existingFriendship } = await client
      .from('friendships')
      .select('*')
      .eq('user_id_1', canonical.user1)
      .eq('user_id_2', canonical.user2)
      .maybeSingle();

    if (existingFriendship) {
      establishedFriendship = existingFriendship;
    } else {
      const { data: newFriendship, error: friendshipInsertError } = await client
        .from('friendships')
        .insert({
          user_id_1: canonical.user1,
          user_id_2: canonical.user2,
        })
        .select()
        .single();

      if (friendshipInsertError) {
        if (friendshipInsertError.code === '23505') {
          // Unique pair constraint uq_friendships_pair: fetch existing
          const { data: fallbackFriendship } = await client
            .from('friendships')
            .select('*')
            .eq('user_id_1', canonical.user1)
            .eq('user_id_2', canonical.user2)
            .single();
          establishedFriendship = fallbackFriendship!;
        } else {
          throw new AppError(
            500,
            'DATABASE_ERROR',
            `Failed to create friendship record: ${friendshipInsertError.message}`
          );
        }
      } else {
        establishedFriendship = newFriendship;
      }
    }

    // 7. Check sender's notification preference and send acceptance notification
    const { data: senderProfile } = await client
      .from('profiles')
      .select('notify_request_accepted')
      .eq('id', request.sender_id)
      .maybeSingle();

    if (senderProfile?.notify_request_accepted) {
      const { data: receiverProfile } = await client
        .from('profiles')
        .select('full_name, username')
        .eq('id', currentUserId)
        .maybeSingle();

      const receiverName = receiverProfile?.full_name || receiverProfile?.username || 'A friend';

      try {
        await client
          .from('notifications')
          .insert({
            user_id: request.sender_id,
            actor_id: currentUserId,
            category: 'friend_request_accepted',
            title: 'Friend Request Accepted',
            detail_text: `${receiverName} accepted your friend request.`,
            is_read: false,
            metadata: {
              requestId: request.id,
              friendId: currentUserId,
            },
          });
      } catch (err: unknown) {
        console.warn('[FriendsService] Failed to create acceptance notification:', err);
      }
    }

    return {
      request: updatedRequest,
      friendship: establishedFriendship,
    };
  }

  /**
   * [BE-06] Decline Friend Request
   */
  static async declineFriendRequest(
    client: TypedSupabaseClient,
    currentUserId: string,
    requestId: string
  ): Promise<FriendRequestRow> {
    const { data: request, error: fetchError } = await client
      .from('friend_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (fetchError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to retrieve friend request: ${fetchError.message}`
      );
    }

    if (!request) {
      throw new AppError(404, 'REQUEST_NOT_FOUND', 'Friend request not found.');
    }

    if (request.receiver_id !== currentUserId) {
      throw new AppError(
        403,
        'FORBIDDEN',
        'You are not authorized to decline this friend request.'
      );
    }

    if (request.status !== 'pending') {
      throw new AppError(
        400,
        'INVALID_REQUEST_STATUS',
        `Cannot decline friend request with status "${request.status}".`
      );
    }

    const { data: updatedRequest, error: updateError } = await client
      .from('friend_requests')
      .update({
        status: 'declined',
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to decline friend request: ${updateError.message}`
      );
    }

    return updatedRequest;
  }

  /**
   * [BE-06] Cancel Sent Friend Request
   */
  static async cancelFriendRequest(
    client: TypedSupabaseClient,
    currentUserId: string,
    requestId: string
  ): Promise<FriendRequestRow> {
    const { data: request, error: fetchError } = await client
      .from('friend_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (fetchError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to retrieve friend request: ${fetchError.message}`
      );
    }

    if (!request) {
      throw new AppError(404, 'REQUEST_NOT_FOUND', 'Friend request not found.');
    }

    if (request.sender_id !== currentUserId) {
      throw new AppError(
        403,
        'FORBIDDEN',
        'You are not authorized to cancel this friend request.'
      );
    }

    if (request.status !== 'pending') {
      throw new AppError(
        400,
        'INVALID_REQUEST_STATUS',
        `Cannot cancel friend request with status "${request.status}".`
      );
    }

    const { data: updatedRequest, error: updateError } = await client
      .from('friend_requests')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to cancel friend request: ${updateError.message}`
      );
    }

    return updatedRequest;
  }

  /**
   * [BE-06] Remove Friend (Unfriend)
   * Deletes canonical friendship, cleans up any associated friend requests,
   * and removes target from caller-owned friend groups.
   */
  static async removeFriend(
    client: TypedSupabaseClient,
    currentUserId: string,
    friendId: string
  ): Promise<void> {
    if (friendId === currentUserId) {
      throw new AppError(400, 'INVALID_REQUEST', 'Cannot unfriend yourself.');
    }

    const canonical = getCanonicalPair(currentUserId, friendId);

    // 1. Delete friendship
    const { data: deleted, error: delError } = await client
      .from('friendships')
      .delete()
      .eq('user_id_1', canonical.user1)
      .eq('user_id_2', canonical.user2)
      .select('id');

    if (delError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to remove friendship: ${delError.message}`
      );
    }

    if (!deleted || deleted.length === 0) {
      throw new AppError(
        404,
        'FRIENDSHIP_NOT_FOUND',
        'You are not currently friends with this user.'
      );
    }

    // 2. Clean up any lingering friend requests between the pair so connection status resets
    await client
      .from('friend_requests')
      .delete()
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${currentUserId})`
      );

    // 3. Remove target from caller's friend groups
    const { data: ownedGroups } = await client
      .from('friend_groups')
      .select('id')
      .eq('owner_id', currentUserId);

    if (ownedGroups && ownedGroups.length > 0) {
      const groupIds = ownedGroups.map((g) => g.id);
      await client
        .from('friend_group_members')
        .delete()
        .in('group_id', groupIds)
        .eq('member_id', friendId);
    }
  }

  /**
   * [BE-06] Block User
   * Adds entry in blocked_users, severs friendship, cleans up friend requests,
   * removes from friend groups, and revokes schedule permissions.
   */
  static async blockUser(
    client: TypedSupabaseClient,
    currentUserId: string,
    targetUserId: string
  ): Promise<BlockedUserResponse> {
    if (targetUserId === currentUserId) {
      throw new AppError(
        400,
        'CANNOT_BLOCK_SELF',
        'You cannot block yourself.'
      );
    }

    // 1. Verify target user exists
    const { data: targetProfile, error: pError } = await client
      .from('profiles')
      .select('id, full_name, first_name, last_name, username, avatar_url')
      .eq('id', targetUserId)
      .maybeSingle();

    if (pError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to retrieve user: ${pError.message}`
      );
    }

    if (!targetProfile) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found.');
    }

    // 2. Check if already blocked or insert into blocked_users
    const { data: existingBlock } = await client
      .from('blocked_users')
      .select('created_at')
      .eq('blocker_id', currentUserId)
      .eq('blocked_id', targetUserId)
      .maybeSingle();

    let blockedAt = existingBlock?.created_at || new Date().toISOString();

    if (!existingBlock) {
      const { data: newBlock, error: insertError } = await client
        .from('blocked_users')
        .insert({
          blocker_id: currentUserId,
          blocked_id: targetUserId,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code !== '23505') {
          throw new AppError(
            500,
            'DATABASE_ERROR',
            `Failed to block user: ${insertError.message}`
          );
        }
      } else {
        blockedAt = newBlock.created_at;
      }
    }

    // 3. Sever existing friendship
    const canonical = getCanonicalPair(currentUserId, targetUserId);
    await client
      .from('friendships')
      .delete()
      .eq('user_id_1', canonical.user1)
      .eq('user_id_2', canonical.user2);

    // 4. Remove all friend requests between the two users
    await client
      .from('friend_requests')
      .delete()
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${currentUserId})`
      );

    // 5. Remove target user from caller's friend groups
    const { data: ownedGroups } = await client
      .from('friend_groups')
      .select('id')
      .eq('owner_id', currentUserId);

    if (ownedGroups && ownedGroups.length > 0) {
      const groupIds = ownedGroups.map((g) => g.id);
      await client
        .from('friend_group_members')
        .delete()
        .in('group_id', groupIds)
        .eq('member_id', targetUserId);
    }

    // 6. Remove target user schedule permissions
    await client
      .from('schedule_permissions')
      .delete()
      .or(
        `and(owner_id.eq.${currentUserId},target_user_id.eq.${targetUserId}),and(owner_id.eq.${targetUserId},target_user_id.eq.${currentUserId})`
      );

    const displayName =
      targetProfile.full_name ||
      `${targetProfile.first_name} ${targetProfile.last_name}`.trim() ||
      targetProfile.username;

    return {
      id: targetProfile.id,
      name: displayName,
      fullName: displayName,
      username: targetProfile.username.startsWith('@')
        ? targetProfile.username
        : `@${targetProfile.username}`,
      initials: computeInitials(
        targetProfile.first_name,
        targetProfile.last_name,
        targetProfile.full_name
      ),
      avatarUrl: targetProfile.avatar_url,
      blockedAt,
    };
  }

  /**
   * [BE-06] Unblock User
   */
  static async unblockUser(
    client: TypedSupabaseClient,
    currentUserId: string,
    targetUserId: string
  ): Promise<void> {
    if (targetUserId === currentUserId) {
      throw new AppError(400, 'INVALID_REQUEST', 'Invalid user ID.');
    }

    const { data: deleted, error } = await client
      .from('blocked_users')
      .delete()
      .eq('blocker_id', currentUserId)
      .eq('blocked_id', targetUserId)
      .select('blocker_id');

    if (error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to unblock user: ${error.message}`
      );
    }

    if (!deleted || deleted.length === 0) {
      throw new AppError(
        404,
        'BLOCK_NOT_FOUND',
        'User is not in your blocked list.'
      );
    }
  }

  /**
   * [BE-06] List Blocked Users
   */
  static async listBlockedUsers(
    client: TypedSupabaseClient,
    currentUserId: string
  ): Promise<BlockedUserResponse[]> {
    const { data: blocks, error } = await client
      .from('blocked_users')
      .select('blocked_id, created_at')
      .eq('blocker_id', currentUserId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to retrieve blocked list: ${error.message}`
      );
    }

    if (!blocks || blocks.length === 0) {
      return [];
    }

    const blockedIdToDate = new Map<string, string>();
    for (const b of blocks) {
      blockedIdToDate.set(b.blocked_id, b.created_at);
    }

    const blockedIds = Array.from(blockedIdToDate.keys());

    const { data: profiles, error: pError } = await client
      .from('profiles')
      .select('id, full_name, first_name, last_name, username, avatar_url')
      .in('id', blockedIds);

    if (pError) {
      throw new AppError(
        500,
        'DATABASE_ERROR',
        `Failed to retrieve blocked user profiles: ${pError.message}`
      );
    }

    return (profiles || []).map((p) => {
      const displayName =
        p.full_name || `${p.first_name} ${p.last_name}`.trim() || p.username;
      return {
        id: p.id,
        name: displayName,
        fullName: displayName,
        username: p.username.startsWith('@') ? p.username : `@${p.username}`,
        initials: computeInitials(p.first_name, p.last_name, p.full_name),
        avatarUrl: p.avatar_url,
        blockedAt: blockedIdToDate.get(p.id) || new Date().toISOString(),
      };
    });
  }
}
