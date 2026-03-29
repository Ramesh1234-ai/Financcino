import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/config.js';
import { Expense } from '../models/expense.models.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'AIzaSyDF_ObJ32jYnn-PRf0S4K-HuzkU-RgWB9U');

/**
 * Enhanced chatbot with expense context
 */
export async function sendMessage(req, res, next) {
	try {
		const { message } = req.body;
		const userId = req.user.id;

		if (!message || typeof message !== 'string' || !message.trim()) {
			throw new AppError('Message is required', 400);
		}

		const trimmedMessage = message.trim();
		logger.info('💬 [sendMessage] Processing message', { userId, messageLength: message.length });

		// Get recent expenses for context
		const recentExpenses = await Expense.find({ userId })
			.sort({ date: -1 })
			.limit(10)
			.populate('categoryId', 'name')
			.lean();

		// Build expense summary
		let expenseContext = '';
		if (recentExpenses.length > 0) {
			const expenseSummary = recentExpenses
				.map(e => `${new Date(e.date).toLocaleDateString()}: ₹${e.amount} on ${e.categoryId?.name || 'Other'} - ${e.description}`)
				.join('\n');
			expenseContext = `\nRecent expenses:\n${expenseSummary}`;
		}

		// Use Gemini AI for response with context
		let response = 'I apologize, but I\'m unable to process your request right now.';
		try {
			const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
			
			const prompt = `You are a helpful personal finance assistant. You help users track expenses, understand their spending, and provide budgeting advice.

User's recent expenses:${expenseContext || ' None'}
User message: "${trimmedMessage}"
Provide a helpful, concise response (2-3 sentences max). Focus on practical advice related to:
- Expense tracking
- Spending patterns
- Budget management
- Saving tips
- Category organization
If the user asks something unrelated to finances, politely redirect them to financial topics.`;
			const result = await model.generateContent(prompt);
			response = result.response.text().trim();
			logger.info('✅ [sendMessage] Gemini response generated', { responseLength: response.length });
		} catch (aiError) {
			logger.warn('⚠️  [sendMessage] Gemini failed, using fallback:', aiError.message);
			
			// Fallback responses
			const lower = trimmedMessage.toLowerCase();
			if (lower.includes('expense') || lower.includes('spending') || lower.includes('money')) {
				response = 'I can help you track expenses! You can add new expenses, view insights, and categorize your spending. What would you like to do?';
			} else if (lower.includes('budget') || lower.includes('limit')) {
				response = 'Budgeting helps you control spending. You can set category limits in Settings. Would you like tips on managing your budget?';
			} else if (lower.includes('save') || lower.includes('savings')) {
				response = 'Great! Track your expenses carefully to identify saving opportunities. Look at your spending patterns to find areas where you can cut back.';
			} else if (lower.includes('category') || lower.includes('categories')) {
				response = 'You can organize expenses into categories like Food, Transport, Shopping, etc. This helps you understand where your money goes.';
			} else if (lower.includes('receipt') || lower.includes('ocr')) {
				response = 'You can upload receipt photos and I\'ll automatically extract the amount and category using OCR. This makes tracking super fast!';
			} else {
				response = 'I\'m here to help with expense tracking and budgeting. Ask me about spending patterns, budget management, or how to save money!';
			}
		}

		logger.info('✅ [sendMessage] Response ready', { userId });

		res.status(200).json({
			success: true,
			data: {
				message: response,
				timestamp: new Date().toISOString()
			}
		});
	} catch (error) {
		logger.error('❌ [sendMessage] Error:', error.message);
		res.status(error.statusCode || 500).json({
			success: false,
			error: error.message || 'Failed to process message'
		});
	}
}
/**
 * Get chat history (placeholder for future implementation)
 */
export async function getChatHistory(req, res, next) {
	try {
		const userId = req.user.id;

		// TODO: Implement chat history storage in database
		res.status(200).json({
			success: true,
			data: {
				messages: [],
				userId,
				note: 'Chat history not yet implemented'
			}
		});
	} catch (error) {
		logger.error('Get chat history error:', error);
		next(error);
	}
}
