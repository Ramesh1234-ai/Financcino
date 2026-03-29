# API.js Usage Guide - Receipt Scanning Application

## Overview
Your `api.js` file (`BrokTok/src/services/api.js`) is a centralized service that manages all backend API calls with Clerk authentication. It's specifically designed for your expense tracking + receipt scanning application.

---

## Core Function: `callApi()`

### What it does:
```javascript
async function callApi(path, options = {}, token = null)
```

**Purpose:** Universal API call handler that:
- ✅ Constructs full API URLs from environment variables
- ✅ Handles Clerk authentication tokens
- ✅ Handles JSON requests/responses
- ✅ Manages error handling and timeout (10 seconds)
- ✅ Supports both Bearer token strings and Clerk's `getToken()` function

### Parameters:
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `path` | string | API endpoint path | `/expenses`, `/receipts/upload` |
| `options` | object | Fetch options (method, body, headers) | `{ method: 'POST', body: JSON.stringify(data) }` |
| `token` | string \| function | Auth token or Clerk getToken function | `await getToken()` or `getToken` |

### How it resolves tokens:
```javascript
// If token is a function (Clerk's getToken):
let authToken = token
if (typeof token === 'function') {
    authToken = await token()  // Automatically calls it
}

// Then adds Authorization header:
headers['Authorization'] = `Bearer ${authToken}`
```

---

## Current API Functions

### 1. **Expense Management (CRUD)**

#### Get all expenses
```javascript
import * as api from '../services/api'
import useAuth from '../hooks/useAuth'

function MyComponent() {
  const { getToken } = useAuth()
  
  const expenses = await api.getExpenses(getToken)
  // Returns: { data: [...expenses], error: null }
}
```

#### Create new expense
```javascript
const payload = {
  amount: 150.50,
  category: 'Food & Dining',
  description: 'Lunch at restaurant',
  date: '2026-03-19'
}
const result = await api.createExpense(payload, getToken)
// Returns: { _id, amount, category, ... } or { error: 'message' }
```

#### Update expense
```javascript
const expenseId = '65a1b2c3d4e5f6g7h8i9j0k1'
const updates = {
  amount: 175.00,
  category: 'Dining'
}
const result = await api.updateExpense(expenseId, updates, getToken)
```

#### Delete expense
```javascript
const result = await api.deleteExpense(expenseId, getToken)
```

---

### 2. **Receipt Upload & Processing**

#### Upload Receipt File
```javascript
async function handleReceiptUpload(file) {
  const result = await api.uploadReceipt(file, getToken)
  
  // Backend response typically includes:
  // {
  //   success: true,
  //   receiptId: '...',
  //   extractedData: {
  //     amount: 150.50,
  //     merchant: 'Restaurant Name',
  //     date: '2026-03-19',
  //     items: [...]
  //   }
  // }
}
```

#### Get receipts list
```javascript
const page = 1
const receipts = await api.getReceipts(page, getToken)
// Returns: { receipts: [...], pagination: { total, pages } }
```

---

### 3. **Analytics & Dashboard**

#### Get analytics data
```javascript
const analytics = await api.getAnalytics('month', getToken)
// Parameters: 'day' | 'week' | 'month' | 'year'
// Returns: { 
//   totalSpent: 5000,
//   byCategory: {...},
//   dailyBreakdown: [...]
// }
```

---

### 4. **Categories**

#### Get categories
```javascript
const categories = await api.getCategories(getToken)
// Returns: { 
//   categories: [
//     'Food & Dining',
//     'Transportation',
//     'Shopping',
//     ...
//   ]
// }
// Falls back to hardcoded categories if backend fails
```

---

### 5. **Chat (Chatbot)**

#### Send chat message
```javascript
const response = await api.sendChatMessage('How much did I spend on food?', getToken)
// Returns: { reply: 'You spent $500 on food this month' }
```

---

## Current Working Progress

### ✅ Fully Implemented:
- [x] Clerk authentication integration
- [x] Authentication token handling
- [x] CRUD operations for expenses
- [x] Receipt file upload
- [x] Analytics data retrieval
- [x] Category management
- [x] Error handling with 10-second timeout
- [x] Fallback categories if backend fails

### 🔄 In Progress (Based on your description):
- [x] Receipt upload
- [ ] **Receipt data extraction/scanning** (needs backend enhancement)
- [ ] **Automatic expense creation from receipt data**
- [ ] **Dashboard real-time updates after scan**

---

## How to Use for Receipt Scanning Workflow

### Your Flow:
1. User uploads receipt image → `uploadReceipt()`
2. Backend scans/OCR extracts: amount, merchant, date, items
3. API automatically creates expense and updates dashboard

### Current Implementation Example (Dashboard.jsx):

