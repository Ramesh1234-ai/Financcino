/**
 * EMAIL ALERTS - IMPLEMENTATION VERIFICATION & TROUBLESHOOTING GUIDE
 * 
 * This guide walks through verifying that all fixes are correctly implemented
 * and provides debugging steps if emails still aren't being sent.
 */

// ============================================================================
// SECTION 1: VERIFICATION CHECKLIST
// ============================================================================
const VERIFICATION_STEPS = `
✅ STEP 1: Verify Environment Variables Are Set
   Command to check:
   $ grep RESEND Backend/.env
   Expected output:
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   RESEND_FROM_EMAIL=noreply@resend.dev (or your domain)
   FRONTEND_URL=http://localhost:5173
   
   ⚠️ If not found:
      - Add these to Backend/.env
      - Restart the server
      - Check: node -e "console.log(process.env.RESEND_API_KEY)" in Backend/

✅ STEP 2: Verify Budget Alert Job Imported in Expense Controller

   Command to check:
   $ grep "checkBudgetThresholds" Backend/controllers/expense.controller.js
   
   Expected output:
   import { checkBudgetThresholds } from '../jobs/budgetAlert.job.js';
   
   ⚠️ If not found:
      - The import is missing
      - Add it at the top of the file with other imports

✅ STEP 3: Verify Budget Check Called After Expense Creation

   Command to check:
   $ grep -A 5 "TRIGGER BUDGET CHECK" Backend/controllers/expense.controller.js
   
   Expected output:
   // ==================== TRIGGER BUDGET CHECK ====================
   // Check if expense triggers budget alerts
   if (process.env.BUDGET_ALERTS_ENABLED !== 'false') {
     try {
       checkBudgetThresholds(req.user.id, expense._id)
   
   ⚠️ If not found:
      - The budget check call is missing
      - Add it to the createExpense function

✅ STEP 4: Verify Cron Job Initialized in Server

   Command to check:
   $ grep -B 2 -A 2 "initWeeklyDigestJob" Backend/server.js
   
   Expected output:
   import { initWeeklyDigestJob } from './src/jobs/weeklyDigest.job.js';
   ...
   initWeeklyDigestJob();
   
   ⚠️ If not found:
      - Cron job is not initialized
      - Add the import and call in startServer()

✅ STEP 5: Verify Models Are Using Correct Imports

   Command to check:
   $ head -10 Backend/src/jobs/budgetAlert.job.js
   
   Expected output:
   import Expense from '../../models/expense.models.js';
   (NOT: import Transaction from '../../models/Transaction.models.js';)
   
   ⚠️ If Transaction is used:
      - Models are mismatched
      - Change to Expense model

✅ STEP 6: Test Email Service Configuration

   Create a test file: Backend/test-email-config.js
   
   const config = {
     apiKey: process.env.RESEND_API_KEY,
     fromEmail: process.env.RESEND_FROM_EMAIL,
     frontendUrl: process.env.FRONTEND_URL,
   };
   console.log('Email Config:', config);
   
   Run:
   $ node Backend/test-email-config.js
   
   Expected:
   - RESEND_API_KEY is set (not undefined)
   - RESEND_FROM_EMAIL is set
   - FRONTEND_URL is set
`;

console.log(VERIFICATION_STEPS);


// ============================================================================
// SECTION 2: END-TO-END TEST SCRIPT
// ============================================================================

const TEST_SCRIPT = `
🧪 COMPLETE END-TO-END TEST

Prerequisites:
  ✓ Resend account with API key
  ✓ Verified email in Resend (domain or noreply@resend.dev)
  ✓ Valid user in MongoDB with email address
  ✓ Budget created for that user (75% will trigger alert)

TEST FLOW:

1️⃣ Get a valid user ID:
   db.users.findOne({email: "test@example.com"})
   Copy the _id field

2️⃣ Create a budget for that user (via API):
   POST http://localhost:3000/api/budgets
   Body: {
     "categoryId": "<category-id>",
     "budgetLimit": 1000,
     "period": "monthly"
   }
   
   ✓ Should return 201 with budget data

3️⃣ Create an expense that's 80% of budget:
   POST http://localhost:3000/api/expenses
   Body: {
     "description": "Test expense for budget alert",
     "amount": 800,
     "categoryId": "<category-id>",
     "date": "2026-05-12"
   }
   
   ✓ Should return 201 quickly
   ✓ Check server logs for "Budget alert processed"

4️⃣ Check if email was sent:
   db.notificationlogs.findOne({type: "budget_alert_75"})
   
   ✓ Should find a record with status: "sent"
   ✓ Check user's email inbox (or spam folder)

5️⃣ Check server logs for errors:
   Look for entries like:
   - "Budget alert processed" ✓ (success)
   - "Budget alert notification disabled" ⚠️ (user disabled it)
   - "Budget check failed" ❌ (error occurred)
   - "Failed to send budget alert" ❌ (email failed)
   
   If you see errors, note the exact error message

6️⃣ Verify notification preferences:
   db.notificationpreferences.findOne({userId: ObjectId("<user-id>")})
   
   Expected:
   {
     budgetAlerts75: true,
     budgetAlerts100: true,
     ...
   }
   
   If budgetAlerts75 is false, user has disabled this notification
`;

