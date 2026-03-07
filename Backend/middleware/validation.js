// Backend/middleware/validation.js
import { body, validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

export const validateRegister = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password needs uppercase letter')
    .matches(/[0-9]/).withMessage('Password needs number'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(new AppError(errors.array().map(e => e.msg).join('; '), 400));
    } else {
      next();
    }
  },
];

export const validateLogin = [
  body('email')
    .trim()
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password required'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(new AppError(errors.array().map(e => e.msg).join('; '), 400));
    } else {
      next();
    }
  },
];

export const validateExpense = [
  body('description')
    .trim()
    .notEmpty().withMessage('Description required')
    .isLength({ max: 500 }).withMessage('Max 500 characters'),

  body('amount')
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Valid amount required'),

  body('categoryId')
    .notEmpty().withMessage('Category required')
    .isMongoId().withMessage('Invalid category'),

  body('date')
    .optional()
    .isISO8601().withMessage('Valid date required'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(new AppError(errors.array().map(e => e.msg).join('; '), 400));
    } else {
      next();
    }
  },
];

export const validateCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name required')
    .isLength({ min: 1, max: 50 }).withMessage('Name must be 1-50 characters'),

  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i).withMessage('Invalid color format'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(new AppError(errors.array().map(e => e.msg).join('; '), 400));
    } else {
      next();
    }
  },
];
