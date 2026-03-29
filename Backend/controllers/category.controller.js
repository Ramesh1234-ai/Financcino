// Backend/controllers/category.controller.js
import { Category } from '../models/Category.models.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', color: '#FF6B6B', icon: 'utensils' },
  { name: 'Transportation', color: '#4ECDC4', icon: 'car' },
  { name: 'Shopping', color: '#95E1D3', icon: 'shopping-bag' },
  { name: 'Entertainment', color: '#F9B4AB', icon: 'film' },
  { name: 'Bills & Utilities', color: '#87CEEB', icon: 'bolt' },
  { name: 'Health & Fitness', color: '#DDA0DD', icon: 'heart' },
  { name: 'Education', color: '#FFD700', icon: 'book' },
  { name: 'Other', color: '#A9A9A9', icon: 'tag' },
];

export async function getCategories(req, res, next) {
  try {
    // Validate user is authenticated
    if (!req.user || !req.user.id) {
      logger.warn('❌ [getCategories] No authenticated user');
      throw new AppError('Authentication required', 401);
    }

    logger.info('📂 [getCategories] Fetching categories for user:', req.user.id);

    // Fetch user's categories from database
    let categories = await Category.find({ userId: req.user.id }).lean();

    // If no categories exist, create defaults
    if (categories.length === 0) {
      logger.info('📂 [getCategories] No categories found, creating defaults for user:', req.user.id);
      
      try {
        const createdCategories = await Promise.all(
          DEFAULT_CATEGORIES.map(cat =>
            Category.create({
              userId: req.user.id,
              name: cat.name,
              color: cat.color,
              icon: cat.icon,
            })
          )
        );

        categories = createdCategories.map(cat => ({
          _id: cat._id,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          userId: cat.userId,
        }));
        logger.info('✅ [getCategories] Created', categories.length, 'default categories');
      } catch (createErr) {
        logger.error('❌ [getCategories] Failed to create default categories:', createErr.message);
        // Return empty array with defaults as fallback
        categories = DEFAULT_CATEGORIES.map((cat, idx) => ({
          _id: `default-${idx}`,
          ...cat,
        }));
      }
    }
    logger.info('✅ [getCategories] Returning', categories.length, 'categories');
    res.status(200).json({
      success: true,
      data: {
        categories,
        count: categories.length,
      },
    });
  } catch (err) {
    logger.error('❌ [getCategories] Error:', err.message);
    next(err);
  }
}
export async function createCategory(req, res, next) {
  try {
    const { name, color, icon } = req.body;
    const category = await Category.create({
      userId: req.user.id,
      name,
      color: color || '#3498db',
      icon: icon || 'tag',
    });
    logger.info(`Category created: ${category._id} by user ${req.user.id}`);
    res.status(201).json({ success: true, data: { category } });
  } catch (err) {
    next(err);
  }
}
export async function updateCategory(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    if (category.userId.toString() !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }

    Object.assign(category, req.body);
    await category.save();

    logger.info(`Category updated: ${category._id}`);

    res.json({ success: true, data: { category } });
  } catch (err) {
    next(err);
  }
}
export async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    if (category.userId.toString() !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }
    await Category.deleteOne({ _id: req.params.id });
    logger.info(`Category deleted: ${req.params.id}`);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
}
