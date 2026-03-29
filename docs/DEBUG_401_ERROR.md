# Debugging 401 Unauthorized Errors

## Step-by-Step Diagnosis

### Step 1: Check Browser Console - Do This NOW
Open Browser DevTools → Console tab and look for these messages:

#### ✅ If you see:
```
✅ Clerk loaded successfully
Clerk is ready!
```
→ Go to **Step 2**

#### ❌ If you see:
```
⚠️  VITE_CLERK_PUBLISHABLE_KEY is not set
Configuration Error
```
→ **FIX: Add Clerk key to `.env`** (see below)

---

### Step 2: Check If User Is Authenticated
In browser console, run:
```javascript
// Check Clerk status
console.log('Clerk:', window.Clerk)
window.Clerk?.user
```

#### ✅ If you see user object with id and email:
```javascript
{ 
  id: "user_123...",
  emailAddresses: [ { emailAddress: "you@example.com" } ],
  ...
}
```
→ Go to **Step 3**

#### ❌ If you see `null` or no user:
→ **You're not logged in!** Sign in first, then retry

---

### Step 3: Check Token Generation
In browser console, run:
```javascript
// Test token generation
const token = await window.Clerk.session?.getToken()
console.log('Token:', token)
console.log('Token length:', token?.length)
```

#### ✅ If you see a long token string (200+ chars):
→ Go to **Step 4**

#### ❌ If you see `null` or `undefined`:
→ **Issue: Token is not generating**

Fix: Try manually signing out and back in:
```javascript
await window.Clerk.signOut()
// Wait, then reload page and sign in again
```

---

### Step 4: Test API Call Directly
In browser console, run:
```javascript
const token = await window.Clerk.session?.getToken()
const res = await fetch('http://localhost:3000/api/expenses', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
console.log('Response status:', res.status)
console.log('Response:', await res.json())
```

#### ✅ If you see status `200` with data:
→ **API works! Problem is in React component token passing**
→ Go to **Fix: React Token Passing**

#### ❌ If you see status `401`:
→ **Backend rejected the token**
→ Go to **Fix: Backend JWT Verification**

---

## Common Fixes

### Fix 1: Add Clerk Key to .env

Create or update `BrokTok/.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
VITE_API_URL=http://localhost:3000/api
```

Get your key from: https://dashboard.clerk.com

Then restart dev server: `npm run dev` in `BrokTok/`

---

### Fix 2: React Token Passing Issue

**Problem:** Components might not be awaiting token properly

**Solution - Add debug logging to useExpenses.js:**

Add this to line 14 in `BrokTok/src/hooks/useExpenses.js`:

```javascript
const loadExpenses = useCallback(async () => {
	if (!getToken) {
		console.error('useExpenses: getToken not available')
		return
	}
	setLoading(true)
	setError(null)

	try {
		console.log('📍 loadExpenses: Starting...')
		const token = await getToken()
		console.log('🔑 loadExpenses: Got token?', !!token, 'length:', token?.length || 0)
		
		if (!token) {
			console.error('❌ loadExpenses: Token is null/undefined!')
			setError('Not authenticated')
			setLoading(false)
			return
		}
		
		console.log('📤 loadExpenses: Calling API with token...')
		const res = await api.getExpenses(token)
		console.log('📥 loadExpenses: API response:', res)
		
		if (res?.error) {
			setError(res.error)
			setLoading(false)
			return
		}
		// ... rest of code
```

Then check console for the debug messages to see where token is failing.

---

### Fix 3: Backend JWT Verification Issue

**Problem:** Backend is rejecting valid tokens

**Solution:** Check `Backend/middleware/auth.js`:

```javascript
// Should look like this:
import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1] // Get token after "Bearer "
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    // For Clerk: Verify token from Clerk
    // For JWT: Verify token with secret
    
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ error: 'Invalid token' })
      req.userId = decoded.sub || decoded.userId
      next()
    })
  } catch (err) {
    res.status(401).json({ error: err.message })
  }
}
```

---

## Complete Token Flow Checklist

- [ ] Clerk key is set in `BrokTok/.env`
- [ ] User is signed in (check `window.Clerk.user`)
- [ ] Token can be generated (run test in console)
- [ ] Direct API call works with token (test in console)
- [ ] Backend auth middleware accepts token
- [ ] React components await token before using
- [ ] API service passes token correctly

---

## Quick Test: Verify Everything Works

Run this in browser console to test entire flow:

```javascript
// 1. Check clerk
console.log('1. Clerk available?', !!window.Clerk)
console.log('2. User signed in?', !!window.Clerk?.user)

// 2. Get token
const token = await window.Clerk.session?.getToken()
console.log('3. Token available?', !!token)
console.log('4. Token length:', token?.length)

// 3. Test API
const res = await fetch('http://localhost:3000/api/expenses', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  method: 'GET'
})

console.log('5. API status:', res.status)
console.log('6. API response:', await res.json())
```

If all checks pass but React still fails, the issue is in token passing within components.

---

## Need More Help?

Check the browser console for these specific messages:
- `✅ Token fetched successfully` → Token generation works
- `⚠️  User not signed in - cannot fetch token` → User not logged in
- `Failed to get Clerk token: ...` → Clerk token error
- `GET http://localhost:3000/api/expenses 401` → Auth header missing

