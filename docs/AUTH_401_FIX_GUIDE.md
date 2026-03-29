# 401 Unauthorized Error - Root Cause & Solution

## Problem Analysis

Your 401 errors indicate that **authentication tokens are not being sent** with API requests. Here's why:

### Current Issue Chain:
1. ❌ **Clerk Provider placement is wrong** - wrapped inside components that use Clerk hooks
2. ❌ **useClerkAuth() hook may not have `getToken` method** - should use `useAuth()` from Clerk
3. ❌ **Token is null/undefined** - because Clerk isn't properly initialized
4. ❌ **No token in Authorization header** - so backend returns 401

---

## Root Cause: Provider Setup

### Current (WRONG):
```jsx
// main.jsx - THIS IS INCORRECT
<BrowserRouter>
  <AuthProvider>  {/* AuthProvider uses Clerk hooks HERE */}
    <App />       {/* but ClerkProvider wraps BELOW */}
  </AuthProvider>
</BrowserRouter>

/* ClerkProvider only wraps when key exists - creating race condition */
```

### Correct Structure:
```jsx
// main.jsx - THIS IS CORRECT
<ClerkProvider publishableKey={clerkKey}>
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
</ClerkProvider>
```

---

## Issue with `useClerkAuth()`

The `useClerkAuth()` hook doesn't work as implemented. From Clerk docs:
```javascript
// ❌ WRONG - useClerkAuth() doesn't have getToken
const clerkAuth = useClerkAuth()  // Returns auth state, not getToken
clerkAuth.getToken  // ❌ undefined!

// ✅ CORRECT - use useAuth() for getToken
const { getToken } = useAuth()  // From @clerk/clerk-react
const token = await getToken()
```

---

## Fixes Required

### Fix 1: Correct main.jsx Provider Setup

Replace the current provider structure with proper nesting.

### Fix 2: Fix AuthContext.jsx - Use Correct Clerk Hook

Replace `useClerkAuth()` with proper Clerk `useAuth()` which includes `getToken()`.

### Fix 3: Ensure Token is Actually Working

The `getToken` must be awaited before use.

---

## Current Token Flow Problems

### In Uploads.jsx:
```javascript
// Line 30
const token = await getToken()  // ✅ Correct - awaits token
const res = await fetch(url, { 
  headers: { Authorization: token ? `Bearer ${token}` : '' }
})
```
This is correct but has a scope issue - `token` is used in `deleteSelected()` without being recaptured.

### In ManualExpenseForm.jsx:
```javascript
// Line 4
const { getToken } = useAuth() || {}
// ...
const res = await api.getCategories(getToken)  // ⚠️ Passes function, not token
```
This passes the function directly, relying on `callApi` to await it.

### In api.js:
```javascript
// Line 10-24 - This handles BOTH cases
if (typeof token === 'function') {
  authToken = await token()  // ✅ CAN work with function
} else {
  authToken = token  // ✅ OR works with string
}
```

**BUT** - if `getToken` is returning null or undefined (because Clerk isn't initialized), then it won't work either way!

---

## Error Trace:

```
ManualExpenseForm.jsx:31 → loadCategories()
  ↓
api.getCategories(getToken)  // Passes getToken function
  ↓
callApi('/categories', {...}, getToken)
  ↓
Is token a function? Yes → await token()
  ↓
authContext.getToken() is called
  ↓
Checks: clerkAuth?.isSignedIn && clerkAuth.getToken
  ↓
❌ clerkAuth from useClerkAuth() doesn't have isSignedIn or getToken properties
  ↓
Returns null
  ↓
No Authorization header sent
  ↓
Backend returns 401 Unauthorized
```

---

## Step-by-Step Solution

### Step 1: Fix main.jsx
Move ClerkProvider OUTSIDE BrowserRouter and AuthProvider.

### Step 2: Fix AuthContext.jsx  
Replace `useClerkAuth()` with the correct Clerk hooks.

### Step 3: Verify .env
Make sure `VITE_CLERK_PUBLISHABLE_KEY` is set.

### Step 4: Test Token
Add debug logs to verify token is generated.

---

## Verification Checklist

- [ ] `.env` has `VITE_CLERK_PUBLISHABLE_KEY=pk_xxx`
- [ ] Clerk dashboard shows your application is created
- [ ] Backend endpoint (e.g., `http://localhost:3000/api/expenses`) returns 403 (forbidden, not 401) when tested with valid JWT
- [ ] `getToken()` returns actual JWT string (not null)
- [ ] Token is sent in `Authorization: Bearer <token>` header
- [ ] Backend validates JWT matches Clerk's public key

