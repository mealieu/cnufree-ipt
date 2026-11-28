import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import {
  DashboardAvailabilityQueryInput,
  FriendAvailabilityParams,
  FriendAvailabilityQueryInput,
  OverlapQueryInput,
  PermissionCheckParams,
} from '../schemas/availability.schema';
import { AvailabilityService } from '../services/availability.service';
import { PermissionService } from '../services/permission.service';

/**
 * Controller handlers for [BE-08] Availability & Overlap Engine
 * and [BE-09] Schedule Permission & State Checks.
 */
export class AvailabilityController {
  /**
   * GET /api/availability/dashboard
   * Returns real-time free/occupied statuses for the Home dashboard and Best Window Today.
   */
  static async getDashboardAvailability(
    req: Request,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const data = await AvailabilityService.getDashboardAvailability(
      client,
      userId,
      req.query as unknown as DashboardAvailabilityQueryInput
    );

    res.status(200).json({
      success: true,
      data,
    });
  }

  /**
   * GET /api/availability/overlap
   * Calculates overlapping free windows (prioritizing Lunch & Dismissal gaps)
   * for the Shared calendar in daily or weekly mode.
   */
  static async getOverlappingWindows(
    req: Request,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const data = await AvailabilityService.getOverlappingWindows(
      client,
      userId,
      req.query as unknown as OverlapQueryInput
    );

    res.status(200).json({
      success: true,
      data,
    });
  }

  /**
   * GET /api/availability/friends/:friendId
   * Fetches a single friend's real-time status, schedule, and mutual free windows,
   * enforcing [BE-09] block-list and visibility permissions.
   */
  static async getFriendAvailability(
    req: Request<FriendAvailabilityParams>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const data = await AvailabilityService.getFriendAvailability(
      client,
      userId,
      req.params.friendId,
      req.query as unknown as FriendAvailabilityQueryInput
    );

    res.status(200).json({
      success: true,
      data,
    });
  }

  /**
   * GET /api/availability/permissions/:targetUserId
   * Evaluates [BE-09] schedule visibility, block-list status, and clean state
   * (`available`, `privacy-restricted`, `missing`, `unavailable`) for a target user.
   */
  static async checkSchedulePermission(
    req: Request<PermissionCheckParams>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const decision = await PermissionService.evaluateScheduleAccess(
      client,
      userId,
      req.params.targetUserId
    );

    if (!decision.profileExists && !decision.isBlocked) {
      throw new AppError(
        404,
        'USER_NOT_FOUND',
        'Target user does not exist.',
        {
          scheduleState: decision.scheduleState,
          reason: decision.reason,
        }
      );
    }

    res.status(200).json({
      success: true,
      data: {
        permission: decision,
      },
    });
  }
}
