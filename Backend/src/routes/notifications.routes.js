/**
 * Notification Routes - API endpoints for notification settings and history
 * Allows users to manage preferences and view email logs
 */

import express from 'express';
import auth from '../middleware/auth.js';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../services/notification.service.js';
import { getEmailHistory, getEmailStats } from '../services/email.service.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/notifications/preferences
 * Fetch user's notification preferences
 */
router.get('/preferences', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const preferences = await getNotificationPreferences(userId);

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    logger.error('Failed to fetch preferences', {
      userId: req.user.id,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification preferences',
      error: error.message,
    });
  }
});

/**
 * PUT /api/notifications/preferences
 * Update user's notification preferences
 */
router.put('/preferences', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      budgetAlerts75,
      budgetAlerts100,
      receiptConfirmation,
      weeklyDigest,
      aiInsight,
      emailFrequency,
      weeklyDigestTime,
    } = req.body;

    // Validate
    if (emailFrequency && !['immediate', 'daily', 'weekly', 'monthly'].includes(emailFrequency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid emailFrequency. Must be: immediate, daily, weekly, or monthly',
      });
    }

    if (weeklyDigestTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(weeklyDigestTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid weeklyDigestTime. Use HH:MM format (24-hour)',
      });
    }

    const updateData = {};
    if (budgetAlerts75 !== undefined) updateData.budgetAlerts75 = budgetAlerts75;
    if (budgetAlerts100 !== undefined) updateData.budgetAlerts100 = budgetAlerts100;
    if (receiptConfirmation !== undefined) updateData.receiptConfirmation = receiptConfirmation;
    if (weeklyDigest !== undefined) updateData.weeklyDigest = weeklyDigest;
    if (aiInsight !== undefined) updateData.aiInsight = aiInsight;
    if (emailFrequency) updateData.emailFrequency = emailFrequency;
    if (weeklyDigestTime) updateData.weeklyDigestTime = weeklyDigestTime;

    const updated = await updateNotificationPreferences(userId, updateData);

    logger.info('Notification preferences updated', {
      userId,
      updates: Object.keys(updateData),
    });

    res.json({
      success: true,
      data: updated,
      message: 'Notification preferences updated successfully',
    });
  } catch (error) {
    logger.error('Failed to update preferences', {
      userId: req.user.id,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message,
    });
  }
});

/**
 * GET /api/notifications/history
 * Fetch user's email sending history
 * Query params: limit (default: 50), type (filter by email type)
 */
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit) || 50, 500); // Max 500
    const type = req.query.type; // Optional filter

    let query = { userId };
    if (type) {
      query.type = type;
    }

    // Get history
    const history = await getEmailHistory(userId, limit);

    // If type filter requested, filter in memory
    let filtered = history;
    if (type) {
      filtered = history.filter((h) => h.type === type);
    }

    res.json({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  } catch (error) {
    logger.error('Failed to fetch email history', {
      userId: req.user.id,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch email history',
      error: error.message,
    });
  }
});

/**
 * GET /api/notifications/stats
 * Fetch email statistics for a date range
 * Query params: startDate, endDate (ISO format)
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use ISO 8601 format',
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate must be before endDate',
      });
    }

    const stats = await getEmailStats(userId, startDate, endDate);

    res.json({
      success: true,
      data: stats,
      period: {
        start: startDate,
        end: endDate,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch email stats', {
      userId: req.user.id,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch email statistics',
      error: error.message,
    });
  }
});

/**
 * POST /api/notifications/test
 * Send a test email (development/testing only)
 */
router.post('/test', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Test emails not allowed in production',
      });
    }

    const { type = 'receipt_confirmation' } = req.body;

    // Get user
    const User = require('../models/User.models.js').default;
    const user = await User.findById(userId).select('email name');

    if (!user || !user.email) {
      return res.status(404).json({
        success: false,
        message: 'User email not found',
      });
    }

    // Import services
    const {
      sendReceiptConfirmation,
      sendBudgetAlert,
      sendWeeklyDigest,
      sendAIInsight,
    } = require('../services/notification.service.js');

    // Send test email based on type
    let result;
    switch (type) {
      case 'receipt_confirmation':
        result = await sendReceiptConfirmation(userId, {
          receiptId: 'test_123',
          merchant: 'Test Merchant',
          amount: 500,
          category: 'Food',
          currency: '₹',
          date: new Date(),
        });
        break;

      case 'budget_alert':
        result = await sendBudgetAlert(userId, {
          categoryId: 'test',
          categoryName: 'Test Category',
          spent: 7500,
          limit: 10000,
          currency: '₹',
        }, 75);
        break;

      case 'weekly_digest':
        result = await sendWeeklyDigest(userId, {
          totalSpent: 15000,
          topCategory: 'Food',
          topCategoryAmount: 5000,
          savingsGoal: 50000,
          currentSavings: 25000,
          transactionCount: 12,
          currency: '₹',
          weekStartDate: new Date(),
        });
        break;

      case 'ai_insight':
        result = await sendAIInsight(userId, {
          insightId: 'test_123',
          insight: 'Your food spending increased by 30% this month',
          category: 'Spending Trend',
          recommendation: 'Try meal planning to reduce food expenses',
          impact: 'Potential savings: ₹2,000 per month',
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          message: `Unknown email type: ${type}`,
        });
    }

    logger.info('Test email sent', { userId, type });

    res.json({
      success: true,
      message: `Test email (${type}) sent to ${user.email}`,
      result,
    });
  } catch (error) {
    logger.error('Failed to send test email', {
      userId: req.user.id,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message,
    });
  }
});

export default router;
