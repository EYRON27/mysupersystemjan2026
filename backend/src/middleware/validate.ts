import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from './errorHandler.js';

/**
 * Validation middleware - checks express-validator results
 */
export const validate = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => {
      if (error.type === 'field') {
        return `${error.path}: ${error.msg}`;
      }
      return error.msg;
    });

    throw new ApiError(400, errorMessages.join(', '));
  }

  next();
};
