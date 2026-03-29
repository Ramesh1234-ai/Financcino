# 401 Unauthorized Error - Complete Fix & Troubleshooting Guide

## Quick Summary of Fixes Applied

✅ **Fixed main.jsx** - ClerkProvider now wraps everything (outermost provider)  
✅ **Fixed AuthContext.jsx** - Using correct `useAuth()` hook with proper token fetching  
✅ **Fixed ManualExpenseForm.jsx** - Now awaits token before API calls  
✅ **Fixed useExpenses.js** - token is awaited in both `loadExpenses()` and `addExpense()`  
✅ **Fixed Uploads.jsx** - Token scope fixed in `deleteSelected()`

---

## Step 1: Verify Your .env File

Create/update `BrokTok/.env` with:

```env
VITE_API_URL=http://localhost:3000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

**Where to get your Clerk key:**
1. Visit https://dashboard.clerk.com
2. Create new application (if you haven't)
3. Copy "Publishable Key"
4. Paste into `.env` file above
5. **Restart your dev server** (Vite won't pick up new .env without restart)

---

## Step 2: Verify Backend is Running

Before testing, ensure backend is running:

```bash
# Terminal 1 - Start Backend
cd Backend
npm install  # if not done yet
npm start
# Should see: "Server running on port 3000"
```

---

## Step 3: Debug Token Generation

Add this test in your Dashboard or any component:

```javascript
import useAuth from '../hooks/useAuth'

function TestAuth() {
  const { getToken, isSignedIn, user } = useAuth()

  const testToken = async () => {
    console.log('👤 User:', user)
    console.log('✅ Signed In:', isSignedIn)
    
    try {
      const token = await getToken()
      if (token) {
        console.log('✅ Token obtained:', token.substring(0, 20) + '...')
        console.log('📏 Token length:', token.length)
      } else {
        console.warn('❌ getToken returned null - User not authenticated')
      }
    } catch (err) {
      console.error('❌ Failed to get token:', err)
    }
  }

  return (
    <button onClick={testToken} className="px-4 py-2 bg-blue-600 text-white rounded">
      Test Auth Token
    </button>
  )
}
```

**Expected Output if working:**
```
👤 User: { id: 'user_...', email: 'user@example.com', ... }
✅ Signed In: true
✅ Token obtained: eyJhbGciOiJIUzI1NiIsI...
📏 Token length: 500+
```

**If you see:**
- `👤 User: null` → User not logged in, go to login page first
- `❌ getToken returned null` → Clerk not initialized, check .env
- Error about Clerk → publishable key is wrong or missing

---

## Step 4: Check Network Requests

In Chrome DevTools:

1. Open **Network** tab
2. Try to create an expense or load receipts
3. Look for API request (e.g., `POST http://localhost:3000/api/expenses`)
4. Click on it, go to **Headers** section
5. Check for `Authorization: Bearer eyJ...` header

**If 401 error:**
- ❌ No Authorization header → Token not being sent
- ❌ `Authorization: Bearer null` → Token is null
- ❌ `Authorization: Bearer undefined` → Token is undefined

**Fix:** Ensure token is awaited before being passed to API function.

---

## Step 5: Backend Validation Check

In Backend console, add debug logging to `middleware/auth.js`:

```javascript
export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    console.log('📥 Request Authorization Header:', authHeader ? '✅ Present' : '❌ Missing')
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' })
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('🔍 Token length:', token.length)
    
    const user = await clerkClient.verifyToken(token)
    console.log('✅ Token verified for user:', user.userId)
    
    req.userId = user.userId
    next()
  } catch (err) {
    console.error('❌ Token verification failed:', err.message)
    res.status(401).json({ error: 'Invalid token' })
  }
}
```

Then make a request and check Backend console output.

---

## Step 6: Test Each API Function

### Test 1: Get Categories
```javascript
import useAuth from '../hooks/useAuth'
import * as api from '../services/api'

async function testCategories() {
  const { getToken } = useAuth()
  const token = await getToken()
  const result = await api.getCategories(token)
  console.log('Categories result:', result)
}
```

### Test 2: Create Expense
```javascript
async function testCreateExpense() {
  const { getToken } = useAuth()
  const token = await getToken()
  const result = await api.createExpense({
    amount: 100,
    category: 'Food & Dining',
    description: 'Test expense'
  }, token)
  console.log('Create result:', result)
}
```

### Test 3: Get Expenses
```javascript
async function testGetExpenses() {
  const { getToken } = useAuth()
  const token = await getToken()
  const result = await api.getExpenses(token)
  console.log('Expenses result:', result)
}
```

---

## Common Issues & Solutions

### Issue 1: "User is undefined" on page load
**Cause:** AuthProvider still loading Clerk  
**Solution:** Wrap components in `<ProtectedRoute />` or check `loading` state

