# Clerk Setup Guide

## Quick Start

### Step 1: Create a Clerk Account
1. Go to https://dashboard.clerk.com
2. Sign up or sign in

### Step 2: Create an Application
1. Click "Create application"
2. Choose your authentication methods (sign up, email, password)
3. Click "Create app"

### Step 3: Get Your Publishable Key
1. In the left sidebar, click "API Keys"
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. **Do NOT share this key publicly** (it's safe to include in frontend code)

### Step 4: Configure Your App
#### Add to `BrokTok/.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```
#### Or update `BrokTok/.env.example`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```
### Step 5: Set Up Redirect URLs (Important!)
In Clerk Dashboard:
1. Go to **Settings** → **URLs**
2. Add redirect URLs:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`
3. Save changes
### Step 6: Run Your App
```bash
# Terminal 1: Backend
cd Backend
npm start
# Should see: ✅ Server running in development mode on port 3000
# Terminal 2: Frontend
cd BrokTok
npm run dev
# Should see: ✅ VITE v5.x ready in XXms, Local: http://localhost:5173
```
### Step 7: Test the Authentication
1. Open http://localhost:5173
2. Click "Sign in" or "Sign up"
3. Clerk modal should appear
4. Sign in with email/password or social auth
5. You should be redirected to `/dashboard`
## Troubleshooting
### Blank White Page
- Check browser console for errors: `F12 → Console`
- Make sure `VITE_CLERK_PUBLISHABLE_KEY` is set in `.env`
- Check that the key is correct (copy-paste from dashboard again)
- Restart the frontend: `npm run dev`
### "Invalid Publishable Key"
- The key might be wrong
- Try generating a new one in Clerk dashboard
- Make sure you're using the **Publishable Key**, not the Secret Key
### Redirect Loop or Not Redirecting After Login
- Check redirect URLs in Clerk Dashboard
- Make sure `http://localhost:5173` is added
- Clear browser cache and localStorage: 
  ```javascript
  // In browser console
  localStorage.clear()
  location.reload()
  ```

### API Calls Returning 401
- The Clerk token might not be set
- Check that frontend is sending `Authorization: Bearer ${token}` header
- Check browser console Network tab to see request headers
- Make sure backend is running on port 3000
## API Testing with Clerk Token
Once authenticated, test the API:
```bash
# Get your Clerk token (from browser localStorage)
# Then use it in curl:
curl -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  http://localhost:3000/api/expenses
```
## File Locations
- **Frontend config**: `BrokTok/.env`
- **Backend config**: `Backend/.env`
- **Clerk keys**: https://dashboard.clerk.com/apps/YOUR_APP_ID/api-keys
## Next Steps
1. ✅ Add Clerk Publishable Key
2. ✅ Test sign in/sign up
3. ✅ Create an expense
4. ✅ Upload a receipt
5. ✅ Chat with the AI assistant
6. [Optional] Customize Clerk appearance in dashboard