import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Get all transaction categories for current user
 * @route   GET /api/categories/transactions
 */
export const getTransactionCategories = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;

  const categories = await prisma.transactionCategory.findMany({
    where: { userId, isDeleted: false },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });

  res.json({
    success: true,
    data: categories.map((c) => ({
      id: c.id,
      name: c.name,
      isDefault: c.isDefault,
    })),
  });
});

/**
 * @desc    Get all password categories for current user
 * @route   GET /api/categories/passwords
 */
export const getPasswordCategories = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;

  const categories = await prisma.passwordCategory.findMany({
    where: { userId, isDeleted: false },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });

  res.json({
    success: true,
    data: categories.map((c) => ({
      id: c.id,
      name: c.name,
      isDefault: c.isDefault,
    })),
  });
});

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 */
export const createCategory = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { name, type } = req.body; // type: 'transaction' | 'password'

  if (type === 'transaction') {
    // Check if category name already exists for this user
    const existing = await prisma.transactionCategory.findFirst({
      where: { name, userId, isDeleted: false },
    });

    if (existing) {
      throw new ApiError(400, 'Category already exists');
    }

    const category = await prisma.transactionCategory.create({
      data: {
        name,
        userId,
        isDefault: false,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        id: category.id,
        name: category.name,
        isDefault: category.isDefault,
      },
    });
  } else if (type === 'password') {
    // Check if category name already exists for this user
    const existing = await prisma.passwordCategory.findFirst({
      where: { name, userId, isDeleted: false },
    });

    if (existing) {
      throw new ApiError(400, 'Category already exists');
    }

    const category = await prisma.passwordCategory.create({
      data: {
        name,
        userId,
        isDefault: false,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        id: category.id,
        name: category.name,
        isDefault: category.isDefault,
      },
    });
  } else {
    throw new ApiError(400, 'Invalid category type');
  }
});

/**
 * @desc    Delete a category (soft delete)
 * @route   DELETE /api/categories/:type/:id
 */
export const deleteCategory = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { type, id } = req.params;

  if (type === 'transaction' || type === 'transactions') {
    const category = await prisma.transactionCategory.findFirst({
      where: { id, userId, isDeleted: false },
    });

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    if (category.isDefault) {
      throw new ApiError(400, 'Cannot delete default categories');
    }

    // Check if category is in use
    const inUse = await prisma.transaction.count({
      where: { categoryId: id, isDeleted: false },
    });

    if (inUse > 0) {
      throw new ApiError(400, 'Cannot delete category that is in use');
    }

    await prisma.transactionCategory.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } else if (type === 'password' || type === 'passwords') {
    const category = await prisma.passwordCategory.findFirst({
      where: { id, userId, isDeleted: false },
    });

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    if (category.isDefault) {
      throw new ApiError(400, 'Cannot delete default categories');
    }

    // Check if category is in use
    const inUse = await prisma.passwordVault.count({
      where: { categoryId: id, isDeleted: false },
    });

    if (inUse > 0) {
      throw new ApiError(400, 'Cannot delete category that is in use');
    }

    await prisma.passwordCategory.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } else {
    throw new ApiError(400, 'Invalid category type');
  }
});
