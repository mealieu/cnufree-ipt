import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import {
  AddGroupMemberInput,
  CreateGroupInput,
  GroupIdParams,
  GroupMemberParams,
  UpdateGroupInput,
} from '../schemas/groups.schema';
import { GroupsService } from '../services/groups.service';

/**
 * Controller handlers for [BE-07] Friend Group management APIs.
 */
export class GroupsController {
  /**
   * GET /api/groups
   * Lists all friend groups owned by the authenticated user.
   */
  static async listGroups(req: Request, res: Response): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const groups = await GroupsService.listGroups(client, userId);

    res.status(200).json({
      success: true,
      count: groups.length,
      data: { groups },
    });
  }

  /**
   * GET /api/groups/:id
   * Retrieves a single friend group by ID.
   */
  static async getGroupById(
    req: Request<GroupIdParams>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const group = await GroupsService.getGroupById(
      client,
      userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: { group },
    });
  }

  /**
   * POST /api/groups
   * Creates a new friend group with optional initial members.
   */
  static async createGroup(
    req: Request<Record<string, string>, unknown, CreateGroupInput>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const group = await GroupsService.createGroup(
      client,
      userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Friend group created successfully.',
      data: { group },
    });
  }

  /**
   * PATCH /api/groups/:id
   * PUT /api/groups/:id
   * Updates / renames a friend group and/or synchronizes members.
   */
  static async updateGroup(
    req: Request<GroupIdParams, unknown, UpdateGroupInput>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const group = await GroupsService.updateGroup(
      client,
      userId,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Friend group updated successfully.',
      data: { group },
    });
  }

  /**
   * DELETE /api/groups/:id
   * Deletes a friend group.
   */
  static async deleteGroup(
    req: Request<GroupIdParams>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    await GroupsService.deleteGroup(client, userId, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Friend group deleted successfully.',
    });
  }

  /**
   * GET /api/groups/:id/members
   * Lists all members of a friend group.
   */
  static async listMembers(
    req: Request<GroupIdParams>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const members = await GroupsService.listMembers(
      client,
      userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      count: members.length,
      data: { members },
    });
  }

  /**
   * POST /api/groups/:id/members
   * Adds one or more members to a friend group.
   */
  static async addMembers(
    req: Request<GroupIdParams, unknown, AddGroupMemberInput>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const group = await GroupsService.addMembers(
      client,
      userId,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Members added to friend group successfully.',
      data: { group },
    });
  }

  /**
   * DELETE /api/groups/:id/members/:memberId
   * Removes a member from a friend group.
   */
  static async removeMember(
    req: Request<GroupMemberParams>,
    res: Response
  ): Promise<void> {
    const userId = req.auth?.userId;
    const client = req.supabase;

    if (!userId || !client) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    await GroupsService.removeMember(
      client,
      userId,
      req.params.id,
      req.params.memberId
    );

    res.status(200).json({
      success: true,
      message: 'Member removed from friend group successfully.',
    });
  }
}
