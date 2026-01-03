import { Router } from 'express';
import {
  getTransactionCategories,
  getPasswordCategories,
  createCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCategoryValidator, idParamValidator } from '../utils/validators.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/categories/transactions
 * @desc    Get all transaction categories for current user
 * @access  Private
 */
router.get('/transactions', getTransactionCategories);

/**
 * @route   GET /api/categories/passwords
 * @desc    Get all password categories for current user
 * @access  Private
 */
router.get('/passwords', getPasswordCategories);

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private
 */
router.post('/', createCategoryValidator, validate, createCategory);

/**
 * @route   DELETE /api/categories/:type/:id
 * @desc    Delete a category (soft delete)
 * @access  Private
 */
router.delete('/:type/:id', idParamValidator, validate, deleteCategory);

export default router;
