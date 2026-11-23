import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { optionalAuth, requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import {
  profileIdentifierParamsSchema,
  updateNotificationPreferencesSchema,
  updateProfileSchema,
  updateScheduleVisibilitySchema,
} from '../schemas/profile.schema';

const profileRouter = Router();

/**
 * [BE-04] Personal Profile Details
 * GET /api/profile
 * GET /api/profile/me
 */
profileRouter.get(
  '/',
  requireAuth,
  asyncHandler(ProfileController.getMyProfile)
);

profileRouter.get(
  '/me',
  requireAuth,
  asyncHandler(ProfileController.getMyProfile)
);

/**
 * [BE-04] Update Profile Details (Personal Details, Notification Prefs, Visibility)
 * PATCH /api/profile
 * PUT /api/profile
 */
profileRouter.patch(
  '/',
  requireAuth,
  validate({ body: updateProfileSchema }),
  asyncHandler(ProfileController.updateMyProfile)
);

profileRouter.put(
  '/',
  requireAuth,
  validate({ body: updateProfileSchema }),
  asyncHandler(ProfileController.updateMyProfile)
);

/**
 * [BE-04] Notification Preferences
 * GET /api/profile/notifications
 * PATCH /api/profile/notifications
 * PUT /api/profile/notifications
 */
profileRouter.get(
  '/notifications',
  requireAuth,
  asyncHandler(ProfileController.getNotificationPreferences)
);

profileRouter.patch(
  '/notifications',
  requireAuth,
  validate({ body: updateNotificationPreferencesSchema }),
  asyncHandler(ProfileController.updateNotificationPreferences)
);

profileRouter.put(
  '/notifications',
  requireAuth,
  validate({ body: updateNotificationPreferencesSchema }),
  asyncHandler(ProfileController.updateNotificationPreferences)
);

/**
 * [BE-04] Schedule Visibility Rules (private, friends-only, selected-groups)
 * GET /api/profile/visibility
 * PUT /api/profile/visibility
 * PATCH /api/profile/visibility
 */
profileRouter.get(
  '/visibility',
  requireAuth,
  asyncHandler(ProfileController.getScheduleVisibility)
);

profileRouter.put(
  '/visibility',
  requireAuth,
  validate({ body: updateScheduleVisibilitySchema }),
  asyncHandler(ProfileController.updateScheduleVisibility)
);

profileRouter.patch(
  '/visibility',
  requireAuth,
  validate({ body: updateScheduleVisibilitySchema }),
  asyncHandler(ProfileController.updateScheduleVisibility)
);

/**
 * [BE-04] Public Profile Lookup (by username or user UUID)
 * GET /api/profile/:identifier
 */
profileRouter.get(
  '/:identifier',
  optionalAuth,
  validate({ params: profileIdentifierParamsSchema }),
  asyncHandler(ProfileController.getProfileByIdentifier)
);

export { profileRouter };
