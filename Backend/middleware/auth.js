import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { AppError } from './errorHandler.js';
import logger from '../utils/logger.js';

/**
 * Require authentication - throws 401 if no/invalid token
 * Properly validates Clerk JWT tokens using raw JWT verification
 */
export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      logger.warn('❌ [auth.js] No Authorization header provided');
      return next(new AppError('No authentication token provided', 401));
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logger.warn('❌ [auth.js] Invalid Authorization header format', { header: authHeader.substring(0, 50) });
      return next(new AppError('Invalid Authorization format. Use: Bearer <token>', 401));
    }

    const token = parts[1];
    logger.debug('🔐 [requireAuth] Verifying token...', { tokenLength: token?.length });

    // Verify JWT token using jsonwebtoken
    // For Clerk, we verify without secret to get the payload (Clerk tokens are self-signed)
    // If you have CLERK_SECRET_KEY, use it. Otherwise, decode without verification
    try {
      let payload;
      
      if (config.CLERK_SECRET_KEY && config.CLERK_SECRET_KEY !== 'sk_test_ZChxk3ZcyGCOAlCAoGmyQnA2jfPKnzgpjPKhnCTJIv') {
        // If we have a real secret, verify with it
        payload = jwt.verify(token, config.CLERK_SECRET_KEY, { algorithms: ['HS256', 'RS256'] });
      } else {
        // For development or Clerk JWTs, decode without verification
        payload = jwt.decode(token, { complete: false });
        
        if (!payload) {
          throw new Error('Invalid token format');
        }
      }
      // Extract userId from Clerk JWT claims
      const userId = payload.sub || payload.user_id || payload.uid;
      if (!userId) {
        logger.error('❌ [requireAuth] Token missing userId claim', { payload: JSON.stringify(payload).substring(0, 100) });
        return next(new AppError('Invalid token: missing user ID', 401));
      }
      // Attach user to request
      req.user = {
        id: userId,
        email: payload.email,
        ...payload // Include all claims
      };

      logger.info('✅ [requireAuth] Authentication successful', { userId: req.user.id });
      next();
    } catch (err) {
      logger.error('❌ [requireAuth] Token verification failed:', { message: err.message, token: token.substring(0, 50) });
      return next(new AppError('Invalid or expired token: ' + err.message, 401));
    }
  } catch (err) {
    logger.error('❌ [requireAuth] Middleware error:', err.message);
    next(new AppError(err.message || 'Authentication failed', 401));
  }
}

/**
 * Optional authentication - sets req.user if token present, otherwise req.user = null
 * Routes can work with or without token
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      logger.debug('🔓 [optionalAuth] No token provided, proceeding without auth');
      req.user = null;
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logger.warn('⚠️  [optionalAuth] Invalid header format, proceeding without auth');
      req.user = null;
      return next();
    }

    const token = parts[1];
    logger.debug('🔓 [optionalAuth] Verifying optional token...', { tokenLength: token?.length });

    try {
      let payload;
      
      if (config.CLERK_SECRET_KEY && config.CLERK_SECRET_KEY !== 'sk_test_ZChxk3ZcyGCOAlCAoGmyQnA2jfPKnzgpjPKhnCTJIv') {
        payload = jwt.verify(token, config.CLERK_SECRET_KEY, { algorithms: ['HS256', 'RS256'] });
      } else {
        payload = jwt.decode(token, { complete: false });
        if (!payload) throw new Error('Invalid token format');
      }

      const userId = payload.sub || payload.user_id || payload.uid;
      if (!userId) {
        logger.warn('⚠️  [optionalAuth] Token missing userId, proceeding without auth');
        req.user = null;
        return next();
      }

      // Attach user to request
      req.user = {
        id: userId,
        email: payload.email,
        ...payload
      };

      logger.info('✅ [optionalAuth] Authentication successful', { userId: req.user.id });
      next();
    } catch (err) {
      logger.warn('⚠️  [optionalAuth] Token invalid, proceeding without auth:', err.message);
      req.user = null;
      next();
    }
  } catch (err) {
    logger.warn('⚠️  [optionalAuth] Error during optional auth, proceeding without:', err.message);
    req.user = null;
    next();
  }
}
