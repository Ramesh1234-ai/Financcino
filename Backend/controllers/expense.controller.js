// Backend/controllers/expense.controller.js
import { Expense } from '../models/expense.models.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import { config } from '../config/config.js';
import  {checkBudgetThresholds}  from '../src/jobs/budgetAlert.job.js';
export async function getExpenses(req, res, next) {
  try {
    const { page = 1, limit = config.ITEMS_PER_PAGE, category } = req.query;
    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const query = { userId: req.user.id };
    if (category) {
      query.categoryId = category;
    }
    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate('categoryId', 'name color')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ date: -1 })
        .lean(),
      Expense.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
export async function createExpense(req, res, next) {
  try {
    const { description, amount, categoryId, date, paymentMethod, tags, notes } = req.body;

    const expense = await Expense.create({
      userId: req.user.id,
      description,
      amount,
      categoryId,
      date: date || new Date(),
      paymentMethod: paymentMethod || 'cash',
      tags: tags || [],
      notes: notes || null,
    });

    logger.info(`Expense created: ${expense._id} by user ${req.user.id}`);

    // ==================== TRIGGER BUDGET CHECK ====================
    // Check if expense triggers budget alerts
    // This is done asynchronously to not block the response
    if (process.env.BUDGET_ALERTS_ENABLED !== 'false') {
      try {
        checkBudgetThresholds(req.user.id, expense._id)
          .then((result) => {
            if (result.alertsTriggered && result.alertsTriggered > 0) {
              logger.info(`Budget alert(s) triggered for user ${req.user.id}`, {
                alertCount: result.alertsTriggered,
                alerts: result.alerts,
              });
            }
          })
          .catch((error) => {
            logger.error('Budget check failed (non-blocking)', {
              userId: req.user.id,
              expenseId: expense._id,
              error: error.message,
            });
            // Don't fail the request - email alerts are secondary feature
          });
      } catch (error) {
        logger.error('Error initiating budget check', {
          userId: req.user.id,
          error: error.message,
        });
        // Continue - don't block expense creation
      }
    }

    res.status(201).json({
      success: true,
      data: { expense },
    });
  } catch (err) {
    next(err);
  }
}

export async function getExpenseById(req, res, next) {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('categoryId')
      .populate('userId', 'email fullName');

    if (!expense) {
      throw new AppError('Expense not found', 404);
    }

    // Verify ownership
    if (expense.userId._id.toString() !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }

    res.json({ success: true, data: { expense } });
  } catch (err) {
    next(err);
  }
}

export async function updateExpense(req, res, next) {
  try {
    const { description, amount, categoryId, date, paymentMethod, tags, notes } = req.body;
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      throw new AppError('Expense not found', 404);
    }

    // Verify ownership
    if (expense.userId.toString() !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }

    // Update fields
    Object.assign(expense, {
      description,
      amount,
      categoryId,
      date,
      paymentMethod,
      tags,
      notes,
    });
    await expense.save();

    logger.info(`Expense updated: ${expense._id}`);

    res.json({
      success: true,
      data: { expense },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteExpense(req, res, next) {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      throw new AppError('Expense not found', 404);
    }

    // Verify ownership
    if (expense.userId.toString() !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }

    await Expense.deleteOne({ _id: req.params.id });

    logger.info(`Expense deleted: ${req.params.id}`);

    res.json({
      success: true,
      message: 'Expense deleted',
    });
  } catch (err) {
    next(err);
  }
}
