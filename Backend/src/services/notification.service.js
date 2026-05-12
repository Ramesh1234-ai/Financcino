/**
 * Notification Service - Business logic for triggering notifications
 * Handles all notification rules, thresholds, and user preferences
 */

import { sendEmail } from './email.service.js';
import logger from '../../utils/logger.js';
import {User} from '../../models/User.models.js';
import NotificationPreference from '../../models/NotificationPreference.model.js';
import {
  budgetAlertTemplate,
  receiptConfirmationTemplate,
  weeklyDigestTemplate,
  aiInsightTemplate,
} from '../utils/emailTemplates.js';

/**
 * Check if user has notifications enabled for a type
 */
const isNotificationEnabled = async (userId, type) => {
  try {
    const preference = await NotificationPreference.findOne({ userId });

    if (!preference) {
      // Default preferences
      return ['budget_alert_75', 'budget_alert_100', 'receipt_confirmation'].includes(type);
    }

    // Map type to preference field
    const prefMap = {
      budget_alert_75: 'budgetAlerts75',
      budget_alert_100: 'budgetAlerts100',
      receipt_confirmation: 'receiptConfirmation',
      weekly_digest: 'weeklyDigest',
      ai_insight: 'aiInsight',
    };

    return preference[prefMap[type]] !== false;
  } catch (error) {
    logger.error('Failed to check notification preference', {
      userId,
      type,
      error: error.message,
    });
    // Default to enabled on error
    return true;
  }
};

/**
 * Send budget alert email
 * @param {string} userId - User ID
 * @param {Object} budgetData - Budget data with spent and limit
 * @param {number} percentage - Budget percentage (75, 100, 150, etc)
 */
