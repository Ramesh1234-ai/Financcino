# Quick Startup Guide

## ⚠️ Current Issue: "Failed to fetch" Error

The "Failed to fetch" error means the **Frontend cannot reach the Backend**.

## Solution: Start the Backend First

### Step 1: Open a new terminal/command prompt and go to Backend folder
```bash
cd Backend
```

### Step 2: Start the backend server
```bash
npm start
```

You should see:
```
✅ Server running in development mode
📍 Listening on port 3000
🌐 API Base URL: http://localhost:3000/api
```

### Step 3: Verify backend is running
Open another tab in your browser and go to:
```
http://localhost:3000/api/health
```

You should see JSON response like:
```json
{
  "success": true,
  "status": "ok",
  "database": "connected"
}
```

### Step 4: Now start the frontend in a different terminal
```bash
cd BrokTok
npm run dev
```

You should see:
```
✅ VITE v5.x ready in XXXms
Local: http://localhost:5173
```

### Step 5: Open browser
Go to: `http://localhost:5173`

You should now see the **Clerk Sign In button** working correctly.

## Troubleshooting

### "Failed to fetch" still appearing?

1. **Check backend is actually running:**
   ```bash
   # In backend terminal, you should see:
   ✅ Server running in development mode
   📍 Listening on port 3000
   ```

2. **Check both ports are not conflicting:**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3000`

3. **Check the browser console (F12):**
   - You should see which URL it's trying to reach
   - New error message should show: `URL attempted: http://localhost:3000/api/expenses`

4. **Try opening backend health check manually:**
   ```
   http://localhost:3000/api/health
   ```
   - If this works, the backend is fine
   - If it doesn't load, the backend is not running

5. **Firewall check:**
   - Windows: Make sure Node.js is allowed in firewall
   - Mac/Linux: Try disabling any security software temporarily

## Terminal Setup (Recommended)

Open **TWO separate terminals:**

**Terminal 1 (Backend):**
```bash
cd c:\Users\DELL\Desktop\Kharcha-core\Backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd c:\Users\DELL\Desktop\Kharcha-core\BrokTok
npm run dev
```

Both should show "ready" messages. Then the app works!

## Error Messages Explained

| Error | Cause | Fix |
|-------|-------|-----|
| Failed to fetch | Backend not running | `npm start` in Backend |
| Cannot reach backend | Wrong port/URL | Check port 3000 is free |
| CORS error | Backend CORS misconfigured | Restart backend after config change |
| afterSignInUrl warning | Fixed in App.jsx | Clear browser cache, restart frontend |