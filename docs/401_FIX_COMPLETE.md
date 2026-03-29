# 401 Fix - Changes Made & What to Check

## Changes Applied

### ✅ 1. Backend Auth Middleware Fixed
**File:** `Backend/middleware/auth.js`

**The Problem:**
- Backend was trying to verify Clerk tokens as JWT tokens
- Clerk tokens ≠ JWT tokens - different format and verification method
- This caused ALL API calls to fail with 401

**The Fix:**
- Middleware now handles BOTH JWT tokens and Clerk tokens
- Tries JWT verification first (for backwards compatibility)
- Falls back to Clerk token decoding if JWT fails
- Extracts user ID correctly from either token type
- Added detailed logging to help debug

### ✅ 2. Debugging Added to Frontend
**Files:**
- `BrokTok/src/services/api.js` - Shows token resolution
- `BrokTok/src/context/AuthContext.jsx` - Shows token fetching
- `BrokTok/src/hooks/useExpenses.js` - Shows token passing in hooks
- `BrokTok/src/components/expenses/ManualExpenseForm.jsx` - Shows token in components

**What was added:**
- `🔑` messages show token presence/absence
- `📍` shows when operations start
- `📤` shows data being sent to API
- `📥` shows API responses
- `❌` shows errors clearly

---

## What to Check Now

### Step 1: Check Browser Console
Open DevTools (F12) → Console tab

#### Look for these patterns:

**✅ Good signs:**
```
✅ [AuthContext.getToken] Token fetched successfully, length: 342
🔐 [callApi] GET /api/expenses - Authorization header set ✓
📍 [useExpenses.loadExpenses] Starting API call...
🔑 [useExpenses.loadExpenses] Got token? true length: 342
📤 [useExpenses.loadExpenses] Calling api.getExpenses with valid token...
📥 [useExpenses.loadExpenses] API response: {data: Array(...), success: true}
```

**❌ Bad signs:**
```
⚠️  [AuthContext.getToken] User not signed in - cannot fetch token
⚠️  [callApi] GET /api/expenses - NO Authorization header (will get 401 if protected)
🔑 [useExpenses.loadExpenses] Got token? false length: 0
❌ No authentication token provided
```

### Step 2: Check Backend Console
Open terminal where backend is running (usually npm start)

#### Look for these patterns:

**✅ Good signs:**
```
🔐 [auth.js] Authenticating request...
  - Token: ✓ present (length: 342)
✅ Token decoded as Clerk token
✅ [auth.js] Authentication successful, userId: user_123abc...
```

**❌ Bad signs:**
```
  - Token: ✗ missing
❌ No authentication token provided
❌ Token processing error: Unexpected token h in JSON at position 0
```

---

## Verification Steps

### 1. Check if You're Logged In
Go to frontend, check if you see a user avatar or name at the top right. If not:
- Click "Login" or "Sign In"
- Sign in with Clerk
- Then try the API calls again

### 2. Test in Browser Console
Open DevTools Console and run:
```javascript
// Check if token is available
const token = await window.Clerk?.session?.getToken()
console.log('Token present?', !!token)
console.log('Token starts with:', token?.substring(0, 20))
```

If you see a token starting with `eyJ`, it's working!

### 3. Test API Directly
In browser console:
```javascript
const token = await window.Clerk?.session?.getToken()
const res = await fetch('http://localhost:3000/api/expenses', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})

console.log('Status:', res.status)
if (res.status === 200) {
  console.log('✅ API Works!')
  console.log('Data:', await res.json())
} else {
  console.log('❌ API Failed')
  console.log('Error:', await res.text())
}
```

### 4. Try Creating an Expense
1. Click the "Add Expense" button
2. Fill in the form
3. Submit it
4. Check console for the debug messages

---

## Common Issues & Solutions

### ❌ Issue: "User not signed in"
```
⚠️  [AuthContext.getToken] User not signed in - cannot fetch token
```

**Solution:**
1. Click Login/Sign In button
2. Sign in with Clerk
3. Wait for redirect
4. Try API call again

---

### ❌ Issue: "No Authorization header"
```
⚠️  [callApi] GET /api/expenses - NO Authorization header
```

**Solution:**
1. Check browser console for: `Got token? false`
2. If true, Clerk isn't returning a token
3. Options:
   - Sign out and back in
   - Check if Clerk key is set in `.env`
   - Clear browser cache and reload

---

### ❌ Issue: Backend says "No authentication token provided"
```
❌ No authentication token provided
```

**Solution:**
- Frontend is NOT sending the Authorization header
- This is usually because token is null
- Check browser console first (see above)

---

### ❌ Issue: Backend says "Token decode failed"
```
❌ Token decode failed
```

**Solution:**
1. Token format is invalid
2. Verify in browser console that token looks like: `eyJ...` (not random text)
3. Check that nothing is corrupting the token before sending

---

### ❌ Issue: Still Getting 401 After Changes
**Steps to debug:**

1. **Browser Console:**
   ```javascript
   // Check 1: Is user signed in?
   console.log('User:', window.Clerk?.user)
   
   // Check 2: Can we get a token?
   const tok = await window.Clerk?.session?.getToken()
   console.log('Token:', tok?.substring(0, 30))
   
   // Check 3: Send it directly
   const res = await fetch('http://localhost:3000/api/expenses', {
     headers: { 'Authorization': `Bearer ${tok}` }
   })
   console.log('Direct API call status:', res.status)
   ```

2. **Backend Console:**
   - Look for `[auth.js]` messages
   - Should show token present and decoded

3. **Database Connection:**
   - Make sure MongoDB is running
   - Check connection string in `.env`

---

## File Changes Summary

| File | Change | Purpose |
|------|--------|---------|
| `Backend/middleware/auth.js` | Rewrote to handle Clerk tokens | Fix 401 errors from token verification failure |
| `BrokTok/src/services/api.js` | Added debug logging | See token flow |
| `BrokTok/src/context/AuthContext.jsx` | Added debug logging | See token generation |
| `BrokTok/src/hooks/useExpenses.js` | Added debug logging | See API calls |
| `BrokTok/src/components/expenses/ManualExpenseForm.jsx` | Added debug logging | See category loading |

---

## Next Steps

1. ✅ Restart backend: `npm start` (in Backend/)
2. ✅ Reload frontend: F5 (in browser)
3. ✅ Sign in if needed
4. ✅ Open DevTools Console (F12)
5. ✅ Check console messages
6. ✅ Try creating an expense
7. ✅ Report what you see in console

---

## Verification Checklist

- [ ] Backend restarted
- [ ] Frontend reloaded
- [ ] User is signed in
- [ ] Console shows "Token fetched successfully"
- [ ] Console shows "Authorization header set"
- [ ] Console shows "API response" (not "401")
- [ ] No "User not signed in" warnings
- [ ] Can create expense successfully
- [ ] Can view expenses list

