// Backend/middleware/requestLogger.js
import logger from '../utils/logger.js';
export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.userId,
      ip: req.ip,
    });
  });
  next();
}
