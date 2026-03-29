// Backend/routes/budgets.routes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Budget } from '../models/Budget.models.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
const router = express.Router();
router.use(requireAuth);
router.get('/', async (req, res, next) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id }).populate('categoryId');
    res.json({ success: true, data: { budgets } });
  } catch (err) {
    next(err);
  }
});
router.post('/', async (req, res, next) => {
  try {
    const { categoryId, budgetLimit, period } = req.body;
   
    const budget = await Budget.create({
      userId: req.user.id,
      categoryId,
      budgetLimit,
      period: period || 'monthly',
    });
    logger.info(`Budget created: ${budget._id}`);
    res.status(201).json({ success: true, data: { budget } });
  } catch (err) {
    next(err);
  }
});
router.get('/:id', async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id).populate('categoryId');
    if (!budget) throw new AppError('Budget not found', 404);
    if (budget.userId.toString() !== req.user.id) throw new AppError('Not authorized', 403);
    res.json({ success: true, data: { budget } });
  } catch (err) {
    next(err);
  }
});
router.put('/:id', async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) throw new AppError('Budget not found', 404);
    if (budget.userId.toString() !== req.user.id) throw new AppError('Not authorized', 403);
    Object.assign(budget, req.body);
    await budget.save();
    logger.info(`Budget updated: ${budget._id}`);
    res.json({ success: true, data: { budget } });
  } catch (err) {
    next(err);
  }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) throw new AppError('Budget not found', 404);
    if (budget.userId.toString() !== req.user.id) throw new AppError('Not authorized', 403);
    await Budget.deleteOne({ _id: req.params.id });
    logger.info(`Budget deleted: ${req.params.id}`);
    res.json({ success: true, message: 'Budget deleted' });
  } catch (err) {
    next(err);
  }
});
export default router;
