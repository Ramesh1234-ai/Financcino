import express from 'express';
import * as chatbotController from '../controllers/chatbot.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All chatbot routes require authentication
router.use(authenticateToken);

/**
 * POST /api/chat
 * Send a message to the chatbot
 */
router.post('/', chatbotController.sendMessage);

/**
 * GET /api/chat/history
 * Get chat history for the authenticated user
 */
router.get('/history', chatbotController.getChatHistory);

export default router;
