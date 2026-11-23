import { Router } from 'express';
import { GroupsController } from '../controllers/groups.controller';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import {
  addGroupMemberSchema,
  createGroupSchema,
  groupIdParamsSchema,
  groupMemberParamsSchema,
  updateGroupSchema,
} from '../schemas/groups.schema';

const groupsRouter = Router();

// ============================================================================
// Friend Group CRUD Endpoints ([BE-07])
// ============================================================================

/**
 * [BE-07] List Friend Groups
 * GET /api/groups
 */
groupsRouter.get(
  '/',
  requireAuth,
  asyncHandler(GroupsController.listGroups)
);

/**
 * [BE-07] Create Friend Group
 * POST /api/groups
 */
groupsRouter.post(
  '/',
  requireAuth,
  validate({ body: createGroupSchema }),
  asyncHandler(GroupsController.createGroup)
);

/**
 * [BE-07] Get Single Friend Group by ID
 * GET /api/groups/:id
 */
groupsRouter.get(
  '/:id',
  requireAuth,
  validate({ params: groupIdParamsSchema }),
  asyncHandler(GroupsController.getGroupById)
);

/**
 * [BE-07] Update / Rename Friend Group
 * PATCH /api/groups/:id
 * PUT /api/groups/:id
 */
groupsRouter.patch(
  '/:id',
  requireAuth,
  validate({
    params: groupIdParamsSchema,
    body: updateGroupSchema,
  }),
  asyncHandler(GroupsController.updateGroup)
);

groupsRouter.put(
  '/:id',
  requireAuth,
  validate({
    params: groupIdParamsSchema,
    body: updateGroupSchema,
  }),
  asyncHandler(GroupsController.updateGroup)
);

/**
 * [BE-07] Delete Friend Group
 * DELETE /api/groups/:id
 */
groupsRouter.delete(
  '/:id',
  requireAuth,
  validate({ params: groupIdParamsSchema }),
  asyncHandler(GroupsController.deleteGroup)
);

// ============================================================================
// Group Members Management Endpoints ([BE-07])
// ============================================================================

/**
 * [BE-07] List Group Members
 * GET /api/groups/:id/members
 */
groupsRouter.get(
  '/:id/members',
  requireAuth,
  validate({ params: groupIdParamsSchema }),
  asyncHandler(GroupsController.listMembers)
);

/**
 * [BE-07] Add Member(s) to Group
 * POST /api/groups/:id/members
 */
groupsRouter.post(
  '/:id/members',
  requireAuth,
  validate({
    params: groupIdParamsSchema,
    body: addGroupMemberSchema,
  }),
  asyncHandler(GroupsController.addMembers)
);

/**
 * [BE-07] Remove Member from Group
 * DELETE /api/groups/:id/members/:memberId
 */
groupsRouter.delete(
  '/:id/members/:memberId',
  requireAuth,
  validate({ params: groupMemberParamsSchema }),
  asyncHandler(GroupsController.removeMember)
);

export { groupsRouter };