```javascript
function MyComponent() {
  const { user, loading, isSignedIn } = useAuth()
  
  if (loading) return <div>Loading auth...</div>
  if (!isSignedIn) return <Navigate to="/login" />
  
  return <div>Hello {user.firstName}</div>
}
```

### Issue 2: "ClerkInstanceContext not found"
**Cause:** Component using Clerk hooks outside ClerkProvider  
**Solution:** Verify ClerkProvider wraps everything in main.jsx (should be outermost)

```
✅ CORRECT:
  <ClerkProvider>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </ClerkProvider>

❌ WRONG:
  <BrowserRouter>
    <ClerkProvider>  ← Inside BrowserRouter
      <AuthProvider>
        <App />
      </AuthProvider>
    </ClerkProvider>
  </BrowserRouter>
```

### Issue 3: Token is null even after sign-in
**Cause 1:** Clerk not fully initialized  
**Cause 2:** `isSignedIn` is false  

**Solution:** Add loading/signing check:
```javascript
const getToken = async () => {
  if (!clerkAuth?.isLoaded) {
    console.warn('⏳ Clerk not loaded yet')
    return null
  }
  if (!clerkAuth?.isSignedIn) {
    console.warn('⛔ User not signed in')
    return null
  }
  if (typeof clerkAuth?.getToken !== 'function') {
    console.error('❌ getToken is not a function')
    return null
  }
  
  return await clerkAuth.getToken()
}
```

### Issue 4: Receipt upload returns 401
**Likely cause:** Token not being passed to `uploadReceipt()`  
**Solution:** In Dashboard.jsx or where upload happens:

```javascript
async function handleReceiptUpload(file) {
  const { getToken } = useAuth()
  
  // ✅ Await token first
  const token = await getToken()
  if (!token) {
    console.error('Not authenticated')
    return
  }
  
  // ✅ Pass resolved token
  const result = await api.uploadReceipt(file, token)
  if (result?.error) {
    console.error('Upload failed:', result.error)
  } else {
    console.log('Upload successful:', result)
  }
}
```

---

## Verification Tests

Run these to verify everything is working:

### Test 1: Clerk Initialization
```javascript
// In browser console
import { useClerk } from '@clerk/clerk-react'
const clerk = useClerk()
console.log('Clerk client:', clerk)  // Should not be null
```

### Test 2: Token Generation
```javascript
// After sign-in, in browser console
(async () => {
  const auth = (await import('react')).useContext((await import('@clerk/clerk-react')).useAuth)
  console.log(auth)
})()
```

### Test 3: API Call with Token
```javascript
// In browser console, after sign-in
(async () => {
  const { getToken } = (await import('@clerk/clerk-react')).useAuth()
  const token = await getToken()
  const res = await fetch('http://localhost:3000/api/categories', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  console.log('Status:', res.status)
  console.log('Response:', await res.json())
})()
```

---

## File Changes Summary

| File | Change |
|------|--------|
| [main.jsx](main.jsx) | ClerkProvider now wraps everything (outermost) |
| [AuthContext.jsx](BrokTok/src/context/AuthContext.jsx) | Using `useAuth()` hook correctly, added debug logs |
| [ManualExpenseForm.jsx](BrokTok/src/components/expenses/ManualExpenseForm.jsx) | Token is awaited before API calls |
| [useExpenses.js](BrokTok/src/hooks/useExpenses.js) | `loadExpenses()` and `addExpense()` await token |
| [Uploads.jsx](BrokTok/src/components/dashboard/Uploads.jsx) | `deleteSelected()` fixed token scope |

---

## Success Indicators

After fixes, you should see:

1. ✅ No 401 errors in console
2. ✅ No "Failed to load resources"
3. ✅ Expenses appear in dashboard after form submit
4. ✅ Receipts load in Uploads page
5. ✅ Categories dropdown populates
6. ✅ Network requests show `Authorization: Bearer <token>` header

---

## Still Getting 401? Debug Checklist

- [ ] Is backend running on `http://localhost:3000`?
- [ ] Is `VITE_CLERK_PUBLISHABLE_KEY` set in `.env`?
- [ ] Did you restart Vite dev server after changing `.env`?
- [ ] Are you signed in? (Check top-right user menu)
- [ ] Is token visible in Network > Headers > Authorization?
- [ ] Does backend's `clerkClient.verifyToken()` work with this token?
- [ ] Is `CLERK_SECRET_KEY` set in Backend `.env`?
- [ ] Are Clerk environment IDs matching between frontend & backend?

---

## Next Steps

1. Verify .env configuration
2. Restart both Frontend and Backend
3. Sign in to your Clerk account
4. Test token generation with the debug code above
5. Check Network tab for Authorization header
6. Try creating an expense - should work without 401!

If still getting 401 after all this, there may be a Clerk configuration issue. Check:
- https://dashboard.clerk.com → Your app settings
- Verify "Authorized origins" includes `http://localhost:3000`
- Verify "Redirect URLs" is configured

