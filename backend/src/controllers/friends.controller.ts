import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import {
  BlockUserInput,
  FriendIdParams,
  ListFriendRequestsQueryInput,
  RequestIdParams,
  SearchUsersQueryInput,
  SendFriendRequestInput,
  UserIdParams,
} from '../schemas/friends.schema';
import { FriendsService } from '../services/friends.service';

/**
 * Controller handlers for [BE-06] Friend Discovery & Connection APIs.
 */
export class FriendsController {
  /**
   * GET /api/friends/search
   * Discovers and searches users with connection status & mutual friend counts.
   */
  static async searchUsers(req: Request, res: Response): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const users = await FriendsService.searchUsers(
      client,
      userId,
      req.query as unknown as SearchUsersQueryInput
    );

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users },
    });
  }

  /**
   * GET /api/friends
   * Lists all connected friends for the authenticated user.
   */
  static async listFriends(req: Request, res: Response): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const friends = await FriendsService.listFriends(client, userId);

    res.status(200).json({
      success: true,
      count: friends.length,
      data: { friends },
    });
  }

  /**
   * POST /api/friends/requests
   * Sends a friend request, protected by PostgreSQL unique constraints.
   */
  static async sendFriendRequest(
    req: Request<Record<string, string>, unknown, SendFriendRequestInput>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const request = await FriendsService.sendFriendRequest(
      client,
      userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully.',
      data: { request },
    });
  }

  /**
   * GET /api/friends/requests
   * Lists incoming, outgoing, or all friend requests.
   */
  static async listFriendRequests(req: Request, res: Response): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const requests = await FriendsService.listFriendRequests(
      client,
      userId,
      req.query as unknown as ListFriendRequestsQueryInput
    );

    res.status(200).json({
      success: true,
      count: requests.length,
      data: { requests },
    });
  }

  /**
   * POST /api/friends/requests/:id/accept
   * Accepts a pending friend request and creates canonical friendship.
   */
  static async acceptFriendRequest(
    req: Request<RequestIdParams>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const result = await FriendsService.acceptFriendRequest(
      client,
      userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: 'Friend request accepted.',
      data: result,
    });
  }

  /**
   * POST /api/friends/requests/:id/decline
   * Declines a pending friend request.
   */
  static async declineFriendRequest(
    req: Request<RequestIdParams>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const request = await FriendsService.declineFriendRequest(
      client,
      userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: 'Friend request declined.',
      data: { request },
    });
  }

  /**
   * POST /api/friends/requests/:id/cancel
   * DELETE /api/friends/requests/:id
   * Cancels a sent pending friend request.
   */
  static async cancelFriendRequest(
    req: Request<RequestIdParams>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const request = await FriendsService.cancelFriendRequest(
      client,
      userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: 'Friend request cancelled.',
      data: { request },
    });
  }

  /**
   * DELETE /api/friends/:friendId
   * Removes a friend and cleans up relationships.
   */
  static async removeFriend(
    req: Request<FriendIdParams>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    await FriendsService.removeFriend(client, userId, req.params.friendId);

    res.status(200).json({
      success: true,
      message: 'Friend removed successfully.',
    });
  }

  /**
   * POST /api/friends/block
   * POST /api/friends/block/:userId
   * Blocks a user, severs active friendships and pending requests.
   */
  static async blockUser(
    req: Request<
      Partial<UserIdParams>,
      unknown,
      Partial<BlockUserInput>
    >,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const targetUserId =
      req.params.userId || req.body.userId || req.body.targetUserId;

    if (!targetUserId) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'User ID to block is required.'
      );
    }

    const blockedUser = await FriendsService.blockUser(
      client,
      userId,
      targetUserId
    );

    res.status(200).json({
      success: true,
      message: 'User blocked successfully.',
      data: { blockedUser },
    });
  }

  /**
   * DELETE /api/friends/block/:userId
   * Unblocks a user.
   */
  static async unblockUser(
    req: Request<UserIdParams>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    await FriendsService.unblockUser(client, userId, req.params.userId);

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully.',
    });
  }

  /**
   * GET /api/friends/blocked
   * Lists all users blocked by the caller.
   */
  static async listBlockedUsers(req: Request, res: Response): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const blockedUsers = await FriendsService.listBlockedUsers(client, userId);

    res.status(200).json({
      success: true,
      count: blockedUsers.length,
      data: { blockedUsers },
    });
  }
}
