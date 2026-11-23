import { Router } from 'express';
import { ScheduleController } from '../controllers/schedule.controller';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import {
  createScheduleSchema,
  scheduleIdParamsSchema,
  scheduleQuerySchema,
  updateScheduleSchema,
} from '../schemas/schedule.schema';

const schedulesRouter = Router();

/**
 * [BE-05] List Personal Schedules (with optional recurrence/date filtering)
 * GET /api/schedules
 */
schedulesRouter.get(
  '/',
  requireAuth,
  validate({ query: scheduleQuerySchema }),
  asyncHandler(ScheduleController.listSchedules)
);

/**
 * [BE-05] Create Personal Schedule Entry
 * POST /api/schedules
 */
schedulesRouter.post(
  '/',
  requireAuth,
  validate({ body: createScheduleSchema }),
  asyncHandler(ScheduleController.createSchedule)
);

/**
 * [BE-05] Get Single Personal Schedule Entry by ID
 * GET /api/schedules/:id
 */
schedulesRouter.get(
  '/:id',
  requireAuth,
  validate({ params: scheduleIdParamsSchema }),
  asyncHandler(ScheduleController.getScheduleById)
);

/**
 * [BE-05] Update Personal Schedule Entry
 * PATCH /api/schedules/:id
 * PUT /api/schedules/:id
 */
schedulesRouter.patch(
  '/:id',
  requireAuth,
  validate({
    params: scheduleIdParamsSchema,
    body: updateScheduleSchema,
  }),
  asyncHandler(ScheduleController.updateSchedule)
);

schedulesRouter.put(
  '/:id',
  requireAuth,
  validate({
    params: scheduleIdParamsSchema,
    body: updateScheduleSchema,
  }),
  asyncHandler(ScheduleController.updateSchedule)
);

/**
 * [BE-05] Delete Personal Schedule Entry
 * DELETE /api/schedules/:id
 */
schedulesRouter.delete(
  '/:id',
  requireAuth,
  validate({ params: scheduleIdParamsSchema }),
  asyncHandler(ScheduleController.deleteSchedule)
);

export { schedulesRouter };
