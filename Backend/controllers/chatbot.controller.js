import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Simple chatbot response handler
 * In production, integrate with Claude, ChatGPT, or similar
 */
export async function sendMessage(req, res, next) {
	try {
		const { message } = req.body;
		const userId = req.userId;

		if (!message || typeof message !== 'string' || !message.trim()) {
			throw new AppError('Message is required', 400);
		}

		const trimmedMessage = message.trim().toLowerCase();

		// Simple pattern-based responses for expense-related queries
		let response = '';

		if (trimmedMessage.includes('expense') || trimmedMessage.includes('spending')) {
			response = 'I can help you track expenses! Would you like to add a new expense or view your spending insights?';
		} else if (trimmedMessage.includes('budget')) {
			response = 'You can set monthly budgets for different categories in the Settings section. I can help you stay within your budget!';
		} else if (trimmedMessage.includes('category') || trimmedMessage.includes('categories')) {
			response = 'You can organize expenses by categories like Food, Transportation, Entertainment, etc. This helps you understand where your money goes.';
		} else if (trimmedMessage.includes('receipt') || trimmedMessage.includes('upload')) {
			response = 'You can upload receipt images to automatically extract expense details using OCR technology!';
		} else if (trimmedMessage.includes('analytics') || trimmedMessage.includes('report')) {
			response = 'Check the Analytics section to see detailed reports of your spending patterns, trends, and insights.';
		} else if (trimmedMessage.includes('help') || trimmedMessage.includes('how')) {
			response = 'I can help you with expense tracking, budgeting, receipts, and analytics. What would you like to know more about?';
		} else {
			response = 'Great question! I can assist with expense tracking, budgeting advice, receipt uploads, and spending analytics. What would you like help with?';
		}

		logger.info('Chat message processed', {
			userId,
			messageLength: message.length,
			responseLength: response.length
		});

		res.status(200).json({
			success: true,
			data: {
				message: response,
				timestamp: new Date().toISOString()
			}
		});
	} catch (error) {
		logger.error('Chat error:', error);
		next(error);
	}
}

/**
 * Get chat history (placeholder for future implementation)
 */
export async function getChatHistory(req, res, next) {
	try {
		const userId = req.userId;

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
