import { Router } from 'express';
import { AvailabilityController } from '../controllers/availability.controller';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import {
  dashboardAvailabilityQuerySchema,
  friendAvailabilityParamsSchema,
  friendAvailabilityQuerySchema,
  overlapQuerySchema,
  permissionCheckParamsSchema,
} from '../schemas/availability.schema';

const availabilityRouter = Router();

/**
 * [BE-08] Real-Time Home Dashboard Availability & Best Window
 * GET /api/availability/dashboard
 */
availabilityRouter.get(
  '/dashboard',
  requireAuth,
  validate({ query: dashboardAvailabilityQuerySchema }),
  asyncHandler(AvailabilityController.getDashboardAvailability)
);

/**
 * [BE-08] Shared Calendar Overlapping Free Windows (Day & Week, Lunch/Dismissal prioritized)
 * GET /api/availability/overlap
 */
availabilityRouter.get(
  '/overlap',
  requireAuth,
  validate({ query: overlapQuerySchema }),
  asyncHandler(AvailabilityController.getOverlappingWindows)
);

/**
 * [BE-09] Schedule Visibility & Block-List Permission Check
 * GET /api/availability/permissions/:targetUserId
 */
availabilityRouter.get(
  '/permissions/:targetUserId',
  requireAuth,
  validate({ params: permissionCheckParamsSchema }),
  asyncHandler(AvailabilityController.checkSchedulePermission)
);

/**
 * [BE-08] + [BE-09] Friend Real-Time Availability & Mutual Free Windows
 * GET /api/availability/friends/:friendId
 */
availabilityRouter.get(
  '/friends/:friendId',
  requireAuth,
  validate({
    params: friendAvailabilityParamsSchema,
    query: friendAvailabilityQuerySchema,
  }),
  asyncHandler(AvailabilityController.getFriendAvailability)
);

export { availabilityRouter };