```javascript
const handleUpload = async (file) => {
  setUploadStatus('processing');
  
  try {
    const token = await getToken()
    
    // Use the API function instead!
    const res = await api.uploadReceipt(file, token);
    
    if (res?.error) {
      setUploadStatus('error');
      return;
    }
    
    // Receipt uploaded successfully
    // Backend should have created expense automatically
    setUploadStatus('success');
    
    // Refresh dashboard data
    onUpload(); // Calls fetchData to reload expenses
    
  } catch (err) {
    setUploadStatus('error');
    console.error('Upload failed:', err);
  }
};
```

---

## Best Practices for Receipt Scanning App

### 1. **Normalize all API calls through api.js**
❌ **Don't do this:**
```javascript
const res = await fetch('/receipts/upload', {...})
```

✅ **Do this:**
```javascript
const res = await api.uploadReceipt(file, getToken)
```

### 2. **Always handle errors**
```javascript
const result = await api.uploadReceipt(file, getToken)

if (result?.error) {
  // Handle error - display toast, retry logic, etc.
  showToast('Upload failed: ' + result.error, 'error')
  return
}

// Continue with success handling
```

### 3. **Use custom hook for state management**
✅ Good approach:
```javascript
// useExpenses.js already does this
const { transactions, loading, error, loadExpenses } = useExpenses()

// In component:
useEffect(() => {
  loadExpenses()
}, [])

if (loading) return <Spinner />
if (error) return <Error message={error} />
return <ExpenseList expenses={transactions} />
```

### 4. **Pass token from useAuth hook**
```javascript
import useAuth from '../hooks/useAuth'

function MyComponent() {
  const { getToken } = useAuth() // Gets Clerk's getToken function
  
  // Pass directly to api functions
  const results = await api.getExpenses(getToken)
}
```

---

## Request/Response Patterns

### Success Response:
```javascript
{
  data: [...],        // Array of resources
  success: true,      // Boolean flag
  message: 'OK'       // Optional message
}
```

### Error Response:
```javascript
{
  error: 'Message describing what went wrong',
  statusCode: 400,    // HTTP status
  details: {...}      // Optional error details
}
```

---

## Recommended Enhancements for Receipt Scanning

### Add a new API function for processing receipts with OCR:
```javascript
// Add to api.js
export async function processReceiptWithOCR(file, token) {
  return callApi('/receipts/process-ocr', {
    method: 'POST',
    body: (() => {
      const form = new FormData()
      form.append('receipt', file)
      return form
    })(),
  }, token)
  // Backend should return: {
  //   success: true,
  //   expenseCreated: { _id, amount, category, merchant, date, items },
  //   confidence: 0.95
  // }
}
```

### Add real-time dashboard refresh:
```javascript
// In Dashboard.jsx after upload
const handleUploadSuccess = async () => {
  // Refresh expenses immediately
  await loadExpenses()
  
  // Show success message
  showToast('Receipt scanned and expense created!', 'success')
  
  // Optional: Auto-scroll to new expense
  scrollToLatestExpense()
}
```

---

## Environment Configuration

Make sure your `.env` has:
```env
VITE_API_URL=http://localhost:3000/api
```

If not set, defaults to `http://localhost:3000/api`

---

## Summary

| Task | Function | Usage |
|------|----------|-------|
| Get expenses | `getExpenses(token)` | Initial data load |
| Add expense from form | `createExpense(data, token)` | Manual entry |
| Update expense | `updateExpense(id, data, token)` | Edit existing |
| Delete expense | `deleteExpense(id, token)` | Remove mistake |
| Upload receipt | `uploadReceipt(file, token)` | **Scan & extract** |
| Get receipt list | `getReceipts(page, token)` | View uploaded receipts |
| Get analytics | `getAnalytics(range, token)` | Dashboard stats |
| Get categories | `getCategories(token)` | Dropdown options |
| Chat | `sendChatMessage(msg, token)` | Bot queries |

---

## Common Issues & Solutions

### ❌ Problem: "No token available"
```javascript
// Check if getToken is available
const { getToken } = useAuth() || {}
if (!getToken) {
  console.error('Not authenticated')
  return
}
```

### ❌ Problem: CORS errors on upload
→ Check backend CORS config allows your frontend URL

### ❌ Problem: 401 Unauthorized
→ JWT token expired, user needs to re-login via Clerk

### ❌ Problem: Receipt upload stuck on "processing"
→ Check backend OCR service is running, increase timeout if needed

---

## Testing Receipt Workflow

```javascript
// Test flow for receipt scanning
async function testReceiptWorkflow() {
  const { getToken } = useAuth()
  
  // 1. Create test expense manually
  const expense = await api.createExpense({
    amount: 100,
    category: 'Food & Dining',
    description: 'Test receipt'
  }, getToken)
  console.log('Created:', expense)
  
  // 2. Get all expenses
  const all = await api.getExpenses(getToken)
  console.log('Total expenses:', all.data?.length)
  
  // 3. Get analytics
  const analytics = await api.getAnalytics('month', getToken)
  console.log('Monthly total:', analytics.totalSpent)
  
  // 4. Test upload (requires actual image file)
  // const result = await api.uploadReceipt(imageFile, getToken)
}
```

