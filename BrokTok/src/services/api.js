// Clerk token-based API service
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * Enhanced API call helper that supports Clerk authentication
 * @param {string} path - API endpoint path (e.g., '/expenses')
 * @param {object} options - Fetch options
 * @param {string|Function} token - Token string OR getToken() function from useAuth
 */
async function callApi(path, options = {}, token = null) {
	const url = BASE.replace(/\/$/, '') + path
	
	try {
		// Resolve token if it's a function (Clerk's getToken)
		let authToken = token
		if (typeof token === 'function') {
			try {
				authToken = await token()
			} catch (err) {
				console.warn('Failed to get Clerk token:', err.message)
				// Continue without token - backend will return 401 if protected route
			}
		}

		// Build headers with auth if token exists
		const headers = {
			'Content-Type': 'application/json',
			...options.headers,
		}
		
		if (authToken) {
			headers['Authorization'] = `Bearer ${authToken}`
		}

		const res = await fetch(url, {
			...options,
			headers,
			signal: AbortSignal.timeout(10000),
		})

		if (!res.ok) {
			try {
				const json = await res.json()
				return json
			} catch {
				const text = await res.text()
				return { error: text || res.statusText, statusCode: res.status }
			}
		}

		try {
			return await res.json()
		} catch {
			return { ok: true }
		}
	} catch (err) {
		console.error('API call failed:', err.message)
		console.error('URL attempted:', url)
		console.error('Error details:', {
			message: err.message,
			type: err.constructor.name,
			cause: err.cause
		})
		return { error: err.message || 'Network error - is the backend running?' }
	}
}
// Expense API calls
export async function getExpenses(token) {
	return callApi('/expenses', {
		method: 'GET',
	}, token)
}

export async function createExpense(payload, token) {
	return callApi('/expenses', {
		method: 'POST',
		body: JSON.stringify(payload),
	}, token)
}

export async function updateExpense(id, payload, token) {
	return callApi(`/expenses/${id}`, {
		method: 'PUT',
		body: JSON.stringify(payload),
	}, token)
}

export async function deleteExpense(id, token) {
	return callApi(`/expenses/${id}`, {
		method: 'DELETE',
	}, token)
}

export async function getAnalytics(range = 'month', token) {
	return callApi(`/analytics?range=${encodeURIComponent(range)}`, {
		method: 'GET',
	}, token)
}

// Receipt API calls
export async function uploadReceipt(file, token) {
	if (!BASE) {
		return { error: 'no-backend' }
	}
	
	const url = BASE.replace(/\/$/, '') + '/receipts/upload'
	const form = new FormData()
	form.append('receipt', file)

	try {
		let authToken = token
		if (typeof token === 'function') {
			authToken = await token()
		}

		const headers = {}
		if (authToken) {
			headers['Authorization'] = `Bearer ${authToken}`
		}

		const res = await fetch(url, {
			method: 'POST',
			headers,
			body: form,
		})

		if (!res.ok) {
			const text = await res.text()
			return { error: text || res.statusText }
		}
		return res.json()
	} catch (err) {
		return { error: err.message }
	}
}

export async function getReceipts(page = 1, token) {
	if (!BASE) return { receipts: [], pagination: {} }
	return callApi(`/receipts?page=${page}`, {
		method: 'GET',
	}, token)
}

// Category API calls
export async function getCategories(token) {
	const res = await callApi('/categories', {
		method: 'GET',
	}, token)
	
	// If backend fails, return hardcoded categories as fallback
	if (res?.error) {
		return {
			categories: [
				'Food & Dining',
				'Transportation',
				'Shopping',
				'Entertainment',
				'Bills & Utilities',
				'Health & Fitness',
				'Education',
				'Other'
			]
		}
	}
	
	return res
}

// Chat API calls
export async function sendChatMessage(message, token) {
	return callApi('/chat', {
		method: 'POST',
		body: JSON.stringify({ message }),
	}, token)
}

export default { getExpenses, createExpense, updateExpense, deleteExpense, getAnalytics }