console.log(TEST_SCRIPT);


// ============================================================================
// SECTION 3: COMMON ISSUES & SOLUTIONS
// ============================================================================

const TROUBLESHOOTING = `
❌ ISSUE #1: "Cannot find module 'budgetAlert.job.js'"

Cause: Import path is wrong

Solution:
   In expense.controller.js, check the import:
   import { checkBudgetThresholds } from '../jobs/budgetAlert.job.js';
   
   vs 
   
   import { checkBudgetThresholds } from '../src/jobs/budgetAlert.job.js';
   
   (Depends on where budgetAlert.job.js actually is)

---

❌ ISSUE #2: "RESEND_API_KEY is undefined"

Cause: Environment variable not set or not loaded

Solution:
   1. Open Backend/.env
   2. Add: RESEND_API_KEY=re_xxxxxxxxxxxxx
   3. Restart server with: npm start
   4. Verify with: console.log(process.env.RESEND_API_KEY)

---

❌ ISSUE #3: Email sent but not received

Cause: Domain not verified or going to spam

Solution:
   For noreply@resend.dev:
   - This is Resend's sandbox domain - emails might go to spam
   - Add domain verification in Resend dashboard for production

   For custom domain:
   - Go to Resend dashboard → Domains
   - Copy SPF and DKIM records
   - Add to your domain's DNS settings
   - Wait 24-48 hours for propagation
   - Rescan in Resend dashboard

   Check spam folder:
   - Email might be in Spam, not Inbox
   - Check email headers for authentication issues

---

❌ ISSUE #4: "Cannot access 'category' before initialization"

Cause: Variable scope error (from receipt uploads)

Solution:
   This should be fixed already, but if you see this error:
   - Go to BrokTok/src/components/dashboard/Uploads.jsx
   - Verify category is declared BEFORE being used
   - Move category extraction to before merchant extraction

---

❌ ISSUE #5: Budget alert not triggering (no email sent)

Cause: Multiple possible reasons

Solution steps (in order):
   1. Verify budget exists: db.budgets.findOne()
   2. Check expense was created: db.expenses.findOne()
   3. Check notification pref: db.notificationpreferences.findOne()
   4. Check logs for "Budget alert processed"
   5. Query notification log: db.notificationlogs.findOne()
   
   If still failing:
   - Check MongoDB indexes
   - Verify categoryId in expense matches budget
   - Check date range for budget period calculation

---

❌ ISSUE #6: "sendEmail is not a function"

Cause: Email service not properly exported or imported

Solution:
   In notification.service.js:
   export { sendEmail, ... }
   
   or
   
   export default { sendEmail, ... }
   
   Then import correctly in budgetAlert.job.js:
   import { sendEmail } from '../services/email.service.js';

---

❌ ISSUE #7: Server crashes when initializing cron job

Cause: node-cron not installed or cron syntax error

Solution:
   1. Install node-cron:
      $ npm install node-cron
   
   2. Verify import in weeklyDigest.job.js:
      import cron from 'node-cron';
   
   3. Check cron schedule syntax in initWeeklyDigestJob()
      Should be: '0 9 * * 0' (Sunday at 9 AM UTC)

`;

console.log(TROUBLESHOOTING);


// ============================================================================
// SECTION 4: DIAGNOSTIC COMMANDS
// ============================================================================

