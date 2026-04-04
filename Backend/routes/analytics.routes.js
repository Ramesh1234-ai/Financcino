// Backend/routes/analytics.routes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Analytics } from '../models/Analytics.models.js';
import { Expense } from '../models/expense.models.js';
import { Budget } from '../models/Budget.models.js';
import { Category } from '../models/Category.models.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth);

/**
 * Helper: Calculate date range based on range parameter
 * Fixes: Proper month/date boundary handling
 */
function getDateRange(range = 'month') {
  const now = new Date();
  now.setHours(23, 59, 59, 999); // End of today
  
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0); // Start of day
  
  switch (range) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setDate(now.getDate() - 30); // 30 days ago (not month boundary)
      break;
    case 'quarter':
      startDate.setDate(now.getDate() - 90);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }
  
  return { startDate, endDate: now };
}

/**
 * Helper: Format period label for charts
 * Converts dates to readable labels based on range
 */
function formatDateLabel(dateStr, range) {
  const date = new Date(dateStr);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  switch (range) {
    case 'week':
      return days[date.getUTCDay()] + ' ' + date.getUTCDate();
    case 'month':
      return date.getUTCDate() + ' ' + months[date.getUTCMonth()];
    case 'year':
      return months[date.getUTCMonth()] + ' ' + date.getUTCDate();
    case 'quarter':
      return date.getUTCDate() + ' ' + months[date.getUTCMonth()];
    default:
      return dateStr;
  }
}

/**
 * Helper: Group expenses by time period (day/week/month)
 */
function groupByPeriod(expenses, range) {
  const grouped = {};
  
  expenses.forEach(exp => {
    const date = new Date(exp.date);
    let key;
    
    if (range === 'week') {
      key = date.toISOString().split('T')[0]; // Daily for week view
    } else if (range === 'month') {
      // Weekly grouping for month view
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      key = startOfWeek.toISOString().split('T')[0];
    } else {
      key = date.toISOString().split('T')[0];
    }
    
    if (!grouped[key]) {
      grouped[key] = { expenses: 0, budget: 0, count: 0 };
    }
    grouped[key].expenses += exp.amount;
    grouped[key].count += 1;
  });
  
  return grouped;
}

