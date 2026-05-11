// Backend/routes/webhooks.routes.js
import express from 'express';
import { Webhook } from 'svix';
import { User } from '../models/User.models.js';
import logger from '../utils/logger.js';
import { config } from '../config/config.js';
const router = express.Router();
/**
 * Clerk Webhook Handler
 * Syncs Clerk users to MongoDB when they sign up, update profile, or delete account
 * 
 * Setup Instructions:
 * 1. Go to https://dashboard.clerk.com/last-active?path=webhooks
 * 2. Create a new webhook with URL: https://kharcha-api.vercel.app/api/webhooks/clerk
 * 3. Subscribe to events: user.created, user.updated, user.deleted
 * 4. Copy the signing secret and set CLERK_WEBHOOK_SECRET env variable
 */

// Webhook signature verification middleware
function verifyClerkWebhook(req, res, next) {
  const svixId = req.headers['svix-id'];
  const svixTimestamp = req.headers['svix-timestamp'];
  const svixSignature = req.headers['svix-signature'];
  const webhookSecret = config.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.warn('CLERK_WEBHOOK_SECRET not configured - webhook verification skipped');
    // Parse body if it's raw
    if (Buffer.isBuffer(req.body)) {
      req.body = JSON.parse(req.body.toString());
    }
    return next();
  }

  if (!svixId || !svixTimestamp || !svixSignature) {
    logger.warn('Missing webhook signature headers');
    return res.status(400).json({ error: 'Missing webhook headers' });
  }

  try {
    const wh = new Webhook(webhookSecret);
    // Handle both Buffer and string body
    const bodyString = Buffer.isBuffer(req.body) 
      ? req.body.toString('utf8') 
      : JSON.stringify(req.body);
    
    const evt = wh.verify(bodyString, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
    req.clerkEvent = evt;
    // Parse body for use in route handler
    if (Buffer.isBuffer(req.body)) {
      req.body = JSON.parse(req.body.toString());
    }
    next();
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message);
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
}
// Apply webhook verification middleware
router.use(verifyClerkWebhook);

/**
 * Handle user.created event
 * Syncs new Clerk users to MongoDB
 */
router.post('/clerk', async (req, res) => {
  try {
    const event = req.clerkEvent || req.body;
    const eventType = event.type;

    logger.info(`[Clerk Webhook] ✅ Received event type: ${eventType}`);

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = event.data;

      const email = email_addresses?.[0]?.email_address;
      if (!email) {
        logger.warn(`[Clerk Webhook] ⚠️ No email found for user ${id}`);
        return res.json({ received: true });
      }

      // Check if user already exists
      let user = await User.findOne({ clerkId: id });

      if (user) {
        logger.info(`[Clerk Webhook] ℹ️ User already synced: ${id}`);
        return res.json({ received: true });
      }

      // Create new user in MongoDB
      const fullName = `${first_name || ''} ${last_name || ''}`.trim() || 'New User';
      const username = email.split('@')[0].toLowerCase();

      user = await User.create({
        clerkId: id,
        email: email.toLowerCase(),
        fullName,
        username,
        createdAt: new Date(),
      });

      logger.info(`[Clerk Webhook] ✨ New user synced to MongoDB: ${id} (${email}) - Total users: ${await User.countDocuments()}`);
      return res.json({ received: true, userId: user._id });
    }
    if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = event.data;
      const email = email_addresses?.[0]?.email_address;
      if (!email) {
        return res.json({ received: true });
      }
      // Update user in MongoDB
      const fullName = `${first_name || ''} ${last_name || ''}`.trim() || 'User';
      const user = await User.findOneAndUpdate(
        { clerkId: id },
        {
          email: email.toLowerCase(),
          fullName,
        },
        { new: true }
      );
      if (user) {
        logger.info(`[Clerk Webhook] User updated in MongoDB: ${id}`);
      } else {
        logger.warn(`[Clerk Webhook] User not found for update: ${id}`);
      }
      return res.json({ received: true });
    }
    if (eventType === 'user.deleted') {
      const { id } = event.data;
      // Delete user from MongoDB (optional - you might want to keep records)
      const result = await User.findOneAndDelete({ clerkId: id });
      if (result) {
        logger.info(`[Clerk Webhook] User deleted from MongoDB: ${id}`);
      } else {
        logger.warn(`[Clerk Webhook] User not found for deletion: ${id}`);
      }
      return res.json({ received: true });
    }
    // Acknowledge other events without processing
    return res.json({ received: true });
  } catch (error) {
    logger.error('[Clerk Webhook] Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
export default router;
