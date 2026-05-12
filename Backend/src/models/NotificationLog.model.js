/**
 * Notification Log Model - Tracks all sent emails
 * Used for audit, debugging, and analytics
 */

import mongoose from 'mongoose';

const notificationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'budget_alert_75',
        'budget_alert_100',
        'receipt_confirmation',
        'weekly_digest',
        'ai_insight',
        'transactional',
      ],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'bounced', 'unsubscribed'],
      default: 'sent',
      index: true,
    },
    messageId: {
      type: String,
      unique: true,
      sparse: true,
    },
    error: String,
    metadata: mongoose.Schema.Types.Mixed,
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    openedAt: Date,
    clickedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
notificationLogSchema.index({ userId: 1, sentAt: -1 });
notificationLogSchema.index({ userId: 1, type: 1, sentAt: -1 });

// TTL index - automatically delete logs after 90 days
notificationLogSchema.index({ sentAt: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model('NotificationLog', notificationLogSchema);
