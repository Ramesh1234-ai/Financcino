import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import { config } from '../config/config.js';
import { Receipt } from '../models/Receipt.models.js';

/**
 * Upload and process receipt with OCR
 * Note: For production, integrate Tesseract.js, AWS Textract, or Google Cloud Vision
 */
export async function uploadReceipt(req, res, next) {
	try {
		const userId = req.userId;
		
		if (!req.file) {
			throw new AppError('No file provided', 400);
		}

		const file = req.file;
		logger.info('Receipt upload', {
			userId,
			fileName: file.originalname,
			fileSize: file.size,
			mimeType: file.mimetype
		});

		// Validate file type
		const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
		if (!allowedMimes.includes(file.mimetype)) {
			throw new AppError('Only images and PDFs are supported', 400);
		}

		// In production: Run OCR on the file
		// For now, create a mock extracted data response
		const extractedData = {
			text: `Receipt from ${new Date().toLocaleDateString()}\nFile: ${file.originalname}`,
			dates: [new Date().toISOString().split('T')[0]],
			total: Math.round(Math.random() * 10000) / 100, // Mock amount
			items: [
				{ description: 'Item 1', amount: 10.50 },
				{ description: 'Item 2', amount: 25.00 }
			],
			confidence: 0.85
		};

		// Store receipt in database
		const receipt = await Receipt.create({
			userId,
			fileName: file.originalname,
			fileSize: file.size,
			mimeType: file.mimetype,
			extractedData,
			fileUrl: `/uploads/${file.filename || file.originalname}` // Replace with actual storage path
		});

		res.status(201).json({
			success: true,
			data: {
				id: receipt._id,
				fileName: receipt.fileName,
				uploadedAt: receipt.createdAt,
				extractedData: receipt.extractedData,
				message: 'Receipt uploaded and processed successfully'
			}
		});
	} catch (error) {
		logger.error('Receipt upload error:', error);
		next(error);
	}
}

/**
 * Get all receipts for authenticated user
 */
export async function getReceipts(req, res, next) {
	try {
		const userId = req.userId;
		const page = parseInt(req.query.page) || 1;
		const itemsPerPage = config.ITEMS_PER_PAGE || 50;
		const skip = (page - 1) * itemsPerPage;

		// Get receipts from database
		const [receipts, total] = await Promise.all([
			Receipt.find({ userId }).skip(skip).limit(itemsPerPage).sort({ createdAt: -1 }),
			Receipt.countDocuments({ userId })
		]);

		logger.info('Get receipts', {
			userId,
			page,
			totalReceipts: total,
			returnedCount: receipts.length
		});

		res.status(200).json({
			success: true,
			data: receipts,
			pagination: {
				page,
				itemsPerPage,
				total,
				pages: Math.ceil(total / itemsPerPage)
			}
		});
	} catch (error) {
		logger.error('Get receipts error:', error);
		next(error);
	}
}

/**
 * Get receipt by ID
 */
export async function getReceiptById(req, res, next) {
	try {
		const userId = req.userId;
		const { id } = req.params;

		const receipt = await Receipt.findOne({ _id: id, userId });

		if (!receipt) {
			throw new AppError('Receipt not found', 404);
		}

		logger.info('Get receipt by ID', { userId, receiptId: id });

		res.status(200).json({
			success: true,
			data: receipt
		});
	} catch (error) {
		logger.error('Get receipt error:', error);
		next(error);
	}
}

/**
 * Delete receipt
 */
export async function deleteReceipt(req, res, next) {
	try {
		const userId = req.userId;
		const { id } = req.params;

		const receipt = await Receipt.findOneAndDelete({ _id: id, userId });

		if (!receipt) {
			throw new AppError('Receipt not found', 404);
		}

		logger.info('Receipt deleted', { userId, receiptId: id });

		res.status(200).json({
			success: true,
			message: 'Receipt deleted successfully'
		});
	} catch (error) {
		logger.error('Delete receipt error:', error);
		next(error);
	}
}

/**
 * Create expense from receipt
 * Extracts data from OCR result and creates an expense
 */
export async function createExpenseFromReceipt(req, res, next) {
	try {
		const userId = req.userId;
		const { receiptId, description, amount, categoryId, date } = req.body;

		const receipt = receipts.find(r => r.id === receiptId && r.userId === userId);
		if (!receipt) {
			throw new AppError('Receipt not found', 404);
		}

		// In production: Create actual Expense document in MongoDB
		const expense = {
			id: `expense_${Date.now()}`,
			userId,
			receiptId,
			description: description || receipt.fileName,
			amount: parseFloat(amount) || receipt.extractedData.total,
			categoryId,
			date: date || new Date().toISOString().split('T')[0],
			receiptImage: receipt.fileUrl,
			createdAt: new Date().toISOString()
		};

		logger.info('Expense created from receipt', {
			userId,
			receiptId,
			expenseId: expense.id
		});

		res.status(201).json({
			success: true,
			data: expense,
			message: 'Expense created from receipt successfully'
		});
	} catch (error) {
		logger.error('Create expense from receipt error:', error);
		next(error);
	}
}
