import { body, param, query } from 'express-validator';

// ============================================
// AUTH VALIDATORS
// ============================================

export const signupValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .escape(),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const refreshTokenValidator = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
];

// ============================================
// TRANSACTION VALIDATORS
// ============================================

export const createTransactionValidator = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['income', 'expense'])
    .withMessage('Type must be "income" or "expense"'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 255 })
    .withMessage('Description must be less than 255 characters')
    .escape(),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (date > today) {
        throw new Error('Date cannot be in the future');
      }
      return true;
    }),
  body('categoryId')
    .notEmpty()
    .withMessage('Category is required')
    .isUUID()
    .withMessage('Invalid category ID'),
];

export const updateTransactionValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid transaction ID'),
  ...createTransactionValidator,
];

// ============================================
// TASK VALIDATORS
// ============================================

export const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Description must be less than 300 characters')
    .escape(),
  body('status')
    .optional()
    .isIn(['todo', 'ongoing', 'completed'])
    .withMessage('Status must be "todo", "ongoing", or "completed"'),
  body('deadline')
    .notEmpty()
    .withMessage('Deadline is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Deadline cannot be in the past');
      }
      return true;
    }),
];

export const updateTaskValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid task ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Description must be less than 300 characters')
    .escape(),
  body('status')
    .optional()
    .isIn(['todo', 'ongoing', 'completed'])
    .withMessage('Status must be "todo", "ongoing", or "completed"'),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

// ============================================
// PASSWORD VAULT VALIDATORS
// ============================================

export const createPasswordValidator = [
  body('website')
    .trim()
    .notEmpty()
    .withMessage('Website is required')
    .isLength({ max: 100 })
    .withMessage('Website must be less than 100 characters'),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('categoryId')
    .notEmpty()
    .withMessage('Category is required')
    .isUUID()
    .withMessage('Invalid category ID'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
];

export const updatePasswordValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid password entry ID'),
  body('website')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Website must be less than 100 characters'),
  body('username')
    .optional()
    .trim(),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
];

export const verifyPasswordValidator = [
  body('password')
    .notEmpty()
    .withMessage('Password is required for verification'),
];

// ============================================
// CATEGORY VALIDATORS
// ============================================

export const createCategoryValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 50 })
    .withMessage('Category name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Category name can only contain letters and spaces'),
  body('type')
    .notEmpty()
    .withMessage('Category type is required')
    .isIn(['transaction', 'password'])
    .withMessage('Type must be "transaction" or "password"'),
];

// ============================================
// COMMON VALIDATORS
// ============================================

export const idParamValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
];

export const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
