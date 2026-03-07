// Backend/routes/analytics.routes.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { Analytics } from '../models/Analytics.models.js';
import { Expense } from '../models/expense.models.js';
import logger from '../utils/logger.js';
const router = express.Router();
router.use(authenticateToken);
router.get('/', async (req, res, next) => {
  try {
    let analytics = await Analytics.findOne({ userId: req.userId });
    if (!analytics) {
      // Calculate analytics if not cached
      const expenses = await Expense.find({ userId: req.userId });
      const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalCount = expenses.length;
      const avgMonthly = totalCount > 0 ? totalSpent / Math.max(1, Math.ceil(totalCount / 30)) : 0;
      analytics = await Analytics.create({
        userId: req.userId,
        totalSpent,
        averageMonthlySpend: avgMonthly,
        savingRate: 0,
      });
    }
    res.json({ success: true, data: { analytics } });
  } catch (err) {
    next(err);
  }
});
export default router;
