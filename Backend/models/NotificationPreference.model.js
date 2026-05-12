/**
 * Notification Preference Model - User's notification settings
 * Allows users to customize which notifications they receive
 */

import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    // Budget alerts
    budgetAlerts75: {
      type: Boolean,
      default: true,
      description: 'Notify when spending reaches 75% of budget',
    },
    budgetAlerts100: {
      type: Boolean,
      default: true,
      description: 'Notify when spending exceeds 100% of budget',
    },
    // Receipt notifications
    receiptConfirmation: {
      type: Boolean,
      default: true,
      description: 'Notify after successful receipt upload and OCR',
    },
    // Weekly summary
    weeklyDigest: {
      type: Boolean,
      default: true,
      description: 'Send weekly spending summary (Sunday)',
    },
    weeklyDigestTime: {
      type: String,
      default: '09:00',
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      description: 'Time to send weekly digest (HH:MM format)',
    },
    // AI insights
    aiInsight: {
      type: Boolean,
      default: true,
      description: 'Notify when new AI-generated insights available',
    },
    // General settings
    emailFrequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly', 'monthly'],
      default: 'immediate',
    },
    unsubscribeToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Email suppression
    suppressionReason: {
      type: String,
      enum: ['user_request', 'hard_bounce', 'complaint', 'manual'],
    },
    suppressedAt: Date,
    // Activity tracking
    lastEmailSent: Date,
    lastEmailOpened: Date,
    emailOpenRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('NotificationPreference', notificationPreferenceSchema);