export const sendBudgetAlert = async (userId, budgetData, percentage) => {
  try {
    // Determine alert type
    const alertType = percentage >= 100 ? 'budget_alert_100' : 'budget_alert_75';

    // Check if user enabled this notification
    if (!(await isNotificationEnabled(userId, alertType))) {
      logger.info('Budget alert notification disabled', { userId, alertType });
      return { skipped: true, reason: 'user_disabled' };
    }

    // Get user email
    const user = await User.findById(userId).select('email name');
    if (!user || !user.email) {
      throw new Error('User email not found');
    }

    // Generate email
    const { subject, html } = budgetAlertTemplate({
      userName: user.name || 'User',
      categoryName: budgetData.categoryName,
      spent: budgetData.spent,
      limit: budgetData.limit,
      percentage,
      currency: budgetData.currency || '₹',
    });

    // Send email
    await sendEmail({
      to: user.email,
      subject,
      html,
      userId,
      type: alertType,
      metadata: {
        categoryId: budgetData.categoryId,
        categoryName: budgetData.categoryName,
        spent: budgetData.spent,
        limit: budgetData.limit,
        percentage,
      },
    });

    logger.info('Budget alert sent', {
      userId,
      categoryName: budgetData.categoryName,
      percentage,
    });

    return { sent: true, type: alertType };
  } catch (error) {
    logger.error('Failed to send budget alert', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Send receipt confirmation email
 * @param {string} userId - User ID
 * @param {Object} receiptData - Receipt data with amount, category, merchant
 */
export const sendReceiptConfirmation = async (userId, receiptData) => {
  try {
    // Check if user enabled this notification
    if (!(await isNotificationEnabled(userId, 'receipt_confirmation'))) {
      logger.info('Receipt confirmation notification disabled', { userId });
      return { skipped: true, reason: 'user_disabled' };
    }

    // Get user email
    const user = await User.findById(userId).select('email name');
    if (!user || !user.email) {
      throw new Error('User email not found');
    }

    // Generate email
    const { subject, html } = receiptConfirmationTemplate({
      userName: user.name || 'User',
      merchant: receiptData.merchant,
      amount: receiptData.amount,
      category: receiptData.category,
      currency: receiptData.currency || '₹',
      date: receiptData.date || new Date(),
    });

    // Send email
    await sendEmail({
      to: user.email,
      subject,
      html,
      userId,
      type: 'receipt_confirmation',
      metadata: {
        receiptId: receiptData.receiptId,
        amount: receiptData.amount,
        category: receiptData.category,
        merchant: receiptData.merchant,
      },
    });

    logger.info('Receipt confirmation sent', {
      userId,
      merchant: receiptData.merchant,
      amount: receiptData.amount,
    });

    return { sent: true, type: 'receipt_confirmation' };
  } catch (error) {
    logger.error('Failed to send receipt confirmation', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Send weekly digest email
 * @param {string} userId - User ID
 * @param {Object} digestData - Weekly stats (totalSpent, topCategory, savingsRate, etc)
 */
export const sendWeeklyDigest = async (userId, digestData) => {
  try {
    // Check if user enabled this notification
    if (!(await isNotificationEnabled(userId, 'weekly_digest'))) {
      logger.info('Weekly digest notification disabled', { userId });
      return { skipped: true, reason: 'user_disabled' };
    }

    // Get user email
    const user = await User.findById(userId).select('email name');
    if (!user || !user.email) {
      throw new Error('User email not found');
    }

    // Generate email
    const { subject, html } = weeklyDigestTemplate({
      userName: user.name || 'User',
      totalSpent: digestData.totalSpent,
      topCategory: digestData.topCategory,
      topCategoryAmount: digestData.topCategoryAmount,
      savingsGoal: digestData.savingsGoal,
      currentSavings: digestData.currentSavings,
      transactionCount: digestData.transactionCount,
      currency: digestData.currency || '₹',
      weekStartDate: digestData.weekStartDate,
    });

    // Send email
    await sendEmail({
      to: user.email,
      subject,
      html,
      userId,
      type: 'weekly_digest',
      metadata: {
        totalSpent: digestData.totalSpent,
        topCategory: digestData.topCategory,
        transactionCount: digestData.transactionCount,
        weekStartDate: digestData.weekStartDate,
      },
    });

    logger.info('Weekly digest sent', {
      userId,
      totalSpent: digestData.totalSpent,
    });

    return { sent: true, type: 'weekly_digest' };
  } catch (error) {
    logger.error('Failed to send weekly digest', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Send AI insight notification
 * @param {string} userId - User ID
 * @param {Object} insightData - Insight content and metadata
 */
export const sendAIInsight = async (userId, insightData) => {
  try {
    // Check if user enabled this notification
    if (!(await isNotificationEnabled(userId, 'ai_insight'))) {
      logger.info('AI insight notification disabled', { userId });
      return { skipped: true, reason: 'user_disabled' };
    }

    // Get user email
    const user = await User.findById(userId).select('email name');
    if (!user || !user.email) {
      throw new Error('User email not found');
    }

    // Generate email
    const { subject, html } = aiInsightTemplate({
      userName: user.name || 'User',
      insight: insightData.insight,
      category: insightData.category,
      recommendation: insightData.recommendation,
      impact: insightData.impact,
    });

    // Send email
    await sendEmail({
      to: user.email,
      subject,
      html,
      userId,
      type: 'ai_insight',
      metadata: {
        insightId: insightData.insightId,
        category: insightData.category,
        recommendation: insightData.recommendation,
      },
    });

    logger.info('AI insight sent', {
      userId,
      category: insightData.category,
    });

    return { sent: true, type: 'ai_insight' };
  } catch (error) {
    logger.error('Failed to send AI insight', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Update user notification preferences
 */
export const updateNotificationPreferences = async (userId, preferences) => {
  try {
    const updated = await NotificationPreference.findOneAndUpdate(
      { userId },
      preferences,
      { upsert: true, new: true }
    );

    logger.info('Notification preferences updated', { userId });
    return updated;
  } catch (error) {
    logger.error('Failed to update notification preferences', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get user notification preferences
 */
export const getNotificationPreferences = async (userId) => {
  try {
    let prefs = await NotificationPreference.findOne({ userId });

    if (!prefs) {
      // Return default preferences
      prefs = new NotificationPreference({
        userId,
        budgetAlerts75: true,
        budgetAlerts100: true,
        receiptConfirmation: true,
        weeklyDigest: true,
        aiInsight: true,
      });
    }

    return prefs;
  } catch (error) {
    logger.error('Failed to fetch notification preferences', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

export default {
  sendBudgetAlert,
  sendReceiptConfirmation,
  sendWeeklyDigest,
  sendAIInsight,
  updateNotificationPreferences,
  getNotificationPreferences,
};
