/**
 * Weekly Digest Job - Runs every Sunday at configured time
 * Fetches user stats and sends personalized summary
 */

import cron from 'node-cron';
import logger from '../../utils/logger.js';
import {User} from '../../models/User.models.js';
import {Transaction} from '../../models/Transaction.models.js';
import {Budget} from '../../models/Budget.models.js';
import NotificationPreference from '../../models/NotificationPreference.model.js';
import { sendWeeklyDigest } from '../services/notification.service.js';

/**
 * Calculate week start date (Sunday of last week)
 */
const getWeekStartDate = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek; // Adjust when day is Sunday
  return new Date(now.setDate(diff));
};

/**
 * Fetch user's weekly statistics
 */
const fetchWeeklyStats = async (userId) => {
  try {
    const weekStart = getWeekStartDate();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Get transactions for the week
    const transactions = await Transaction.find({
      userId,
      createdAt: {
        $gte: weekStart,
        $lt: weekEnd,
      },
    });

    // Calculate total spent
    const totalSpent = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    // Get spending by category
    const categorySpending = {};
    transactions.forEach((t) => {
      const category = t.category || 'Other';
      categorySpending[category] = (categorySpending[category] || 0) + (t.amount || 0);
    });

    // Find top category
    let topCategory = 'Other';
    let topCategoryAmount = 0;
    Object.entries(categorySpending).forEach(([category, amount]) => {
      if (amount > topCategoryAmount) {
        topCategoryAmount = amount;
        topCategory = category;
      }
    });

    // Get savings goal info
    let savingsGoal = 0;
    let currentSavings = 0;
    const user = await User.findById(userId).select('savingsGoal currentSavings');
    if (user) {
      savingsGoal = user.savingsGoal || 0;
      currentSavings = user.currentSavings || 0;
    }

    return {
      totalSpent,
      topCategory,
      topCategoryAmount,
      savingsGoal,
      currentSavings,
      transactionCount: transactions.length,
      weekStartDate: weekStart,
    };
  } catch (error) {
    logger.error('Failed to fetch weekly stats', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Send weekly digest to a user
 */
const sendUserWeeklyDigest = async (userId) => {
  try {
    // Check if digest is enabled
    const pref = await NotificationPreference.findOne({ userId });
    if (pref && !pref.weeklyDigest) {
      logger.info('Weekly digest disabled for user', { userId });
      return { skipped: true };
    }

    // Get user email
    const user = await User.findById(userId).select('email name');
    if (!user || !user.email) {
      logger.warn('User not found or missing email', { userId });
      return { skipped: true, reason: 'no_email' };
    }

    // Fetch stats
    const stats = await fetchWeeklyStats(userId);

    // Send digest
    const result = await sendWeeklyDigest(userId, stats);

    return { ...result, email: user.email };
  } catch (error) {
    logger.error('Failed to send weekly digest', {
      userId,
      error: error.message,
    });
    return {
      success: false,
      userId,
      error: error.message,
    };
  }
};

/**
 * Send weekly digest to all active users
 */
const sendWeeklyDigestToAll = async () => {
  logger.info('Starting weekly digest job');

  try {
    // Get all active users with email
    const users = await User.find(
      {
        email: { $exists: true, $ne: null },
        deletedAt: null,
      },
      '_id'
    );

    logger.info(`Found ${users.length} active users for digest`);

    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;

    // Send digest with rate limiting
    for (const user of users) {
      try {
        const result = await sendUserWeeklyDigest(user._id);
        if (result.sent) {
          successCount++;
        } else if (result.skipped) {
          skippedCount++;
        } else if (!result.success) {
          failureCount++;
        }
      } catch (error) {
        failureCount++;
        logger.error('Error in digest loop', { userId: user._id, error: error.message });
      }

      // Rate limiting: 100ms between sends
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    logger.info('Weekly digest job completed', {
      successCount,
      failureCount,
      skippedCount,
      totalUsers: users.length,
    });

    return {
      success: true,
      successCount,
      failureCount,
      skippedCount,
    };
  } catch (error) {
    logger.error('Weekly digest job failed', { error: error.message });
    throw error;
  }
};

/**
 * Initialize weekly digest cron job
 * Runs every Sunday at 09:00 AM UTC
 */
export const initWeeklyDigestJob = () => {
  // Schedule: "0 9 * * 0" = Every Sunday at 09:00 UTC
  const job = cron.schedule('0 9 * * 0', async () => {
    logger.info('Weekly digest job triggered');
    try {
      await sendWeeklyDigestToAll();
    } catch (error) {
      logger.error('Weekly digest job execution failed', {
        error: error.message,
      });
    }
  });

  logger.info('Weekly digest cron job initialized (Every Sunday at 09:00 UTC)');
  return job;
};

/**
 * Manually trigger weekly digest (for testing or manual run)
 */
export const triggerWeeklyDigest = async () => {
  return sendWeeklyDigestToAll();
};
