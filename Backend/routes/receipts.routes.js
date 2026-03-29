import express from 'express';
import multer from 'multer';
import * as receiptsController from '../controllers/receipts.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory (can be changed to disk)
const upload = multer({
	storage,
	limits: {
		fileSize: 10 * 1024 * 1024 // 10MB limit
	},
	fileFilter: (req, file, cb) => {
		const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
		}
	}
});

// All receipt routes require authentication
router.use(requireAuth);

/**
 * POST /api/receipts/upload
 * Upload a receipt image and process with OCR
 */
router.post('/upload', upload.single('receipt'), receiptsController.uploadReceipt);

/**
 * GET /api/receipts
 * Get all receipts for the authenticated user
 */
router.get('/', receiptsController.getReceipts);

/**
 * GET /api/receipts/:id
 * Get a specific receipt by ID
 */
router.get('/:id', receiptsController.getReceiptById);

/**
 * DELETE /api/receipts/:id
 * Delete a receipt
 */
router.delete('/:id', receiptsController.deleteReceipt);

/**
 * POST /api/receipts/:id/expense
 * Create an expense from a receipt
 */
router.post('/:id/expense', receiptsController.createExpenseFromReceipt);

export default router;
