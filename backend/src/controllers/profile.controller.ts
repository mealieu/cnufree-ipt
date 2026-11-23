import { Request, Response } from 'express';
import { supabaseAnon } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import {
  ProfileIdentifierParams,
  UpdateNotificationPreferencesInput,
  UpdateProfileInput,
  UpdateScheduleVisibilityInput,
} from '../schemas/profile.schema';
import { ProfileService } from '../services/profile.service';

/**
 * Controller handlers for [BE-04] User Profile & Settings APIs.
 */
export class ProfileController {
  /**
   * GET /api/profile / GET /api/profile/me
   * Fetches the authenticated user's profile and settings.
   */
  static async getMyProfile(req: Request, res: Response): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const profile = await ProfileService.getProfileByUserId(client, userId);

    res.status(200).json({
      success: true,
      data: { profile },
    });
  }

  /**
   * PATCH /api/profile / PUT /api/profile
   * Updates personal details, notification preferences, and/or schedule visibility rules.
   */
  static async updateMyProfile(
    req: Request<Record<string, string>, unknown, UpdateProfileInput>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const profile = await ProfileService.updateProfileDetails(
      client,
      userId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { profile },
    });
  }

  /**
   * GET /api/profile/notifications
   * Fetches notification preferences for friend requests, acceptances, and schedule updates.
   */
  static async getNotificationPreferences(
    req: Request,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const notificationPreferences =
      await ProfileService.getNotificationPreferences(client, userId);

    res.status(200).json({
      success: true,
      data: { notificationPreferences },
    });
  }

  /**
   * PATCH /api/profile/notifications / PUT /api/profile/notifications
   * Updates notification preferences.
   */
  static async updateNotificationPreferences(
    req: Request<
      Record<string, string>,
      unknown,
      UpdateNotificationPreferencesInput
    >,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const notificationPreferences =
      await ProfileService.updateNotificationPreferences(
        client,
        userId,
        req.body
      );

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully.',
      data: { notificationPreferences },
    });
  }

  /**
   * GET /api/profile/visibility
   * Fetches current schedule visibility rule and selected friend/group permissions.
   */
  static async getScheduleVisibility(
    req: Request,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const visibility = await ProfileService.getScheduleVisibility(
      client,
      userId
    );

    res.status(200).json({
      success: true,
      data: { visibility },
    });
  }

  /**
   * PUT /api/profile/visibility / PATCH /api/profile/visibility
   * Updates schedule visibility rules (private, friends-only, selected-groups).
   */
  static async updateScheduleVisibility(
    req: Request<
      Record<string, string>,
      unknown,
      UpdateScheduleVisibilityInput
    >,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const visibility = await ProfileService.updateScheduleVisibility(
      client,
      userId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Schedule visibility updated successfully.',
      data: { visibility },
    });
  }

  /**
   * GET /api/profile/:identifier
   * Looks up a user's public profile by UUID or username.
   */
  static async getProfileByIdentifier(
    req: Request<ProfileIdentifierParams>,
    res: Response
  ): Promise<void> {
    const identifier = req.params.identifier;
    const client = req.supabase || supabaseAnon;

    const profile = await ProfileService.getPublicProfileByIdentifier(
      client,
      identifier
    );

    res.status(200).json({
      success: true,
      data: { profile },
    });
  }
}
