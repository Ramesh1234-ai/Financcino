/**
 * Receipt Controller Integration - Send confirmation emails
 * Add this to your existing receipts.controller.js after OCR processing
 */

import Receipt from '../models/Receipt.models.js';
import { sendReceiptConfirmation } from '../services/notification.service.js';
import logger from '../utils/logger.js';

/**
 * Process receipt OCR and send confirmation email
 * Call this after successful OCR processing
 */
export const processReceiptWithNotification = async (req, res) => {
  try {
    const { userId, fileUrl, ocrData } = req.body;

    // Validate OCR data
    if (!ocrData || !ocrData.amount) {
      return res.status(400).json({
        success: false,
        message: 'OCR processing failed or missing amount',
      });
    }

    // Create receipt record
    const receipt = new Receipt({
      userId,
      fileUrl,
      extractedData: {
        merchant: ocrData.merchant || 'Unknown',
        amount: parseFloat(ocrData.amount),
        category: ocrData.category || 'Other',
        date: ocrData.date || new Date(),
        items: ocrData.items || [],
        tax: ocrData.tax || 0,
      },
      isProcessed: true,
      processedAt: new Date(),
    });

    await receipt.save();

    logger.info('Receipt processed', {
      userId,
      receiptId: receipt._id,
      amount: ocrData.amount,
    });

    // IMPORTANT: Send confirmation email to user
    let emailResult = null;
    try {
      emailResult = await sendReceiptConfirmation(userId, {
        receiptId: receipt._id,
        merchant: ocrData.merchant || 'Store',
        amount: parseFloat(ocrData.amount),
        category: ocrData.category || 'Other',
        date: ocrData.date || new Date(),
        currency: '₹',
      });

      logger.info('Receipt confirmation email sent', {
        userId,
        receiptId: receipt._id,
      });
    } catch (emailError) {
      logger.error('Failed to send receipt confirmation (non-blocking)', {
        userId,
        error: emailError.message,
      });
      // Don't fail the receipt creation if email fails
    }

    res.status(201).json({
      success: true,
      data: receipt,
      emailSent: emailResult?.sent || false,
      message: 'Receipt processed successfully',
    });
  } catch (error) {
    logger.error('Failed to process receipt', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to process receipt',
      error: error.message,
    });
  }
};

export default {
  processReceiptWithNotification,
};
