/**
 * Email Service - Handles all email communication via Resend
 * Production-ready with error handling, retries, and logging
 */

import { Resend } from 'resend';
import logger from '../../utils/logger.js';
import NotificationLog from '../../models/NotificationLog.model.js';

// Lazy-initialized Resend client
let resend = null;

// Initialize Resend client lazily on first use
const getResendClient = () => {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Missing RESEND_API_KEY environment variable. ' +
        'Get your API key from https://resend.com/api-keys and add it to .env file'
      );
    }
    resend = new Resend(apiKey);
  }
  return resend;
};
// Configuration
const EMAIL_CONFIG = {
  FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'noreply@resend.dev',
  FROM_NAME: process.env.RESEND_FROM_NAME || 'Kharcha Finance',
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 5000, // 5 seconds
};

/**
 * Send email with built-in retry logic and logging
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.userId - User ID for logging
 * @param {string} options.type - Email type (budget_alert, receipt, digest, etc)
 * @param {Object} options.metadata - Additional metadata
 * @returns {Promise<Object>} - Result with messageId or error
 */
export const sendEmail = async (options) => {
  const {
    to,
    subject,
    html,
    userId,
    type = 'transactional',
    metadata = {},
  } = options;

  // Validation
  if (!to || !subject || !html) {
    logger.error('Email validation failed', { to, subject, type });
    throw new Error('Missing required email fields: to, subject, html');
  }

  let lastError = null;
  let attempt = 0;

  // Retry logic
  while (attempt < EMAIL_CONFIG.RETRY_ATTEMPTS) {
    try {
      attempt++;
      logger.info(`Sending email (attempt ${attempt}/${EMAIL_CONFIG.RETRY_ATTEMPTS})`, {
        to,
        type,
        userId,
      });

      const client = getResendClient();
      const response = await client.emails.send({
        from: `${EMAIL_CONFIG.FROM_NAME} <${EMAIL_CONFIG.FROM_EMAIL}>`,
        to,
        subject,
        html,
        headers: {
          'X-Entity-Ref-ID': `${userId}-${Date.now()}`,
        },
      });

      // Log successful send
      await logEmailSend({
        userId,
        to,
        subject,
        type,
        status: 'sent',
        messageId: response.id,
        metadata,
      });

      logger.info('Email sent successfully', {
        to,
        type,
        messageId: response.id,
      });

      return {
        success: true,
        messageId: response.id,
        attempt,
      };
    } catch (error) {
      lastError = error;
      logger.warn(`Email send failed (attempt ${attempt})`, {
        to,
        type,
        error: error.message,
      });

      // Don't retry on client errors (4xx)
      if (error.status && error.status >= 400 && error.status < 500) {
        break;
      }

      // Wait before retry
      if (attempt < EMAIL_CONFIG.RETRY_ATTEMPTS) {
        await new Promise((resolve) =>
          setTimeout(resolve, EMAIL_CONFIG.RETRY_DELAY * attempt)
        );
      }
    }
  }

  // All retries failed
  logger.error('Email send failed after all retries', {
    to,
    type,
    error: lastError?.message,
  });

  // Log failed send
  await logEmailSend({
    userId,
    to,
    subject,
    type,
    status: 'failed',
    error: lastError?.message,
    metadata,
  }).catch((err) =>
    logger.error('Failed to log email failure', { error: err.message })
  );

  throw new Error(`Failed to send email after ${EMAIL_CONFIG.RETRY_ATTEMPTS} attempts`);
};

/**
 * Send bulk emails with rate limiting
 * @param {Array} emailList - Array of email options
 * @param {number} delayMs - Delay between emails (ms)
 * @returns {Promise<Array>} - Results for each email
 */
export const sendBulkEmails = async (emailList, delayMs = 100) => {
  const results = [];

  for (let i = 0; i < emailList.length; i++) {
    try {
      const result = await sendEmail(emailList[i]);
      results.push({ ...result, email: emailList[i].to });
    } catch (error) {
      results.push({
        success: false,
        email: emailList[i].to,
        error: error.message,
      });
    }

    // Rate limiting delay
    if (i < emailList.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
};

/**
 * Log email send to database
 * @private
 */
const logEmailSend = async (data) => {
  try {
    await NotificationLog.create({
      userId: data.userId,
      recipientEmail: data.to,
      subject: data.subject,
      type: data.type,
      status: data.status,
      messageId: data.messageId,
      error: data.error,
      metadata: data.metadata || {},
      sentAt: new Date(),
    });
  } catch (error) {
    logger.error('Failed to log email', { error: error.message });
    // Don't throw - logging failure shouldn't break the flow
  }
};

/**
 * Get email sending history for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of records to fetch
 */
export const getEmailHistory = async (userId, limit = 50) => {
  try {
    return await NotificationLog.find({ userId })
      .sort({ sentAt: -1 })
      .limit(limit);
  } catch (error) {
    logger.error('Failed to fetch email history', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get email statistics
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 */
export const getEmailStats = async (userId, startDate, endDate) => {
  try {
    const stats = await NotificationLog.aggregate([
      {
        $match: {
          userId,
          sentAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] },
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
        },
      },
    ]);

    return stats;
  } catch (error) {
    logger.error('Failed to get email stats', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

export default {
  sendEmail,
  sendBulkEmails,
  getEmailHistory,
  getEmailStats,
};
