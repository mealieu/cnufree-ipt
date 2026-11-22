import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { AppError } from './errorHandler';

export interface RequestValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Reusable Zod request validation middleware.
 * Validates body, query, and/or params and forwards a structured 400 AppError on failure.
 */
export function validate(schemas: RequestValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join('.') || 'request',
          message: issue.message,
          code: issue.code,
        }));

        next(
          new AppError(
            400,
            'VALIDATION_ERROR',
            'Request validation failed.',
            formattedErrors
          )
        );
        return;
      }

      next(error);
    }
  };
}
