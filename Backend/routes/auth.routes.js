// Backend/routes/auth.routes.js
import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
const router = express.Router();
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.getCurrentUser);
router.post('/refresh', authController.refreshToken);
export default router;
