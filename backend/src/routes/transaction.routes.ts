import { Router } from 'express';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
} from '../controllers/transaction.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createTransactionValidator,
  updateTransactionValidator,
  idParamValidator,
  paginationValidator,
} from '../utils/validators.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions for current user
 * @access  Private
 */
router.get('/', paginationValidator, validate, getTransactions);

/**
 * @route   GET /api/transactions/summary
 * @desc    Get transaction summary (income, expenses, balance)
 * @access  Private
 */
router.get('/summary', getTransactionSummary);

/**
 * @route   GET /api/transactions/:id
 * @desc    Get single transaction
 * @access  Private
 */
router.get('/:id', idParamValidator, validate, getTransaction);

/**
 * @route   POST /api/transactions
 * @desc    Create new transaction
 * @access  Private
 */
router.post('/', createTransactionValidator, validate, createTransaction);

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update transaction
 * @access  Private
 */
router.put('/:id', updateTransactionValidator, validate, updateTransaction);

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete transaction (soft delete)
 * @access  Private
 */
router.delete('/:id', idParamValidator, validate, deleteTransaction);

export default router;
