/**
 * Budget Alert Job - Monitors spending and triggers alerts
 * Called after transaction creation to check budget thresholds
 */

import logger from '../../utils/logger.js';
import {Expense} from '../../models/expense.models.js';
import {Budget} from '../../models/Budget.models.js';
import NotificationPreference from '../../models/NotificationPreference.model.js';
import { sendBudgetAlert } from '../services/notification.service.js';
/**
 * Check budget thresholds and send alerts if needed
 * @param {string} userId - User ID
 * @param {string} transactionId - Transaction ID (optional, for new transaction)
 */
export const checkBudgetThresholds = async (userId, transactionId = null) => {
  try {
    // Get all active budgets for user
    const budgets = await Budget.find({
      userId,
      isActive: true,
    }).populate('categoryId');

    if (budgets.length === 0) {
      return { processed: false, reason: 'no_budgets' };
    }

    const alerts = [];

    // Check each budget
    for (const budget of budgets) {
      try {
        // Get current spending for the category in this period
        const spent = await calculateCategorySpending(
          userId,
          budget.categoryId._id,
          budget.period
        );

        const percentage = (spent / budget.budgetLimit) * 100;

        // Determine if alert should be sent
        let shouldAlert = false;
        let alertType = null;

        if (percentage >= 100) {
          alertType = 'over_100';
          shouldAlert = true;
        } else if (percentage >= 75 && percentage < 100) {
          alertType = 'at_75';
          shouldAlert = true;
        }

        if (shouldAlert) {
          // Check if user has this alert enabled
          const pref = await NotificationPreference.findOne({ userId });
          const isEnabled =
            alertType === 'over_100'
              ? !pref || pref.budgetAlerts100 !== false
              : !pref || pref.budgetAlerts75 !== false;

          if (!isEnabled) {
            logger.info('Budget alert notification disabled', {
              userId,
              categoryId: budget.categoryId._id,
              alertType,
            });
            continue;
          }

          // Send alert
          const result = await sendBudgetAlert(userId, {
            categoryId: budget.categoryId._id,
            categoryName: budget.categoryId.name,
            spent,
            limit: budget.budgetLimit,
            currency: budget.currency || '₹',
          }, Math.round(percentage));

          alerts.push({
            categoryId: budget.categoryId._id,
            categoryName: budget.categoryId.name,
            percentage: Math.round(percentage),
            alertType,
            result,
          });

          logger.info('Budget alert processed', {
            userId,
            categoryName: budget.categoryId.name,
            percentage: Math.round(percentage),
            alertType,
          });
        }
      } catch (error) {
        logger.error('Error checking budget threshold', {
          userId,
          budgetId: budget._id,
          error: error.message,
        });
      }
    }

    return {
      processed: true,
      alertsTriggered: alerts.length,
      alerts,
    };
  } catch (error) {
    logger.error('Failed to check budget thresholds', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Calculate spending for a category in a specific period
 * @private
 */
const calculateCategorySpending = async (userId, categoryId, period) => {
  const now = new Date();
  let startDate;

  // Calculate period start date
  switch (period) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      startDate = new Date(now);
      const dayOfWeek = now.getDay();
      startDate.setDate(now.getDate() - dayOfWeek); // Sunday
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'yearly':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  try {
    // Query Expense model (not Transaction)
    const result = await Expense.aggregate([
      {
        $match: {
          userId,
          categoryId: categoryId,
          date: {
            $gte: startDate,
            $lte: now,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalAmount : 0;
  } catch (error) {
    logger.error('Error calculating category spending', {
      userId,
      categoryId,
      period,
      error: error.message,
    });
    return 0;
  }
};

/**
 * Batch check budgets for all users (can be run via cron)
 * Note: More efficient to check on transaction creation
 */
export const checkAllUserBudgets = async () => {
  logger.info('Starting batch budget check for all users');

  try {
    const users = await Expense.distinct('userId');

    let processedCount = 0;
    let alertCount = 0;

    for (const userId of users) {
      try {
        const result = await checkBudgetThresholds(userId);
        if (result.processed) {
          processedCount++;
          alertCount += result.alertsTriggered || 0;
        }
      } catch (error) {
        logger.error('Error processing user budgets', {
          userId,
          error: error.message,
        });
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    logger.info('Batch budget check completed', {
      processedCount,
      alertCount,
      totalUsers: users.length,
    });

    return {
      success: true,
      processedCount,
      alertCount,
    };
  } catch (error) {
    logger.error('Batch budget check failed', {
      error: error.message,
    });
    throw error;
  }
};
