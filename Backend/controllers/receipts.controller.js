import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import { config } from '../config/config.js';
import { Receipt } from '../models/Receipt.models.js';
import { Expense } from '../models/expense.models.js';
import { Category } from '../models/Category.models.js';
import { createWorker } from 'tesseract.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

/**
 * Enhanced Gemini-based OCR parsing for receipts
 * Uses structured JSON extraction for reliable data
 */
async function parseReceiptWithGemini(ocrText) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a receipt parser. Extract EXACTLY these fields from the receipt OCR text below.
Return a JSON object (no markdown, no code blocks, just plain JSON).
OCR TEXT:
---
${ocrText}
---
JSON FORMAT:
{
  "amount": <positive number (NOT string)>,
  "currency": "<3-letter code like USD or INR>",
  "date": "<YYYY-MM-DD>",
  "merchant": "<store or restaurant name>",
  "category": "<Food|Transport|Shopping|Entertainment|Utilities|Health|Education|Other>",
  "items": [{"name": "<item>", "price": <number>}]
}
CRITICAL RULES:
1. amount: MUST be a valid number. Look for: Total, Grand Total, Amount Due, Subtotal + Tax
2. DO NOT include tax, tip, or delivery separately - extract THE TOTAL ONLY
3. If amount has multiple values, pick the largest one (usually the final total)
4. Ensure amount > 0 and is realistic (e.g., 15.99, not 1599)
5. date: Extract from receipt. Use today if missing. Must be YYYY-MM-DD format
6. merchant: Store name, restaurant name, or vendor name
7. category: Choose ONE from the list based on merchant/items
8. items: Try to list purchased items with prices if visible
9. If a field is not found, use null but ALWAYS include all keys
10. Return ONLY valid JSON - no explanations, no markdown`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Remove markdown code blocks if present
    let jsonStr = responseText;
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // Validate extracted data
    if (!parsed.amount || typeof parsed.amount !== 'number' || parsed.amount <= 0) {
      logger.warn('⚠️  [parseReceiptWithGemini] Invalid amount:', parsed.amount);
      throw new Error('Invalid amount extracted from receipt');
    }
    
    // Ensure category is valid
    const validCategories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Health', 'Education', 'Other'];
    if (!validCategories.includes(parsed.category)) {
      parsed.category = 'Other';
    }
    
    // Ensure date is valid
    if (!parsed.date || isNaN(new Date(parsed.date).getTime())) {
      parsed.date = new Date().toISOString().split('T')[0];
    }
    
    logger.info('✅ [parseReceiptWithGemini] Successfully parsed receipt:', {
      amount: parsed.amount,
      currency: parsed.currency,
      category: parsed.category,
      date: parsed.date,
      merchant: parsed.merchant
    });
    
    return parsed;
  } catch (err) {
    logger.error('❌ [parseReceiptWithGemini] Gemini parsing failed:', err.message);
    // Fallback to basic regex parsing
    return parseReceiptBasic(ocrText);
  }
}

/**
 * Fallback basic regex-based parsing
 */
function parseReceiptBasic(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  // Extract amount - look for currency symbols or amount patterns
  let amount = null;
  const amountPattern = /(?:total|amount|sum|due|balance)[\s:]*\$?(\d+(?:\.\d{2})?)/i;
  
  for (const line of lines) {
    const match = line.match(amountPattern);
    if (match) {
      amount = parseFloat(match[1]);
      break;
    }
    // Fallback: look for any monetary value at end of line
    const dollarMatch = line.match(/\$(\d+(?:\.\d{2})?)/);
    if (dollarMatch && parseFloat(dollarMatch[1]) > 0) {
      amount = parseFloat(dollarMatch[1]);
    }
  }

  // Extract date
  let date = null;
  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
  for (const line of lines) {
    const match = line.match(datePattern);
    if (match) {
      date = match[1];
      break;
    }
  }

  // Guess category from keywords
  const textLower = text.toLowerCase();
  let category = 'Other';
  if (textLower.includes('restaurant') || textLower.includes('cafe') || textLower.includes('food')) {
    category = 'Food';
  } else if (textLower.includes('gas') || textLower.includes('fuel') || textLower.includes('uber') || textLower.includes('taxi')) {
    category = 'Transport';
  } else if (textLower.includes('store') || textLower.includes('shop') || textLower.includes('mall')) {
    category = 'Shopping';
  }

  return {
    amount: amount || null,
    currency: 'USD',
    date: date || new Date().toISOString().split('T')[0],
    merchant: null,
    items: [],
    category,
  };
}

export async function uploadReceipt(req, res, next) {
	try {
		const userId = req.user.id;
		
		if (!req.file) {
			throw new AppError('No file provided', 400);
		}

		const file = req.file;
		logger.info('📸 [uploadReceipt] Starting receipt upload', {
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

		// Perform OCR on the file
		logger.info('🔍 [uploadReceipt] Running OCR...');
		const worker = await createWorker('eng');
		const { data: { text } } = await worker.recognize(file.buffer);
		await worker.terminate();

		logger.info('📝 [uploadReceipt] OCR complete, text length:', text.length);

		// Parse receipt data using Gemini
		const extractedData = await parseReceiptWithGemini(text);

		// Store receipt in database with normalized data structure
		const receipt = await Receipt.create({
			userId,
			fileName: file.originalname,
			fileSize: file.size,
			mimeType: file.mimetype,
			extractedData: {
				text,
				// Store both original and normalized field names for compatibility
				amount: extractedData.amount,
				total: extractedData.amount, // For backward compatibility
				date: extractedData.date,
				dates: [extractedData.date], // For backward compatibility
				merchant: extractedData.merchant,
				category: extractedData.category,
				currency: extractedData.currency,
				items: extractedData.items || []
			},
			isProcessed: false,
			fileUrl: `/uploads/${file.filename || file.originalname}`
		});

		logger.info('✅ [uploadReceipt] Receipt saved:', receipt._id);

		// Automatically create expense if amount is valid
		if (extractedData.amount && extractedData.amount > 0) {
			try {
				logger.info('💾 [uploadReceipt] Creating expense from receipt...');

				// Get or create category
				let category = await Category.findOne({
					userId,
					name: new RegExp(extractedData.category, 'i')
				});

				if (!category) {
					// Create category if it doesn't exist
					category = await Category.create({
						userId,
						name: extractedData.category,
						color: '#3498db',
						icon: 'receipt'
					});
					logger.info('📂 [uploadReceipt] Created new category:', category.name);
				}

				// Create expense
				const expense = await Expense.create({
					userId,
					description: extractedData.merchant || file.originalname,
					amount: extractedData.amount,
					categoryId: category._id,
					date: extractedData.date ? new Date(extractedData.date) : new Date(),
					paymentMethod: 'card',
					notes: `Receipt ID: ${receipt._id}`,
					tags: ['ocr', 'receipt']
				});

				// Mark receipt as processed
				receipt.isProcessed = true;				
				await receipt.save();

				logger.info('✅ [uploadReceipt] Expense and receipt fully processed:', {
					expenseId: expense._id,
					ceiptId: receipt._id,
					amount: expense.amount,
					category: category.name,
					isProcessed: true
				});
				logger.info('✅ [uploadReceipt] Expense created:', {
					expenseId: expense._id,
					amount: expense.amount,
					category: category.name
				});

				return res.status(201).json({
					success: true,
					data: {
						receipt: {
							id: receipt._id,
							fileName: receipt.fileName,
							uploadedAt: receipt.createdAt,
							extractedData: receipt.extractedData,
							isProcessed: true,
						},
						expense: {
							id: expense._id,
							amount: expense.amount,
							category: category.name,
							date: expense.date,
						},
						message: 'Receipt uploaded and expense created successfully'
					}
				});
			} catch (expenseErr) {
				logger.warn('⚠️  [uploadReceipt] Failed to create expense, but receipt saved:', expenseErr.message);
				// Still return success since receipt was saved
				return res.status(201).json({
					success: true,
					data: {
						receipt: {
							id: receipt._id,
							fileName: receipt.fileName,
							uploadedAt: receipt.createdAt,
							extractedData: receipt.extractedData,
							isProcessed: false,
						},
						message: 'Receipt uploaded successfully (expense creation failed)'
					}
				});
			}
		}

		res.status(201).json({
			success: true,
			data: {
				receipt: {
					id: receipt._id,
					fileName: receipt.fileName,
					uploadedAt: receipt.createdAt,
					extractedData: receipt.extractedData,
					message: 'Receipt uploaded and processed'
				}
			}
		});
	} catch (error) {
		logger.error('❌ [uploadReceipt] Error:', error.message);
		next(error);
	}
}

/**
 * Get all receipts for authenticated user
 */
export async function getReceipts(req, res, next) {
	try {
		const userId = req.user.id;
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
		const userId = req.user.id;
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
 * Delete receipt and associated expense
 */
export async function deleteReceipt(req, res, next) {
	try {
		const userId = req.user.id;
		const { id } = req.params;

		logger.debug('🗑️  [deleteReceipt] Deleting receipt:', { userId, receiptId: id });

		const receipt = await Receipt.findOne({ _id: id, userId });
		if (!receipt) {
			logger.warn('⚠️  [deleteReceipt] Receipt not found:', { userId, receiptId: id });
			throw new AppError('Receipt not found', 404);
		}

		// Delete the receipt from database
		await Receipt.deleteOne({ _id: id });
		logger.info('✅ [deleteReceipt] Receipt deleted:', { userId, receiptId: id });

		// Also delete any associated expenses (if notes contain receipt ID)
		try {
			const deleteResult = await Expense.deleteMany({
				userId,
				notes: { $regex: id }
			});
			if (deleteResult.deletedCount > 0) {
				logger.info('✅ [deleteReceipt] Associated expenses deleted:', { count: deleteResult.deletedCount });
			}
		} catch (expenseErr) {
			logger.warn('⚠️  [deleteReceipt] Failed to delete associated expenses:', expenseErr.message);
			// Continue - receipt was already deleted
		}

		res.status(200).json({
			success: true,
			message: 'Receipt deleted successfully',
			data: { deletedReceiptId: id }
		});
	} catch (error) {
		logger.error('❌ [deleteReceipt] Error:', error.message);
		next(error);
	}
}

/**
 * Create expense from receipt
 * Extracts data from OCR result and creates an expense
 */
export async function createExpenseFromReceipt(req, res, next) {
	try {
		const userId = req.user.id;
		const { receiptId, description, amount, categoryId, date } = req.body;
		const receipt = receipt.find(r => r.id === receiptId && r.userId === userId);
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
