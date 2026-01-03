import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from './errorHandler.js';
import { prisma } from '../config/database.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    try {
      const decoded = verifyAccessToken(token);
      
      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId, isDeleted: false },
        select: { id: true, email: true },
      });

      if (!user) {
        throw new ApiError(401, 'User not found');
      }

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };

      next();
    } catch {
      throw new ApiError(401, 'Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - doesn't throw if no token
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      if (token) {
        try {
          const decoded = verifyAccessToken(token);
          req.user = {
            userId: decoded.userId,
            email: decoded.email,
          };
        } catch {
          // Token invalid, but we don't throw - just continue without user
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
