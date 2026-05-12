/**
 * Server Configuration - Initialize notification system
 * Add this to your main server.js file
 */

import express from 'express';
import { initWeeklyDigestJob } from './src/jobs/weeklyDigest.job.js';
import notificationsRouter from './src/routes/notifications.routes.js';
import logger from './src/utils/logger.js';

const app = express();

// ... existing middleware and routes ...

// 1. Register notification routes
app.use('/api/notifications', notificationsRouter);

// 2. Initialize notification jobs (run on server startup)
const initializeNotifications = async () => {
  try {
    logger.info('Initializing notification system...');

    // Initialize weekly digest cron job
    const weeklyDigestJob = initWeeklyDigestJob();

    // Store job reference for graceful shutdown if needed
    app.locals.jobs = {
      weeklyDigest: weeklyDigestJob,
    };

    logger.info('Notification system initialized successfully');
    logger.info('Weekly digest scheduled: Every Sunday at 09:00 UTC');
  } catch (error) {
    logger.error('Failed to initialize notification system', {
      error: error.message,
    });
    // Don't fail server startup if notifications fail
    process.exit(1);
  }
};

// 3. Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);

  // Initialize notifications after server starts
  await initializeNotifications();
});

// 4. Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');

    // Stop cron jobs
    if (app.locals.jobs?.weeklyDigest) {
      app.locals.jobs.weeklyDigest.stop();
      logger.info('Cron jobs stopped');
    }

    process.exit(0);
  });
});

export default app;
