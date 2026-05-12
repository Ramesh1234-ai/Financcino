/**
 * Advanced: Bull Queue Integration (Optional)
 * Use for high-volume or mission-critical emails
 * Provides persistent job queue with retry capabilities
 */

import Queue from 'bull';
import redis from 'redis';
import logger from '../utils/logger.js';
import { sendEmail } from './email.service.js';

// Create Redis connection
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  db: process.env.REDIS_DB || 0,
});

// Create email queue
export const emailQueue = new Queue('email', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
  },
});

/**
 * Queue email job instead of sending immediately
 * Useful for high-volume scenarios
 */
export const queueEmail = async (emailData) => {
  try {
    const job = await emailQueue.add(emailData, {
      priority: emailData.priority || 5,
      delay: emailData.delay || 0,
    });

    logger.info('Email queued', {
      jobId: job.id,
      to: emailData.to,
      type: emailData.type,
    });

    return job;
  } catch (error) {
    logger.error('Failed to queue email', {
      error: error.message,
      to: emailData.to,
    });
    throw error;
  }
};

/**
 * Process email queue
 * Run this in a separate worker process
 */
export const processEmailQueue = () => {
  emailQueue.process(10, async (job) => {
    try {
      logger.info('Processing email job', {
        jobId: job.id,
        to: job.data.to,
      });

      const result = await sendEmail(job.data);

      logger.info('Email job completed', {
        jobId: job.id,
        messageId: result.messageId,
      });

      return result;
    } catch (error) {
      logger.error('Email job failed', {
        jobId: job.id,
        attempt: job.attemptsMade,
        error: error.message,
      });

      throw error; // Will retry based on attempts config
    }
  });

  // Event handlers
  emailQueue.on('completed', (job) => {
    logger.info('Email job completed', { jobId: job.id });
  });

  emailQueue.on('failed', (job, error) => {
    logger.error('Email job permanently failed', {
      jobId: job.id,
      attempts: job.attemptsMade,
      error: error.message,
    });
  });

  emailQueue.on('error', (error) => {
    logger.error('Email queue error', { error: error.message });
  });

  logger.info('Email queue processor started');
};

/**
 * Get queue statistics
 */
export const getQueueStats = async () => {
  try {
    const counts = await emailQueue.getJobCounts();
    const failed = await emailQueue.getFailed();

    return {
      active: counts.active,
      waiting: counts.waiting,
      completed: counts.completed,
      failed: counts.failed,
      delayed: counts.delayed,
      recentFailures: failed.slice(0, 10),
    };
  } catch (error) {
    logger.error('Failed to get queue stats', { error: error.message });
    throw error;
  }
};

/**
 * Retry failed jobs
 */
export const retryFailedJobs = async () => {
  try {
    const failed = await emailQueue.getFailed();

    for (const job of failed) {
      try {
        await job.retry();
        logger.info('Job retry queued', { jobId: job.id });
      } catch (error) {
        logger.error('Failed to retry job', {
          jobId: job.id,
          error: error.message,
        });
      }
    }

    return { retriedCount: failed.length };
  } catch (error) {
    logger.error('Failed to retry jobs', { error: error.message });
    throw error;
  }
};

export default {
  emailQueue,
  queueEmail,
  processEmailQueue,
  getQueueStats,
  retryFailedJobs,
};
