import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import { encryptPassword, decryptPassword } from '../utils/encryption.js';
import { Prisma } from '@prisma/client';

/**
 * @desc    Get all password entries for current user
 * @route   GET /api/vault
 */
export const getPasswords = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { page = '1', limit = '20', categoryId, search } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: Prisma.PasswordVaultWhereInput = {
    userId,
    isDeleted: false,
  };

  if (categoryId) {
    where.categoryId = categoryId as string;
  }

  if (search) {
    where.OR = [
      { website: { contains: search as string, mode: 'insensitive' } },
      { username: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [passwords, total] = await Promise.all([
    prisma.passwordVault.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.passwordVault.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      passwords: passwords.map((p) => ({
        id: p.id,
        website: p.website,
        username: p.username,
        // Password is masked - user must verify to reveal
        password: '••••••••',
        category: p.category.name,
        categoryId: p.category.id,
        notes: p.notes,
        createdAt: p.createdAt.toISOString().split('T')[0],
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
});

/**
 * @desc    Get single password entry (masked)
 * @route   GET /api/vault/:id
 */
export const getPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const password = await prisma.passwordVault.findFirst({
    where: { id, userId, isDeleted: false },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  if (!password) {
    throw new ApiError(404, 'Password entry not found');
  }

  res.json({
    success: true,
    data: {
      id: password.id,
      website: password.website,
      username: password.username,
      password: '••••••••', // Masked
      category: password.category.name,
      categoryId: password.category.id,
      notes: password.notes,
      createdAt: password.createdAt.toISOString().split('T')[0],
    },
  });
});

/**
 * @desc    Reveal password after re-authentication
 * @route   POST /api/vault/:id/reveal
 */
export const revealPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { password: userPassword } = req.body;

  // Get user to verify password
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(401, 'User not found');
  }

  // Verify user's password
  const isValid = await bcrypt.compare(userPassword, user.password);

  if (!isValid) {
    throw new ApiError(401, 'Invalid password');
  }

  // Get the password entry
  const passwordEntry = await prisma.passwordVault.findFirst({
    where: { id, userId, isDeleted: false },
  });

  if (!passwordEntry) {
    throw new ApiError(404, 'Password entry not found');
  }

  // Decrypt and return the password
  const decryptedPassword = decryptPassword(passwordEntry.encryptedPassword);

  res.json({
    success: true,
    data: {
      password: decryptedPassword,
    },
  });
});

/**
 * @desc    Create new password entry
 * @route   POST /api/vault
 */
export const createPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { website, username, password, categoryId, notes } = req.body;

  // Verify category belongs to user
  const category = await prisma.passwordCategory.findFirst({
    where: { id: categoryId, userId, isDeleted: false },
  });

  if (!category) {
    throw new ApiError(400, 'Invalid category');
  }

  // Encrypt the password
  const encryptedPassword = encryptPassword(password);

  const passwordEntry = await prisma.passwordVault.create({
    data: {
      website,
      username,
      encryptedPassword,
      notes: notes || null,
      userId,
      categoryId,
    },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Password saved securely',
    data: {
      id: passwordEntry.id,
      website: passwordEntry.website,
      username: passwordEntry.username,
      password: '••••••••',
      category: passwordEntry.category.name,
      categoryId: passwordEntry.category.id,
      notes: passwordEntry.notes,
      createdAt: passwordEntry.createdAt.toISOString().split('T')[0],
    },
  });
});

/**
 * @desc    Update password entry
 * @route   PUT /api/vault/:id
 */
export const updatePassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { website, username, password, categoryId, notes } = req.body;

  // Check password entry exists and belongs to user
  const existing = await prisma.passwordVault.findFirst({
    where: { id, userId, isDeleted: false },
  });

  if (!existing) {
    throw new ApiError(404, 'Password entry not found');
  }

  const updateData: Prisma.PasswordVaultUpdateInput = {};

  if (website !== undefined) updateData.website = website;
  if (username !== undefined) updateData.username = username;
  if (notes !== undefined) updateData.notes = notes || null;

  // If password is being updated, encrypt it
  if (password !== undefined) {
    updateData.encryptedPassword = encryptPassword(password);
  }

  // If category is being updated, verify it belongs to user
  if (categoryId !== undefined) {
    const category = await prisma.passwordCategory.findFirst({
      where: { id: categoryId, userId, isDeleted: false },
    });

    if (!category) {
      throw new ApiError(400, 'Invalid category');
    }
    updateData.category = { connect: { id: categoryId } };
  }

  const passwordEntry = await prisma.passwordVault.update({
    where: { id },
    data: updateData,
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  res.json({
    success: true,
    message: 'Password updated successfully',
    data: {
      id: passwordEntry.id,
      website: passwordEntry.website,
      username: passwordEntry.username,
      password: '••••••••',
      category: passwordEntry.category.name,
      categoryId: passwordEntry.category.id,
      notes: passwordEntry.notes,
    },
  });
});

/**
 * @desc    Delete password entry (soft delete)
 * @route   DELETE /api/vault/:id
 */
export const deletePassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const existing = await prisma.passwordVault.findFirst({
    where: { id, userId, isDeleted: false },
  });

  if (!existing) {
    throw new ApiError(404, 'Password entry not found');
  }

  await prisma.passwordVault.update({
    where: { id },
    data: { isDeleted: true },
  });

  res.json({
    success: true,
    message: 'Password entry deleted successfully',
  });
});
