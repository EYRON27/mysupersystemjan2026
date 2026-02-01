import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import { Prisma } from '@prisma/client';

// Task status type (SQLite doesn't support enums)
type TaskStatus = 'TODO' | 'ONGOING' | 'COMPLETED';

/**
 * @desc    Get all tasks for current user
 * @route   GET /api/tasks
 */
export const getTasks = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { page = '1', limit = '20', status, sortBy = 'deadline' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: Prisma.TaskWhereInput = {
    userId,
    isDeleted: false,
  };

  if (status && status !== 'all') {
    where.status = status.toString().toUpperCase() as TaskStatus;
  }

  // Build order by
  let orderBy: Prisma.TaskOrderByWithRelationInput;
  switch (sortBy) {
    case 'createdAt':
      orderBy = { createdAt: 'desc' };
      break;
    case 'title':
      orderBy = { title: 'asc' };
      break;
    case 'deadline':
    default:
      orderBy = { deadline: 'asc' };
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      skip,
      take: limitNum,
    }),
    prisma.task.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status.toLowerCase(),
        deadline: t.deadline.toISOString().split('T')[0],
        createdAt: t.createdAt.toISOString().split('T')[0],
        isOverdue: t.status !== 'COMPLETED' && new Date(t.deadline) < new Date(),
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
 * @desc    Get task summary
 * @route   GET /api/tasks/summary
 */
export const getTaskSummary = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const now = new Date();

  const [pending, ongoing, completed, overdue] = await Promise.all([
    prisma.task.count({
      where: {
        userId,
        isDeleted: false,
        status: 'TODO',
      },
    }),
    prisma.task.count({
      where: {
        userId,
        isDeleted: false,
        status: 'ONGOING',
      },
    }),
    prisma.task.count({
      where: {
        userId,
        isDeleted: false,
        status: 'COMPLETED',
      },
    }),
    prisma.task.count({
      where: {
        userId,
        isDeleted: false,
        status: { not: 'COMPLETED' },
        deadline: { lt: now },
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      pending: pending + ongoing,
      ongoing,
      completed,
      overdue,
      total: pending + ongoing + completed,
    },
  });
});

/**
 * @desc    Get single task
 * @route   GET /api/tasks/:id
 */
export const getTask = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const task = await prisma.task.findFirst({
    where: { id, userId, isDeleted: false },
  });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  res.json({
    success: true,
    data: {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase(),
      deadline: task.deadline.toISOString().split('T')[0],
      createdAt: task.createdAt.toISOString().split('T')[0],
      isOverdue: task.status !== 'COMPLETED' && new Date(task.deadline) < new Date(),
    },
  });
});

/**
 * @desc    Create new task
 * @route   POST /api/tasks
 */
export const createTask = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { title, description, deadline, status = 'todo' } = req.body;

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      deadline: new Date(deadline),
      status: status.toUpperCase() as TaskStatus,
      userId,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase(),
      deadline: task.deadline.toISOString().split('T')[0],
      createdAt: task.createdAt.toISOString().split('T')[0],
    },
  });
});

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 */
export const updateTask = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { title, description, deadline, status } = req.body;

  // Check task exists and belongs to user
  const existing = await prisma.task.findFirst({
    where: { id, userId, isDeleted: false },
  });

  if (!existing) {
    throw new ApiError(404, 'Task not found');
  }

  // Prevent editing completed tasks
  if (existing.status === 'COMPLETED') {
    throw new ApiError(400, 'Completed tasks cannot be edited');
  }

  const updateData: Prisma.TaskUpdateInput = {};

  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description || null;
  if (deadline !== undefined) updateData.deadline = new Date(deadline);
  if (status !== undefined) updateData.status = status.toUpperCase() as TaskStatus;

  const task = await prisma.task.update({
    where: { id },
    data: updateData,
  });

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase(),
      deadline: task.deadline.toISOString().split('T')[0],
      createdAt: task.createdAt.toISOString().split('T')[0],
    },
  });
});

/**
 * @desc    Update task status only
 * @route   PATCH /api/tasks/:id/status
 */
export const updateTaskStatus = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { status } = req.body;

  // Check task exists and belongs to user
  const existing = await prisma.task.findFirst({
    where: { id, userId, isDeleted: false },
  });

  if (!existing) {
    throw new ApiError(404, 'Task not found');
  }

  // Prevent changing status of completed tasks
  if (existing.status === 'COMPLETED') {
    throw new ApiError(400, 'Completed tasks cannot be modified');
  }

  const task = await prisma.task.update({
    where: { id },
    data: { status: status.toUpperCase() as TaskStatus },
  });

  res.json({
    success: true,
    message: `Task marked as ${status}`,
    data: {
      id: task.id,
      status: task.status.toLowerCase(),
    },
  });
});

/**
 * @desc    Delete task (soft delete)
 * @route   DELETE /api/tasks/:id
 */
export const deleteTask = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const existing = await prisma.task.findFirst({
    where: { id, userId, isDeleted: false },
  });

  if (!existing) {
    throw new ApiError(404, 'Task not found');
  }

  await prisma.task.update({
    where: { id },
    data: { isDeleted: true },
  });

  res.json({
    success: true,
    message: 'Task deleted successfully',
  });
});
