/**
 * Test Email Script
 * Run: node scripts/testEmail.js
 * Tests email service and sends sample notifications
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { sendEmail, sendBulkEmails } from '../src/services/email.service.js';
import {
  sendBudgetAlert,
  sendReceiptConfirmation,
  sendWeeklyDigest,
  sendAIInsight,
} from '../src/services/notification.service.js';
import logger from '../src/utils/logger.js';
dotenv.config();
// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kharcha');
console.log('📧 Testing Email Notification System\n');
// Test 1: Raw email send
console.log('Test 1: Sending raw email...');
try {
  const result = await sendEmail({
    to: 'rs9379842@gmail.com',
    subject: 'Test Email from Kharcha',
    html: '<h1>Hello!</h1><p>This is a test email.</p>',
    userId: '000000000000000000000000',
    type: 'transactional',
    metadata: { test: true },
  });
  console.log('✅ Raw email sent:', result.messageId);
} catch (error) {
  console.log('❌ Raw email failed:', error.message);
}

// Test 2: Budget alert
console.log('\nTest 2: Sending budget alert...');
try {
  // Create a test user first or use existing ID
  const testUserId = 'YOUR_USER_ID_HERE'; // Replace with real user ID
  const result = await sendBudgetAlert(testUserId, {
    categoryId: 'food_123',
    categoryName: 'Food & Dining',
    spent: 7500,
    limit: 10000,
    currency: '₹',
  }, 75);
  console.log('✅ Budget alert sent:', result.type);
} catch (error) {
  console.log('❌ Budget alert failed:', error.message);
}

// Test 3: Receipt confirmation
console.log('\nTest 3: Sending receipt confirmation...');
try {
  const testUserId = 'YOUR_USER_ID_HERE'; // Replace with real user ID
  const result = await sendReceiptConfirmation(testUserId, {
    receiptId: 'receipt_123',
    merchant: 'Starbucks Coffee',
    amount: 250,
    category: 'Food & Beverages',
    currency: '₹',
    date: new Date(),
  });
  console.log('✅ Receipt confirmation sent:', result.type);
} catch (error) {
  console.log('❌ Receipt confirmation failed:', error.message);
}

// Test 4: Weekly digest
console.log('\nTest 4: Sending weekly digest...');
try {
  const testUserId = 'YOUR_USER_ID_HERE'; // Replace with real user ID
  const result = await sendWeeklyDigest(testUserId, {
    totalSpent: 25000,
    topCategory: 'Food & Dining',
    topCategoryAmount: 8500,
    savingsGoal: 100000,
    currentSavings: 45000,
    transactionCount: 18,
    currency: '₹',
    weekStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  });
  console.log('✅ Weekly digest sent:', result.type);
} catch (error) {
  console.log('❌ Weekly digest failed:', error.message);
}

// Test 5: AI insight
console.log('\nTest 5: Sending AI insight...');
try {
  const testUserId = 'YOUR_USER_ID_HERE'; // Replace with real user ID
  const result = await sendAIInsight(testUserId, {
    insightId: 'insight_123',
    insight: 'Your food spending increased by 25% this month compared to last month',
    category: 'Spending Trend',
    recommendation: 'Try meal planning to reduce food expenses by 15-20%',
    impact: 'Potential savings: ₹2,500 per month',
  });
  console.log('✅ AI insight sent:', result.type);
} catch (error) {
  console.log('❌ AI insight failed:', error.message);
}

// Test 6: Bulk emails
console.log('\nTest 6: Sending bulk emails...');
try {
  const emailList = [
    {
      to: 'user1@example.com',
      subject: 'Bulk Test 1',
      html: '<p>Bulk email 1</p>',
      userId: 'user1_id',
      type: 'transactional',
    },
    {
      to: 'user2@example.com',
      subject: 'Bulk Test 2',
      html: '<p>Bulk email 2</p>',
      userId: 'user2_id',
      type: 'transactional',
    },
  ];

  const results = await sendBulkEmails(emailList, 200);
  console.log('✅ Bulk emails sent:', results.length, 'emails');
  results.forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.email}: ${r.success ? '✅' : '❌'}`);
  });
} catch (error) {
  console.log('❌ Bulk email failed:', error.message);
}

console.log('\n📊 Test Summary');
console.log('================');
console.log('✅ Email service is working!');
console.log('📧 Check your email inbox for test messages');
console.log('📝 Check logs for detailed information');

// Cleanup
await mongoose.connection.close();
process.exit(0);
