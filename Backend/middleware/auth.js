// Backend/middleware/auth.js
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { AppError } from './errorHandler.js';

export function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('No authentication token provided', 401);
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      req.userId = decoded.id;
      next();
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid token', 401);
      } else if (err instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expired', 401);
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
}
