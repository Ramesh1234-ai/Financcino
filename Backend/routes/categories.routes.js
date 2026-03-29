// Backend/routes/categories.routes.js
import express from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateCategory } from '../middleware/validation.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', categoryController.getCategories);
router.post('/', validateCategory, categoryController.createCategory);
router.put('/:id', validateCategory, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
