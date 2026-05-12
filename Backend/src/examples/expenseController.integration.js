/**
 * Expense Controller Integration - Trigger notifications on transaction events
 * Add these functions to your existing expense.controller.js
 */

import Transaction from '../models/Transaction.models.js';
import { checkBudgetThresholds } from '../jobs/budgetAlert.job.js';
import logger from '../utils/logger.js';

/**
 * Create expense with budget alert check
 * Replace your existing createExpense or add this logic
 */
export const createExpenseWithNotifications = async (req, res) => {
  try {
    const { userId, amount, category, description, date } = req.body;

    // Validate
    if (!userId || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, amount, category',
      });
    }

    // Create transaction
    const transaction = new Transaction({
      userId,
      amount,
      category,
      description,
      date: date || new Date(),
      type: 'expense',
      source: 'manual',
    });

    await transaction.save();

    logger.info('Transaction created', {
      userId,
      transactionId: transaction._id,
      amount,
      category,
    });

    // IMPORTANT: Check budget thresholds and trigger alerts
    let budgetAlerts = null;
    try {
      budgetAlerts = await checkBudgetThresholds(userId, transaction._id);
      logger.info('Budget check completed', {
        userId,
        alertsTriggered: budgetAlerts.alertsTriggered,
      });
    } catch (error) {
      logger.error('Budget check failed (non-blocking)', {
        userId,
        error: error.message,
      });
      // Don't fail the transaction creation if budget check fails
    }

    res.status(201).json({
      success: true,
      data: transaction,
      budgetAlerts,
      message: 'Transaction created successfully',
    });
  } catch (error) {
    logger.error('Failed to create transaction', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: error.message,
    });
  }
};

/**
 * Example: Update expense (if budget limit changes)
 */
export const updateExpenseWithNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, description, date } = req.body;

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      {
        amount,
        category,
        description,
        date,
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Check budget thresholds again with updated amount
    const userId = transaction.userId;
    const budgetAlerts = await checkBudgetThresholds(userId);

    logger.info('Transaction updated', {
      transactionId: id,
      newAmount: amount,
    });

    res.json({
      success: true,
      data: transaction,
      budgetAlerts,
      message: 'Transaction updated successfully',
    });
  } catch (error) {
    logger.error('Failed to update transaction', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to update transaction',
      error: error.message,
    });
  }
};

export default {
  createExpenseWithNotifications,
  updateExpenseWithNotifications,
};
