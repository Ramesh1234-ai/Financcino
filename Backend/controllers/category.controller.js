// Backend/controllers/category.controller.js
import { Category } from '../models/Category.models.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export async function getCategories(req, res, next) {
  try {
    const categories = await Category.find({ userId: req.userId }).lean();
    res.json({ success: true, data: { categories } });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const { name, color, icon } = req.body;

    const category = await Category.create({
      userId: req.userId,
      name,
      color: color || '#3498db',
      icon: icon || 'tag',
    });

    logger.info(`Category created: ${category._id} by user ${req.userId}`);

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
    if (category.userId.toString() !== req.userId) {
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
    if (category.userId.toString() !== req.userId) {
      throw new AppError('Not authorized', 403);
    }

    await Category.deleteOne({ _id: req.params.id });

    logger.info(`Category deleted: ${req.params.id}`);

    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
}
