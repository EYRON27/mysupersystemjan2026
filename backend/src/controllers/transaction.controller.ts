import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import { Prisma } from '@prisma/client';

/**
 * @desc    Get all transactions for current user
 * @route   GET /api/transactions
 */
export const getTransactions = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { page = '1', limit = '20', type, categoryId, startDate, endDate, period } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: Prisma.TransactionWhereInput = {
    userId,
    isDeleted: false,
  };

  if (type) {
    where.type = type === 'income' ? 'INCOME' : 'EXPENSE';
  }

  if (categoryId) {
    where.categoryId = categoryId as string;
  }

  // Date filters
  if (period) {
    const now = new Date();
    let startOfPeriod: Date;

    switch (period) {
      case 'daily':
        startOfPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startOfPeriod = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startOfPeriod = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startOfPeriod = new Date(0);
    }

    where.date = { gte: startOfPeriod };
  } else if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.date.lte = new Date(endDate as string);
    }
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.transaction.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      transactions: transactions.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        type: t.type.toLowerCase(),
        description: t.description,
        date: t.date.toISOString().split('T')[0],
        category: t.category.name,
        categoryId: t.category.id,
        createdAt: t.createdAt,
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
 * @desc    Get transaction summary
 * @route   GET /api/transactions/summary
 */
export const getTransactionSummary = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { period = 'monthly' } = req.query;

  // Calculate date range based on period
  const now = new Date();
  let startOfPeriod: Date;

  switch (period) {
    case 'daily':
      startOfPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      startOfPeriod = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'yearly':
      startOfPeriod = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const [incomeResult, expenseResult, transactionCount] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId,
        isDeleted: false,
        type: 'INCOME',
        date: { gte: startOfPeriod },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId,
        isDeleted: false,
        type: 'EXPENSE',
        date: { gte: startOfPeriod },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.count({
      where: {
        userId,
        isDeleted: false,
        date: { gte: startOfPeriod },
      },
    }),
  ]);

  const income = Number(incomeResult._sum.amount || 0);
  const expenses = Number(expenseResult._sum.amount || 0);
  const balance = income - expenses;
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

  res.json({
    success: true,
    data: {
      income,
      expenses,
      balance,
      savingsRate,
      transactionCount,
      period,
    },
  });
});

/**
 * @desc    Get single transaction
 * @route   GET /api/transactions/:id
 */
export const getTransaction = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const transaction = await prisma.transaction.findFirst({
    where: { id, userId, isDeleted: false },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }

  res.json({
    success: true,
    data: {
      id: transaction.id,
      amount: Number(transaction.amount),
      type: transaction.type.toLowerCase(),
      description: transaction.description,
      date: transaction.date.toISOString().split('T')[0],
      category: transaction.category.name,
      categoryId: transaction.category.id,
      createdAt: transaction.createdAt,
    },
  });
});

/**
 * @desc    Create new transaction
 * @route   POST /api/transactions
 */
export const createTransaction = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { amount, type, description, date, categoryId } = req.body;

  // Verify category belongs to user
  const category = await prisma.transactionCategory.findFirst({
    where: { id: categoryId, userId, isDeleted: false },
  });

  if (!category) {
    throw new ApiError(400, 'Invalid category');
  }

  const transaction = await prisma.transaction.create({
    data: {
      amount: new Prisma.Decimal(amount),
      type: type === 'income' ? 'INCOME' : 'EXPENSE',
      description,
      date: new Date(date),
      userId,
      categoryId,
    },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Transaction created successfully',
    data: {
      id: transaction.id,
      amount: Number(transaction.amount),
      type: transaction.type.toLowerCase(),
      description: transaction.description,
      date: transaction.date.toISOString().split('T')[0],
      category: transaction.category.name,
      categoryId: transaction.category.id,
      createdAt: transaction.createdAt,
    },
  });
});

/**
 * @desc    Update transaction
 * @route   PUT /api/transactions/:id
 */
export const updateTransaction = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { amount, type, description, date, categoryId } = req.body;

  // Check transaction exists and belongs to user
  const existing = await prisma.transaction.findFirst({
    where: { id, userId, isDeleted: false },
  });

  if (!existing) {
    throw new ApiError(404, 'Transaction not found');
  }

  // Verify category belongs to user
  const category = await prisma.transactionCategory.findFirst({
    where: { id: categoryId, userId, isDeleted: false },
  });

  if (!category) {
    throw new ApiError(400, 'Invalid category');
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      amount: new Prisma.Decimal(amount),
      type: type === 'income' ? 'INCOME' : 'EXPENSE',
      description,
      date: new Date(date),
      categoryId,
    },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  res.json({
    success: true,
    message: 'Transaction updated successfully',
    data: {
      id: transaction.id,
      amount: Number(transaction.amount),
      type: transaction.type.toLowerCase(),
      description: transaction.description,
      date: transaction.date.toISOString().split('T')[0],
      category: transaction.category.name,
      categoryId: transaction.category.id,
    },
  });
});

/**
 * @desc    Delete transaction (soft delete)
 * @route   DELETE /api/transactions/:id
 */
export const deleteTransaction = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const existing = await prisma.transaction.findFirst({
    where: { id, userId, isDeleted: false },
  });

  if (!existing) {
    throw new ApiError(404, 'Transaction not found');
  }

  await prisma.transaction.update({
    where: { id },
    data: { isDeleted: true },
  });

  res.json({
    success: true,
    message: 'Transaction deleted successfully',
  });
});
