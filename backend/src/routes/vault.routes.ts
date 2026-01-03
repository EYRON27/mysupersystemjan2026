import { Router } from 'express';
import {
  getPasswords,
  getPassword,
  createPassword,
  updatePassword,
  deletePassword,
  revealPassword,
} from '../controllers/vault.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createPasswordValidator,
  updatePasswordValidator,
  idParamValidator,
  paginationValidator,
  verifyPasswordValidator,
} from '../utils/validators.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/vault
 * @desc    Get all password entries for current user
 * @access  Private
 */
router.get('/', paginationValidator, validate, getPasswords);

/**
 * @route   GET /api/vault/:id
 * @desc    Get single password entry (password masked)
 * @access  Private
 */
router.get('/:id', idParamValidator, validate, getPassword);

/**
 * @route   POST /api/vault/:id/reveal
 * @desc    Reveal password after re-authentication
 * @access  Private
 */
router.post('/:id/reveal', idParamValidator, verifyPasswordValidator, validate, revealPassword);

/**
 * @route   POST /api/vault
 * @desc    Create new password entry
 * @access  Private
 */
router.post('/', createPasswordValidator, validate, createPassword);

/**
 * @route   PUT /api/vault/:id
 * @desc    Update password entry
 * @access  Private
 */
router.put('/:id', updatePasswordValidator, validate, updatePassword);

/**
 * @route   DELETE /api/vault/:id
 * @desc    Delete password entry (soft delete)
 * @access  Private
 */
router.delete('/:id', idParamValidator, validate, deletePassword);

export default router;
