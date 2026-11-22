import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const apiRouter = Router();

/**
 * [BE-01] Health check endpoint
 * GET /api/health
 */
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * [BE-03] Protected JWT verification endpoint
 * GET /api/auth/me
 */
apiRouter.get(
  '/auth/me',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        auth: {
          userId: req.auth?.userId,
          email: req.auth?.email,
          role: req.auth?.role,
        },
      },
    });
  })
);

// ----------------------------------------------------------------------------
// Feature Router Mount Points for Upcoming Backend Tickets ([BE-04]–[BE-12])
// ----------------------------------------------------------------------------
// [BE-04] apiRouter.use('/profile', profileRouter);
// [BE-05] apiRouter.use('/schedules', schedulesRouter);
// [BE-06] apiRouter.use('/friends', friendsRouter);
// [BE-07] apiRouter.use('/groups', groupsRouter);
// [BE-08] apiRouter.use('/availability', availabilityRouter);
// [BE-10] apiRouter.use('/ocr', ocrRouter);
// [BE-11] apiRouter.use('/notifications', notificationsRouter);
// [BE-12] apiRouter.use('/shared-links', sharedLinksRouter);

export { apiRouter };
