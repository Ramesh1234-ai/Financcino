// Backend/routes/analytics.routes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Analytics } from '../models/Analytics.models.js';
import { Expense } from '../models/expense.models.js';
import { Category } from '../models/Category.models.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth);

// GET /api/analytics - Get analytics for a date range
router.get('/', async (req, res, next) => {
  try {
    const range = req.query.range || 'month';
    const userId = req.user.id;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    logger.info('📊 [getAnalytics] Fetching analytics', { userId, range, startDate });
    
    // Aggregate by category
    const byCategory = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $group: {
          _id: '$categoryId',
          categoryName: { $first: { $arrayElemAt: ['$categoryInfo.name', 0] } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);
    
    // Daily trends
    const dailyTrends = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Total spent
    const totalSpent = byCategory.reduce((sum, cat) => sum + cat.total, 0);
    
    logger.info('✅ [getAnalytics] Analytics prepared', { totalSpent, categories: byCategory.length });
    
    res.status(200).json({
      success: true,
      data: {
        range,
        period: {
          start: startDate.toISOString().split('T')[0],
          end: now.toISOString().split('T')[0]
        },
        totalSpent: totalSpent || 0,
        byCategory: byCategory.map(cat => ({
          categoryId: cat._id,
          categoryName: cat.categoryName || 'Uncategorized',
          amount: cat.total,
          count: cat.count
        })),
        dailyTrends: dailyTrends.map(day => ({
          date: day._id,
          amount: day.total,
          count: day.count
        }))
      }
    });
  } catch (err) {
    logger.error('❌ [getAnalytics] Error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      details: err.message
    });
  }
});

// POST /api/analytics - Get filtered analytics
router.post('/', async (req, res, next) => {
  try {
    const { range = 'month', filters = {} } = req.body;
    const userId = req.user.id;
    
    logger.info('📊 [analyticsFiltered] Request received', { userId, range, filters });
    
    // Build query
    const query = { userId };
    
    // Date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    query.date = { $gte: startDate };
    
    // Amount range filter
    if (filters.minAmount || filters.maxAmount) {
      query.amount = {};
      if (filters.minAmount) {
        query.amount.$gte = parseFloat(filters.minAmount);
      }
      if (filters.maxAmount) {
        query.amount.$lte = parseFloat(filters.maxAmount);
      }
    }
    
    // Category filter
    if (filters.category) {
      const category = await Category.findOne({ userId, name: filters.category });
      if (category) {
        query.categoryId = category._id;
      } else {
        // Category not found - return empty data
        return res.json({
          success: true,
          data: {
            range,
            totalSpent: 0,
            totalTransactions: 0,
            averageTransaction: 0,
            byCategory: [],
            dailyTrends: [],
            expenses: [],
            filters
          }
        });
      }
    }
    
    // Get expenses
    const expenses = await Expense.find(query)
      .populate('categoryId', 'name')
      .sort({ date: -1 })
      .limit(100);
    
    // Calculate metrics
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Category breakdown
    const categoryMap = {};
    expenses.forEach(exp => {
      const catName = exp.categoryId?.name || 'Uncategorized';
      if (!categoryMap[catName]) {
        categoryMap[catName] = { amount: 0, count: 0 };
      }
      categoryMap[catName].amount += exp.amount;
      categoryMap[catName].count += 1;
    });
    
    const byCategory = Object.entries(categoryMap).map(([name, data]) => ({
      categoryName: name,
      amount: data.amount,
      count: data.count
    }));
    
    logger.info('✅ [analyticsFiltered] Analytics prepared', { totalSpent, expenseCount: expenses.length });
    
    res.status(200).json({
      success: true,
      data: {
        range,
        totalSpent,
        totalTransactions: expenses.length,
        averageTransaction: expenses.length > 0 ? totalSpent / expenses.length : 0,
        byCategory,
        expenses: expenses.slice(0, 20),
        filters
      }
    });
  } catch (err) {
    logger.error('❌ [analyticsFiltered] Error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      details: err.message
    });
  }
});

export default router;
