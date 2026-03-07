// Backend/routes/expenses.routes.js
import express from 'express';
import * as expenseController from '../controllers/expense.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateExpense } from '../middleware/validation.js';

const router = express.Router();

// All expense routes require authentication
router.use(authenticateToken);

router.get('/', expenseController.getExpenses);
router.post('/', validateExpense, expenseController.createExpense);
router.get('/:id', expenseController.getExpenseById);
router.put('/:id', validateExpense, expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

export default router;
