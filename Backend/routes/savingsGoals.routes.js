// Backend/routes/savingsGoals.routes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Analytics } from '../models/Analytics.models.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();
router.use(requireAuth);
// Get user's savings goal
router.get('/', async (req, res, next) => {
  try {
    const analytics = await Analytics.findOne({ userId: req.user.id });
    
    if (!analytics) {
      return res.json({
        success: true,
        data: {
          savingsGoal: 0,
          currentSavings: 0
        }
      });
    }
    res.json({
      success: true,
      data: {
        savingsGoal: analytics.savingsGoal || 0,
        currentSavings: analytics.currentSavings || 0
      }
    });
  } catch (err) {
    next(err);
  }
});

// Set or update savings goal
router.post('/', async (req, res, next) => {
  try {
    const { savingsGoal, currentSavings } = req.body;

    if (typeof savingsGoal !== 'number' || savingsGoal < 0) {
      throw new AppError('Invalid savings goal amount', 400);
    }
    let analytics = await Analytics.findOne({ userId: req.user.id });
    if (!analytics) {
      analytics = await Analytics.create({
        userId: req.user.id,
        savingsGoal,
        currentSavings: currentSavings || 0
      });
    } else {
      analytics.savingsGoal = savingsGoal;
      if (typeof currentSavings === 'number') {
        analytics.currentSavings = currentSavings;
      }
      await analytics.save();
    }
    logger.info(`Savings goal set: ${savingsGoal} for user ${req.user.id}`);
    res.status(201).json({
      success: true,
      data: {
        savingsGoal: analytics.savingsGoal,
        currentSavings: analytics.currentSavings
      }
    });
  } catch (err) {
    next(err);
  }
});
// Update current savings
router.put('/current', async (req, res, next) => {
  try {
    const { currentSavings } = req.body;
    if (typeof currentSavings !== 'number' || currentSavings < 0) {
      throw new AppError('Invalid current savings amount', 400);
    }
    let analytics = await Analytics.findOne({ userId: req.user.id });
    if (!analytics) {
      analytics = await Analytics.create({
        userId: req.user.id,
        currentSavings
      });
    } else {
      analytics.currentSavings = currentSavings;
      await analytics.save();
    }

    logger.info(`Current savings updated: ${currentSavings} for user ${req.user.id}`);
    res.json({
      success: true,
      data: {
        savingsGoal: analytics.savingsGoal,
        currentSavings: analytics.currentSavings
      }
    });
  } catch (err) {
    next(err);
  }
});

// Delete savings goal
router.delete('/', async (req, res, next) => {
  try {
    const analytics = await Analytics.findOne({ userId: req.user.id });

    if (!analytics) {
      throw new AppError('Savings goal not found', 404);
    }

    analytics.savingsGoal = 0;
    analytics.currentSavings = 0;
    await analytics.save();

    logger.info(`Savings goal deleted for user ${req.user.id}`);
    res.json({
      success: true,
      message: 'Savings goal deleted'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
