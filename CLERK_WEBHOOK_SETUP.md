## **FIX: Sync Clerk Users to MongoDB for Social Proof**

### **The Problem**
- Clerk creates users on their platform ✅
- But those users are **NOT** automatically saved to your MongoDB ❌
- Social proof endpoint returns `totalUsers: 0` because MongoDB is empty

### **The Solution Implemented**

I've created a **Clerk webhook** that automatically syncs users to MongoDB when they sign up/update profile/delete account.

---

## **Setup Instructions**

### **Step 1: Install Dependencies**
```bash
cd Backend
npm install svix
```

### **Step 2: Get Your Clerk Webhook Secret**

1. Go to **Clerk Dashboard**: https://dashboard.clerk.com
2. Navigate to **Webhooks** (in left sidebar)
3. Click **Create** new webhook
4. Enter your webhook URL:
   - **Local**: `http://localhost:3000/api/webhooks/clerk`
   - **Production**: `https://yourdomain.com/api/webhooks/clerk`
5. Subscribe to these events:
   - ✅ `user.created` - Sync when user signs up
   - ✅ `user.updated` - Sync profile updates
   - ✅ `user.deleted` - Remove when user deletes account
6. After creating, copy the **Signing Secret**

### **Step 3: Set Environment Variable**

Add to your `.env` file:
```env
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### **Step 4: Restart Your Backend**
```bash
npm run dev
```

---

## **How It Works**

```
User Signs Up with Clerk
    ↓
Clerk sends webhook event to /api/webhooks/clerk
    ↓
Backend verifies webhook signature (using svix)
    ↓
User data extracted from Clerk
    ↓
User saved to MongoDB with clerkId
    ↓
Social proof endpoint now counts real users! ✅
```

---

## **What Changed**

### **Frontend** (LandingPage.jsx)
- ✅ Social proof now fetches `/api/public/stats`
- ✅ Shows loading state (`"..."`) while fetching
- ✅ Dynamic star rating based on actual data

### **Backend** (New Files)
1. **routes/webhooks.routes.js** - Clerk webhook handler
2. **routes/public.routes.js** - Updated to show total users + placeholder logic

### **Backend** (Modified Files)
1. **models/User.models.js** - Added `clerkId` field
2. **config/config.js** - Added `CLERK_WEBHOOK_SECRET`
3. **server.js** - Registered webhook routes + raw body middleware
4. **package.json** - Added `svix` dependency

---

## **Testing**

### **Test Locally**
1. Use a tool like **ngrok** to expose your local backend:
   ```bash
   ngrok http 3000
   ```
2. Update Clerk webhook URL to your ngrok URL
3. Sign up a new user in your app
4. Check MongoDB - user should appear!
5. Visit `/api/public/stats` - should show real user count

### **Test in Production**
1. Deploy backend changes
2. Update Clerk webhook URL to production domain
3. Existing Clerk users won't sync (they were created before webhook)
4. **New users** will automatically sync when they sign up
5. Social proof will update in real-time!

---

## **Troubleshooting**

### **Webhook not triggering?**
- Check Clerk Dashboard > Webhooks > Event Log
- Verify webhook URL is correct and accessible
- Check firewall isn't blocking incoming webhooks

### **Users not appearing in MongoDB?**
- Check Backend logs for webhook errors
- Verify `CLERK_WEBHOOK_SECRET` is set correctly
- Check MongoDB connection is working

### **Still showing 0 users?**
- Manually test: `curl http://localhost:3000/api/public/stats`
- Check MongoDB directly for users with `clerkId`
- Verify webhook secret matches Clerk dashboard

---

## **Sync Existing Clerk Users (Manual)**

If you already have Clerk users before setting up webhooks, manually sync them:

```bash
# Add this script to Backend/ to sync existing users from Clerk
# You'll need to use Clerk Admin SDK to fetch all users and save them
```

---

## **Next Steps**

1. ✅ Install svix: `npm install svix`
2. ✅ Add `CLERK_WEBHOOK_SECRET` to `.env`
3. ✅ Configure webhook in Clerk Dashboard
4. ✅ Restart backend: `npm run dev`
5. ✅ Test with new user signup
6. ✅ Verify social proof updates in real-time

**Now your landing page will show real user counts!** 🎉
