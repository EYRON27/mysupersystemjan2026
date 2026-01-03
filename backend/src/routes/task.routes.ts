import { Router } from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTaskSummary,
} from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createTaskValidator,
  updateTaskValidator,
  idParamValidator,
  paginationValidator,
} from '../utils/validators.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for current user
 * @access  Private
 */
router.get('/', paginationValidator, validate, getTasks);

/**
 * @route   GET /api/tasks/summary
 * @desc    Get task summary (pending, completed, overdue)
 * @access  Private
 */
router.get('/summary', getTaskSummary);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task
 * @access  Private
 */
router.get('/:id', idParamValidator, validate, getTask);

/**
 * @route   POST /api/tasks
 * @desc    Create new task
 * @access  Private
 */
router.post('/', createTaskValidator, validate, createTask);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @access  Private
 */
router.put('/:id', updateTaskValidator, validate, updateTask);

/**
 * @route   PATCH /api/tasks/:id/status
 * @desc    Update task status only
 * @access  Private
 */
router.patch('/:id/status', idParamValidator, validate, updateTaskStatus);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task (soft delete)
 * @access  Private
 */
router.delete('/:id', idParamValidator, validate, deleteTask);

export default router;
