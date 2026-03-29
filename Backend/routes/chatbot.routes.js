import express from 'express';
import * as chatbotController from '../controllers/chatbot.controller.js';
import { requireAuth } from '../middleware/auth.js';
const router = express.Router();
// All chatbot routes require authentication
router.use(requireAuth);
/**
 * POST /api/chat
 * Send a message to the chatbot
 */
router.post('/send', chatbotController.sendMessage);
/**
 * GET /api/chat/history
 * Get chat history for the authenticated user
 */
router.get('/history', chatbotController.getChatHistory);
export default router;