const DIAGNOSTIC_COMMANDS = `
🔍 DIAGNOSTIC COMMANDS

Database queries:

$ mongo  # Connect to MongoDB
> use sinharizz  # Your database

# Check if users exist
> db.users.find().limit(1)

# Check budgets
> db.budgets.find()

# Check if expenses exist
> db.expenses.find()

# Check notification preferences
> db.notificationpreferences.find()

# Check notification logs (most recent)
> db.notificationlogs.find().sort({sentAt: -1}).limit(5)

# Get stats on email sending
> db.notificationlogs.aggregate([
  { $group: { _id: "$type", count: { $sum: 1 }, 
              success: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
              failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } }
            }
  }
])


Server diagnostics:

$ npm list resend        # Check if Resend is installed
$ npm list node-cron     # Check if node-cron is installed

$ node -e "console.log(process.env.RESEND_API_KEY)"  # Check env var

$ grep -r "checkBudgetThresholds" Backend/  # Find all references

$ grep -r "initWeeklyDigestJob" Backend/    # Find job initialization


API test (using curl or Postman):

# Create test expense that triggers budget alert
POST http://localhost:3000/api/expenses
Headers: Authorization: Bearer <your-token>
Body: {
  "description": "Test alert expense",
  "amount": 800,
  "categoryId": "<id>",
  "date": "2026-05-12"
}

# Check server response and logs
`;

console.log(DIAGNOSTIC_COMMANDS);


// ============================================================================
// SECTION 5: RESEND SETUP GUIDE
// ============================================================================

const RESEND_SETUP = `
🚀 RESEND CONFIGURATION - COMPLETE SETUP

Step 1: Create Resend Account
   1. Go to https://resend.com
   2. Sign up with email
   3. Verify email
   4. Dashboard will appear

Step 2: Get API Key
   1. Click "API Keys" in sidebar
   2. Copy the API key that starts with 're_'
   3. Add to Backend/.env:
      RESEND_API_KEY=re_xxxxxxxxxxxx
   4. Save file

Step 3: Configure Sender Email (Option A - Sandbox)
   
   For testing (fastest):
   1. In Resend dashboard, use default domain
   2. Add to Backend/.env:
      RESEND_FROM_EMAIL=noreply@resend.dev
   3. Emails will be sent from this address
   
   ⚠️ Note: Sandbox domain emails might go to spam

Step 4: Configure Sender Email (Option B - Custom Domain)
   
   For production:
   1. In Resend dashboard → Domains → Add Domain
   2. Enter your domain: kharcha.app
   3. Copy SPF record:
      v=spf1 include:sendingdomain.resend.dev ~all
   4. Copy DKIM records (3 records)
   5. Add to your domain's DNS (GoDaddy, Namecheap, etc)
   6. Wait 24-48 hours
   7. Click "Verify" in Resend dashboard
   8. Add to Backend/.env:
      RESEND_FROM_EMAIL=noreply@kharcha.app

Step 5: Test Email Sending
   
   In server logs, you should see:
   "Email sent successfully"
   
   Check your test email inbox (or spam folder)

Step 6: Monitor Email Status
   
   Resend dashboard shows:
   - Emails sent
   - Open rates
   - Click rates
   - Bounces
   - Complaints

Troubleshooting domain issues:
   - DNS changes take time (24-48 hours)
   - Check DNS propagation: https://mxtoolbox.com
   - Use sandbox domain if custom domain fails
   - Check SPF/DKIM records are exactly copied
`;

console.log(RESEND_SETUP);


// ============================================================================
// SECTION 6: IMPLEMENTATION SUMMARY
// ============================================================================

const IMPLEMENTATION_SUMMARY = `
📋 WHAT WAS FIXED

✅ Fixed 1: Added missing environment variables
   - RESEND_API_KEY
   - RESEND_FROM_EMAIL
   - FRONTEND_URL
   Files: Backend/.env

✅ Fixed 2: Integrated budget alerts in expense creation
   - Import checkBudgetThresholds in expense controller
   - Call function after expense is created
   - Handle errors without blocking request
   Files: Backend/controllers/expense.controller.js

✅ Fixed 3: Initialized cron job for weekly digests
   - Import initWeeklyDigestJob in server.js
   - Call it after database connects
   Files: Backend/server.js

✅ Fixed 4: Fixed model mismatch
   - Changed budgetAlert.job.js to use Expense model
   - Changed calculateCategorySpending to query Expense
   - Changed checkAllUserBudgets to use Expense.distinct
   Files: Backend/src/jobs/budgetAlert.job.js

✅ Fixed 5: Added proper imports and error handling
   - Better error logging
   - Non-blocking email failures
   - Proper async handling

Now emails will be sent automatically when:
✓ Budget reaches 75% of limit
✓ Budget exceeds 100% of limit
✓ Receipt is uploaded and processed
✓ Weekly digest scheduled (Sunday 9 AM)
✓ AI insights are generated
`;

console.log(IMPLEMENTATION_SUMMARY);

export default {
  VERIFICATION_STEPS,
  TEST_SCRIPT,
  TROUBLESHOOTING,
  DIAGNOSTIC_COMMANDS,
  RESEND_SETUP,
  IMPLEMENTATION_SUMMARY,
};