// GET /api/analytics - Get analytics for a date range
router.get('/', async (req, res, next) => {
  try {
    const range = req.query.range || 'month';
    const userId = req.user.id;
    
    const { startDate, endDate } = getDateRange(range);
    
    logger.info('📊 [getAnalytics] Fetching analytics', { 
      userId, 
      range, 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString() 
    });
    
    // 1. Fetch all expenses in range
    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).populate('categoryId', 'name');
    
    // 2. Fetch budgets for this user
    const budgets = await Budget.find({
      userId,
      isActive: true
    }).populate('categoryId', 'name');
    
    // 3. Calculate category breakdown
    const categoryMap = {};
    const categoryExpenseMap = {};
    
    expenses.forEach(exp => {
      const catName = exp.categoryId?.name || 'Uncategorized';
      
      if (!categoryMap[catName]) {
        categoryMap[catName] = { amount: 0, count: 0 };
      }
      categoryMap[catName].amount += exp.amount;
      categoryMap[catName].count += 1;
      categoryExpenseMap[catName] = exp.categoryId?._id || null;
    });
    
    // 4. Calculate totals
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avgSpend = expenses.length > 0 ? totalSpent / expenses.length : 0;
    const topCategoryEntry = Object.entries(categoryMap).sort((a, b) => b[1].amount - a[1].amount)[0];
    const topCategory = topCategoryEntry ? topCategoryEntry[0] : 'N/A';
    
    // 5. Calculate budget remaining (sum of all category budgets - spent)
    const totalBudget = budgets.reduce((sum, b) => sum + b.budgetLimit, 0);
    const budgetRemaining = Math.max(0, totalBudget - totalSpent);
    
    // 6. Format categories for pie chart
    const categories = Object.entries(categoryMap)
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([name, data]) => ({
        name,
        value: data.amount,
        count: data.count
      }));
    
    // 7. Group expenses by period for trend chart
    const groupedByPeriod = groupByPeriod(expenses, range);
    
    // Add budget data per period (simplified: total budget / number of periods)
    const periodCount = Object.keys(groupedByPeriod).length || 1;
    const budgetPerPeriod = totalBudget / periodCount;
    
    Object.keys(groupedByPeriod).forEach(key => {
      groupedByPeriod[key].budget = budgetPerPeriod;
    });
    
    // 8. Format trend data for bar chart
    const trend = Object.entries(groupedByPeriod)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .map(([date, data]) => ({
        label: formatDateLabel(date, range),
        date,
        expenses: Math.round(data.expenses * 100) / 100,
        budget: Math.round(data.budget * 100) / 100,
        count: data.count
      }));
    
    // 9. Format spending trend (same data, renamed for area chart)
    const spendingTrend = trend.map(t => ({
      label: t.label,
      date: t.date,
      amount: t.expenses
    }));
    
    // 10. Build stats object with NO INCOME (removed savings rate)
    const stats = {
      totalSpent: Math.round(totalSpent * 100) / 100,
      avgSpend: Math.round(avgSpend * 100) / 100,
      avgTransaction: expenses.length > 0 ? Math.round((totalSpent / expenses.length) * 100) / 100 : 0,
      topCategory,
      budgetRemaining: Math.round(budgetRemaining * 100) / 100,
      totalBudget: Math.round(totalBudget * 100) / 100,
      transactionCount: expenses.length,
      categoryCount: categories.length,
      // NOTE: savingsRate removed - no income model exists
      // To implement: create Income model and track income separately
    };
    
    logger.info('✅ [getAnalytics] Analytics computed', { 
      totalSpent, 
      categories: categories.length,
      expenses: expenses.length,
      periods: trend.length 
    });
    
    res.status(200).json({
      success: true,
      data: {
        range,
        period: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        stats,
        categories,
        trend,
        spendingTrend,
        expenses: expenses.slice(0, 20).map(e => ({
          date: e.date,
          description: e.description,
          amount: e.amount,
          category: e.categoryId?.name || 'Uncategorized'
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

// POST /api/analytics - Get filtered analytics (optional filters)
router.post('/', async (req, res, next) => {
  try {
    const { range = 'month', filters = {} } = req.body;
    const userId = req.user.id;
    
    logger.info('📊 [analyticsFiltered] Request received', { userId, range, filters });
    
    // Get date range
    const { startDate, endDate } = getDateRange(range);
    
    // Build query
    const query = { userId, date: { $gte: startDate, $lte: endDate } };
    
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
            stats: {
              totalSpent: 0,
              avgSpend: 0,
              topCategory: 'N/A',
              budgetRemaining: 0
            },
            categories: [],
            trend: [],
            spendingTrend: [],
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
    
    // Calculate metrics (same as GET endpoint)
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const avgSpend = expenses.length > 0 ? totalSpent / expenses.length : 0;
    
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
    
    const categories = Object.entries(categoryMap)
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([name, data]) => ({
        name,
        value: data.amount,
        count: data.count
      }));
    
    const topCategoryEntry = categories.length > 0 ? categories[0] : null;
    const topCategory = topCategoryEntry ? topCategoryEntry.name : 'N/A';
    
    // Trend by period
    const groupedByPeriod = groupByPeriod(expenses, range);
    const trend = Object.entries(groupedByPeriod)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .map(([date, data]) => ({
        label: formatDateLabel(date, range),
        date,
        expenses: Math.round(data.expenses * 100) / 100,
        budget: Math.round(data.budget * 100) / 100
      }));
    
    const spendingTrend = trend.map(t => ({
      label: t.label,
      date: t.date,
      amount: t.expenses
    }));
    
    const stats = {
      totalSpent: Math.round(totalSpent * 100) / 100,
      avgSpend: Math.round(avgSpend * 100) / 100,
      topCategory,
      budgetRemaining: 0 // Not calculated for filtered view
    };
    
    logger.info('✅ [analyticsFiltered] Analytics computed', { totalSpent, expenseCount: expenses.length });
    
    res.status(200).json({
      success: true,
      data: {
        range,
        stats,
        categories,
        trend,
        spendingTrend,
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
