import { Router } from 'express';
import { FriendsController } from '../controllers/friends.controller';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import {
  blockUserSchema,
  friendIdParamsSchema,
  listFriendRequestsQuerySchema,
  requestIdParamsSchema,
  searchUsersQuerySchema,
  sendFriendRequestSchema,
  userIdParamsSchema,
} from '../schemas/friends.schema';

const friendsRouter = Router();

// ============================================================================
// 1. User Discovery & Search
// ============================================================================

/**
 * [BE-06] Search & Discover Users
 * GET /api/friends/search
 * GET /api/friends/discover
 */
friendsRouter.get(
  '/search',
  requireAuth,
  validate({ query: searchUsersQuerySchema }),
  asyncHandler(FriendsController.searchUsers)
);

friendsRouter.get(
  '/discover',
  requireAuth,
  validate({ query: searchUsersQuerySchema }),
  asyncHandler(FriendsController.searchUsers)
);

// ============================================================================
// 2. Friend Requests Endpoints
// ============================================================================

/**
 * [BE-06] List Friend Requests
 * GET /api/friends/requests
 */
friendsRouter.get(
  '/requests',
  requireAuth,
  validate({ query: listFriendRequestsQuerySchema }),
  asyncHandler(FriendsController.listFriendRequests)
);

/**
 * [BE-06] Send Friend Request
 * POST /api/friends/requests
 */
friendsRouter.post(
  '/requests',
  requireAuth,
  validate({ body: sendFriendRequestSchema }),
  asyncHandler(FriendsController.sendFriendRequest)
);

/**
 * [BE-06] Accept Friend Request
 * POST /api/friends/requests/:id/accept
 * PUT /api/friends/requests/:id/accept
 */
friendsRouter.post(
  '/requests/:id/accept',
  requireAuth,
  validate({ params: requestIdParamsSchema }),
  asyncHandler(FriendsController.acceptFriendRequest)
);

friendsRouter.put(
  '/requests/:id/accept',
  requireAuth,
  validate({ params: requestIdParamsSchema }),
  asyncHandler(FriendsController.acceptFriendRequest)
);

/**
 * [BE-06] Decline Friend Request
 * POST /api/friends/requests/:id/decline
 * PUT /api/friends/requests/:id/decline
 */
friendsRouter.post(
  '/requests/:id/decline',
  requireAuth,
  validate({ params: requestIdParamsSchema }),
  asyncHandler(FriendsController.declineFriendRequest)
);

friendsRouter.put(
  '/requests/:id/decline',
  requireAuth,
  validate({ params: requestIdParamsSchema }),
  asyncHandler(FriendsController.declineFriendRequest)
);

/**
 * [BE-06] Cancel Sent Friend Request
 * POST /api/friends/requests/:id/cancel
 * DELETE /api/friends/requests/:id
 */
friendsRouter.post(
  '/requests/:id/cancel',
  requireAuth,
  validate({ params: requestIdParamsSchema }),
  asyncHandler(FriendsController.cancelFriendRequest)
);

friendsRouter.delete(
  '/requests/:id',
  requireAuth,
  validate({ params: requestIdParamsSchema }),
  asyncHandler(FriendsController.cancelFriendRequest)
);

// ============================================================================
// 3. User Blocking Endpoints
// ============================================================================

/**
 * [BE-06] List Blocked Users
 * GET /api/friends/blocked
 */
friendsRouter.get(
  '/blocked',
  requireAuth,
  asyncHandler(FriendsController.listBlockedUsers)
);

/**
 * [BE-06] Block a User
 * POST /api/friends/block
 * POST /api/friends/block/:userId
 */
friendsRouter.post(
  '/block',
  requireAuth,
  validate({ body: blockUserSchema }),
  asyncHandler(FriendsController.blockUser)
);

friendsRouter.post(
  '/block/:userId',
  requireAuth,
  validate({ params: userIdParamsSchema }),
  asyncHandler(FriendsController.blockUser)
);

/**
 * [BE-06] Unblock a User
 * DELETE /api/friends/block/:userId
 */
friendsRouter.delete(
  '/block/:userId',
  requireAuth,
  validate({ params: userIdParamsSchema }),
  asyncHandler(FriendsController.unblockUser)
);

// ============================================================================
// 4. Connected Friends Endpoints
// ============================================================================

/**
 * [BE-06] List All Connected Friends
 * GET /api/friends
 */
friendsRouter.get(
  '/',
  requireAuth,
  asyncHandler(FriendsController.listFriends)
);

/**
 * [BE-06] Remove Friend (Unfriend)
 * DELETE /api/friends/:friendId
 */
friendsRouter.delete(
  '/:friendId',
  requireAuth,
  validate({ params: friendIdParamsSchema }),
  asyncHandler(FriendsController.removeFriend)
);

export { friendsRouter };
