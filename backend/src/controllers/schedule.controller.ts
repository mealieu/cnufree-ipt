import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import {
  CreateScheduleInput,
  ScheduleIdParams,
  ScheduleQueryInput,
  UpdateScheduleInput,
} from '../schemas/schedule.schema';
import { ScheduleService } from '../services/schedule.service';

/**
 * Controller handlers for [BE-05] Personal Schedule CRUD APIs.
 */
export class ScheduleController {
  /**
   * GET /api/schedules
   * Retrieves all schedule entries for the authenticated user (with optional filtering).
   */
  static async listSchedules(req: Request, res: Response): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const schedules = await ScheduleService.listSchedules(
      client,
      userId,
      req.query as unknown as ScheduleQueryInput
    );

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: { schedules },
    });
  }

  /**
   * GET /api/schedules/:id
   * Retrieves a single schedule entry by ID, verifying user ownership.
   */
  static async getScheduleById(
    req: Request<ScheduleIdParams>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const schedule = await ScheduleService.getScheduleById(
      client,
      userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: { schedule },
    });
  }

  /**
   * POST /api/schedules
   * Creates a new personal schedule entry with time range validation.
   */
  static async createSchedule(
    req: Request<Record<string, string>, unknown, CreateScheduleInput>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const schedule = await ScheduleService.createSchedule(
      client,
      userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Schedule entry created successfully.',
      data: { schedule },
    });
  }

  /**
   * PATCH /api/schedules/:id / PUT /api/schedules/:id
   * Updates an existing personal schedule entry.
   */
  static async updateSchedule(
    req: Request<ScheduleIdParams, unknown, UpdateScheduleInput>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const schedule = await ScheduleService.updateSchedule(
      client,
      userId,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Schedule entry updated successfully.',
      data: { schedule },
    });
  }

  /**
   * DELETE /api/schedules/:id
   * Deletes a personal schedule entry.
   */
  static async deleteSchedule(
    req: Request<ScheduleIdParams>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const result = await ScheduleService.deleteSchedule(
      client,
      userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: 'Schedule entry deleted successfully.',
      data: result,
    });
  }
}
