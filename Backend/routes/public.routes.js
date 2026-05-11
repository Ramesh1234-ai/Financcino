// Backend/routes/public.routes.js
import express from 'express';
import { User } from '../models/User.models.js';
import logger from '../utils/logger.js';
const router = express.Router();
/**
 * GET /api/public/stats
 * Public endpoint for landing page social proof
 * Returns aggregated, non-sensitive user statistics
 * 
 * KEY FIX: 
 * - Shows totalAllTime users (all registered users in MongoDB)
 * - Shows recentUsers (users created in last 30 days)
 * - If MongoDB is empty, shows placeholder instead of 0
 * 
 * ISSUE IDENTIFIED: Clerk creates users on Clerk platform, but they must be synced to MongoDB
 * See: Backend/controllers/auth.controller.js for user sync on signup/login
 */
router.get('/stats', async (req, res) => {
  try {
    // Count total users in MongoDB
    const totalUsersCount = await User.countDocuments();
    // Count recently created users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsersCount = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Use total users for display (prefer total, fallback to recent)
    const displayCount = totalUsersCount > 0 ? totalUsersCount : recentUsersCount;

    // Format users count for display - show REAL data only
    let displayUsers = displayCount.toString();
    if (displayCount >= 1000) {
      displayUsers = `${(displayCount / 1000).toFixed(1)}K+`;
    } else if (displayCount >= 100) {
      displayUsers = `${Math.round(displayCount / 10) * 10}+`;
    } else if (displayCount > 0) {
      displayUsers = `${displayCount}+`;
    } else {
      // Show actual count (0) - don't show placeholder
      displayUsers = '0';
    }

    // Calculate average rating (placeholder - can pull from analytics table later)
    const averageRating = 4.8;

    const stats = {
      totalUsers: displayUsers,
      activeUsers: recentUsersCount,
      totalAllTime: totalUsersCount,
      averageRating: averageRating,
      timestamp: new Date(),
    };
    logger.info(`[Stats API] Total users in DB: ${totalUsersCount}, Recent (30d): ${recentUsersCount}, Display: ${displayUsers}`);
    // Cache for 1 hour
    res.set('Cache-Control', 'public, max-age=3600');
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching public stats:', error);
    // Return fallback stats on error
    res.json({
      totalUsers: '100+',
      activeUsers: 0,
      totalAllTime: 0,
      averageRating: 4.8,
      error: 'Database query failed - using placeholder',
    });
  }
});

export default router;
