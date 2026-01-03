import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt.js';
import {
  defaultTransactionCategories,
  defaultPasswordCategories,
} from '../../prisma/seed.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 */
export const signup = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(400, 'Email already registered');
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user with default categories
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      transactionCategories: {
        create: defaultTransactionCategories.map((cat) => ({
          name: cat,
          isDefault: true,
        })),
      },
      passwordCategories: {
        create: defaultPasswordCategories.map((cat) => ({
          name: cat,
          isDefault: true,
        })),
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email, isDeleted: false },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

  // Store refresh token (remove old ones first)
  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    },
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 */
export const logout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.userId;

  if (userId) {
    // Remove all refresh tokens for this user
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { refreshToken: token } = req.body;

  // Verify the refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'Invalid refresh token');
  }

  // Check if refresh token exists in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    // Clean up expired token
    if (storedToken) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    }
    throw new ApiError(401, 'Refresh token expired');
  }

  // Generate new access token
  const accessToken = generateAccessToken({
    userId: decoded.userId,
    email: decoded.email,
  });

  res.json({
    success: true,
    data: {
      accessToken,
    },
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 */
export const getMe = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    success: true,
    data: user,
  });
});
