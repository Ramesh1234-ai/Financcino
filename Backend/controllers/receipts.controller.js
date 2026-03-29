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
 * Clean and normalize OCR text before parsing
 */
function cleanOCRText(text) {
  if (!text) return '';
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

/**
 * Enhanced Gemini-based OCR parsing for receipts
 * Uses structured JSON extraction for reliable data
 */
async function parseReceiptWithGemini(ocrText) {
  try {
    // Validate OCR text
    if (!ocrText || ocrText.trim().length === 0) {
      logger.warn('⚠️  [parseReceiptWithGemini] Empty OCR text received');
      return parseReceiptBasic(ocrText);
    }

    // Clean OCR text before sending to Gemini
    const cleanedText = cleanOCRText(ocrText);
    logger.info('📝 [parseReceiptWithGemini] OCR text cleaned, length:', cleanedText.length);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a STRICT financial extraction system with ZERO tolerance for guessing.

Extract receipt data from OCR text with EXTREME CAUTION.

Return ONLY valid JSON in this format (NO explanations, NO comments):
{
  "amount": number | null,
  "amount_line": string | null,
  "merchant": string | null,
  "date": string | null,
  "category": string | null,
  "confidence": "high" | "low"
}

⚠️ CRITICAL - READ CAREFULLY:

1. AMOUNT EXTRACTION (MOST CRITICAL):
   - ONLY extract if you find a line containing BOTH:
     (a) explicit keyword: "Total", "Grand Total", "Amount Paid", "Net Amount", "Amount Due"
     (b) followed by a number (not in a list of items)
   
   - REJECT if:
     * No clear "Total" keyword found
     * Could be item price instead of total
     * Confidence is below 95%
   
   - SPECIAL RULE FOR ZERO:
     * 0 is ONLY valid if line reads exactly like "Total: 0" or "Amount Paid: 0"
     * If amount is 0 but no explicit "Total" keyword → REJECT and return null
     * When in doubt about 0 → return null (IMPORTANT)
   
   - When you extract amount:
     * Return the EXACT line containing the amount
     * Include the keyword and number in amount_line
     * Example: amount_line: "Total Amount: ₹450.50"

2. NO HALLUCINATION:
   - Never invent numbers
   - Never guess amounts
   - Never use item prices
   - Never use tax amounts
   - Never use subtotals without "Total" keyword
   - If unsure → return null, not a guess

3. MERCHANT:
   - Extract if first line is clearly readable
   - Return null if noisy/corrupted
   
4. DATE:
   - Convert to YYYY-MM-DD only if parseable
   - Return null otherwise

5. CATEGORY:
   - Only assign if obvious: Food, Grocery, Travel, Shopping
   - Otherwise return "Other"

6. CONFIDENCE:
   - Return "high" only if all data extracted with certainty
   - Return "low" if uncertain about any field
   - (This helps identify potential hallucinations)

7. OUTPUT:
   - ONLY JSON
   - NO explanations before or after
   - NO code blocks
   - NO comments

OCR TEXT:
---
${cleanedText}
---

Return ONLY the JSON object, nothing else.`;

    const result = await model.generateContent(prompt);
    
    if (!result.response.text()) {
      logger.error('❌ [parseReceiptWithGemini] Empty response from Gemini');
      return parseReceiptBasic(ocrText);
    }

    const responseText = result.response.text().trim();
    logger.info('📬 [parseReceiptWithGemini] Gemini response received, length:', responseText.length);
    
    // Remove markdown code blocks if present
    let jsonStr = responseText;
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    
    logger.info('✅ [parseReceiptWithGemini] Parsed response:', {
      amount: parsed.amount,
      amount_line: parsed.amount_line,
      confidence: parsed.confidence,
      merchant: parsed.merchant,
      date: parsed.date,
      category: parsed.category
    });
    
    // CRITICAL: Validate amount extraction to prevent hallucinations
    if (parsed.amount === null || parsed.amount === undefined) {
      logger.warn('⚠️  [parseReceiptWithGemini] No valid amount found by Gemini - trying fallback');
      const fallback = parseReceiptBasic(ocrText);
      parsed.amount = fallback.amount;
      parsed.amount_line = fallback.amount_line;
    } else if (typeof parsed.amount !== 'number' || parsed.amount < 0) {
      logger.warn('⚠️  [parseReceiptWithGemini] Invalid amount from Gemini:', parsed.amount);
      const fallback = parseReceiptBasic(ocrText);
      parsed.amount = fallback.amount;
      parsed.amount_line = fallback.amount_line;
    } else if (parsed.amount === 0) {
      // SPECIAL VALIDATION: 0 is only valid if explicitly shown in amount_line
      const hasExplicitZero = parsed.amount_line && 
                              /\b(?:total|grand\s*total|amount\s*(?:paid|due)|net\s*amount)[\s:]*0\b/i.test(parsed.amount_line);
      
      if (!hasExplicitZero) {
        logger.warn('⚠️  [parseReceiptWithGemini] Amount is 0 but not explicitly labeled as Total - REJECTING as hallucination');
        logger.info('Amount line provided:', parsed.amount_line);
        const fallback = parseReceiptBasic(ocrText);
        parsed.amount = fallback.amount;
        parsed.amount_line = fallback.amount_line;
      } else {
        logger.info('✅ [parseReceiptWithGemini] Amount is 0 but explicitly labeled as total - ACCEPTING');
      }
    } else if (parsed.confidence === 'low') {
      logger.warn('⚠️  [parseReceiptWithGemini] Confidence marked as LOW - using fallback for safety');
      const fallback = parseReceiptBasic(ocrText);
      parsed.amount = fallback.amount || parsed.amount;
      parsed.amount_line = fallback.amount_line || parsed.amount_line;
    }
    
    // Validate category (use fallback if not provided)
    const validCategories = ['Food', 'Grocery', 'Travel', 'Shopping', 'Other'];
    if (!parsed.category || !validCategories.includes(parsed.category)) {
      parsed.category = 'Other';
    }
    
    // Keep date as null if not extracted (don't fill with today's date)
    if (parsed.date && isNaN(new Date(parsed.date).getTime())) {
      logger.warn('⚠️  [parseReceiptWithGemini] Invalid date format:', parsed.date);
      parsed.date = null;
    }
    
    // Merchant can be null - that's ok
    if (parsed.merchant && typeof parsed.merchant !== 'string') {
      parsed.merchant = null;
    }
    
    // amount_line must be string or null
    if (parsed.amount_line && typeof parsed.amount_line !== 'string') {
      parsed.amount_line = null;
    }
    
    logger.info('✅ [parseReceiptWithGemini] Successfully parsed receipt:', {
      amount: parsed.amount,
      amount_line: parsed.amount_line,
      category: parsed.category,
      date: parsed.date,
      merchant: parsed.merchant
    });
    
    return {
      amount: parsed.amount,
      amount_line: parsed.amount_line || null,
      merchant: parsed.merchant || null,
      date: parsed.date || null,
      category: parsed.category || 'Other',
      currency: 'INR', // Default currency for India
      items: [] // Simplified structure
    };
  } catch (err) {
    logger.error('❌ [parseReceiptWithGemini] Gemini parsing failed:', {
      error: err.message,
      errorType: err.constructor.name,
      stack: err.stack
    });
    // Fallback to basic regex parsing
    return parseReceiptBasic(ocrText);
  }
}

/**
 * Fallback basic regex-based parsing with improved patterns
 */
function parseReceiptBasic(text) {
  if (!text) {
    logger.warn('⚠️  [parseReceiptBasic] Empty text provided');
    return {
      amount: null,
      amount_line: null,
      merchant: null,
      date: null,
      category: 'Other',
      currency: 'INR',
      items: []
    };
  }

  const lines = text.split('\n').map(l => l.trim()).filter(l => l && l.length > 1);
  
  logger.info('📋 [parseReceiptBasic] Processing', lines.length, 'lines');

  // Extract amount - look for currency symbols or amount patterns
  let amount = null;
  let amount_line = null;
  const amountPatterns = [
    // Common patterns with keywords - MUST have explicit total keyword
    /(?:total|grand\s*total|amount\s*(?:due|paid)?|final|balance|subtotal|net|sum)[\s:]*[₹$€£¥]*\s*(\d{1,6}(?:[.,]\d{2})?)/i,
    // Lines ending with currency and number
    /[₹$€£¥]\s*(\d{1,6}(?:[.,]\d{2})?)/,
    // Large numbers (potential totals)
    /(\d{2,6}(?:[.,]\d{2})?)\s*(?:only|rupees?|dollars?|inr|usd)?$/i,
  ];

  for (const pattern of amountPatterns) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match) {
        let parsed = match[1].replace(/[,]/g, '');
        parsed = parseFloat(parsed);
        
        // Validate amount
        if (parsed === 0) {
          // 0 is ONLY valid if explicitly labeled with total keyword
          const hasExplicitZero = /\b(?:total|grand\s*total|amount\s*(?:due|paid)|net|final)\b.*\b0\b/i.test(line);
          if (hasExplicitZero) {
            amount = 0;
            amount_line = line;
            logger.info('✅ [parseReceiptBasic] Found explicit zero amount from line:', line);
            break;
          }
          // Otherwise skip this 0
        } else if (parsed > 0 && parsed < 999999) {
          amount = parsed;
          amount_line = line;
          logger.info('✅ [parseReceiptBasic] Found amount:', amount, 'from line:', line);
          break;
        }
      }
    }
    if (amount !== null) break; // Change to !== null to allow 0
  }

  // Extract date - multiple formats
  let date = null;
  const datePatterns = [
    // DD/MM/YYYY or DD-MM-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    // YYYY-MM-DD
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    // DD MM YYYY
    /(\d{1,2})\s+(\d{1,2})\s+(\d{4})/,
  ];

  for (const pattern of datePatterns) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match) {
        let day = parseInt(match[1]);
        let month = parseInt(match[2]);
        let year = parseInt(match[3]);

        // Detect format: if first number > 31, it's year-first format
        if (day > 31) {
          [day, month, year] = [month, parseInt(match[3]), day];
        }

        // Validate
        if (day > 31 || month > 12 || month < 1 || day < 1) continue;
        if (year < 100) year = year < 50 ? 2000 + year : 1900 + year;

        const dateObj = new Date(year, month - 1, day);
        if (!isNaN(dateObj.getTime())) {
          date = dateObj.toISOString().split('T')[0];
          logger.info('✅ [parseReceiptBasic] Found date:', date, 'from line:', line);
          break;
        }
      }
    }
    if (date) break;
  }

  // Extract merchant - usually first meaningful non-numeric line
  let merchant = null;
  for (const line of lines) {
    if (line.length > 2 && line.length < 100 && !line.match(/^\d+/) && !line.match(/total|amount|date/i)) {
      merchant = line
        .replace(/[^\w\s\-&.]/g, '') // Remove special chars
        .replace(/\s+/g, ' ')
        .trim();
      if (merchant && merchant.length > 2) {
        logger.info('✅ [parseReceiptBasic] Found merchant:', merchant);
        break;
      }
    }
  }

  // Guess category from keywords
  const textLower = text.toLowerCase();
  let category = 'Other';
  
  // Map to simplified categories from strict extraction
  const categoryMap = {
    'Food': ['restaurant', 'cafe', 'food', 'pizza', 'burger', 'hotel', 'bistro', 'diner', 'dining', 'swiggy', 'zomato', 'ubereats', 'grab'],
    'Grocery': ['store', 'shop', 'supermarket', 'mart', 'grocery', 'market'],
    'Travel': ['taxi', 'uber', 'ola', 'car', 'fuel', 'petrol', 'gas', 'parking', 'metro', 'train', 'bus', 'flight', 'auto'],
    'Shopping': ['mall', 'retail', 'amazon', 'flipkart', 'clothing', 'apparel', 'boutique'],
    'Other': ['other']
  };

  for (const [cat, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(kw => textLower.includes(kw))) {
      category = cat;
      logger.info('✅ [parseReceiptBasic] Detected category:', category);
      break;
    }
  }

  return {
    amount: amount || null,
    amount_line: amount_line || null,
    merchant: merchant || null,
    date: date || null, // Don't fill with today's date - respect null from strict extraction
    category: category,
    currency: 'INR', // Default currency for India
    items: []
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

		const ocrText = text.trim();
		logger.info('📝 [uploadReceipt] OCR complete', {
			textLength: ocrText.length,
			textPreview: ocrText.substring(0, 200),
			isEmpty: ocrText.length === 0
		});

		// Validate OCR output
		if (ocrText.length === 0) {
			logger.warn('⚠️  [uploadReceipt] OCR returned empty text - file may not be a valid receipt image');
			return res.status(400).json({
				success: false,
				message: 'Could not extract text from image. Please ensure image is clear and contains a receipt.'
			});
		}

		// Parse receipt data using Gemini
		const extractedData = await parseReceiptWithGemini(ocrText);

		logger.info('🔎 [uploadReceipt] Final extracted data:', {
			amount: extractedData.amount,
			amount_line: extractedData.amount_line,
			merchant: extractedData.merchant,
			date: extractedData.date,
			category: extractedData.category
		});

		// Store receipt in database with normalized data structure
		const receipt = await Receipt.create({
			userId,
			fileName: file.originalname,
			fileSize: file.size,
			mimeType: file.mimetype,
			extractedData: {
				text: ocrText,
				// Store both original and normalized field names for compatibility
				amount: extractedData.amount,
				amount_line: extractedData.amount_line, // For verification and debugging
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

		// Automatically create expense if amount is valid (must be > 0)
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

		// If we reach here, amount was null or 0
		if (extractedData.amount === null) {
			logger.warn('⚠️  [uploadReceipt] Amount could not be extracted - neither Gemini nor fallback found valid total');
			logger.info('💡 [uploadReceipt] Check amount_line in extracted data:', extractedData.amount_line);
		} else if (extractedData.amount === 0) {
			logger.warn('⚠️  [uploadReceipt] Amount is 0 - either hallucination detected or actual free item');
			logger.info('📝 [uploadReceipt] Amount line:', extractedData.amount_line);
			logger.info('🔍 [uploadReceipt] Review OCR text to verify if receipt is actually $0');
		}

		res.status(201).json({
			success: true,
			data: {
				receipt: {
					id: receipt._id,
					fileName: receipt.fileName,
					uploadedAt: receipt.createdAt,
					extractedData: receipt.extractedData,
					message: extractedData.amount ? 'Receipt uploaded and processed' : 'Receipt uploaded but amount could not be extracted'
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
