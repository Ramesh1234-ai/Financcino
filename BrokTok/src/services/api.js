// Clerk token-based API service
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * Enhanced API call helper that supports Clerk authentication
 * @param {string} path - API endpoint path (e.g., '/expenses')
 * @param {object} options - Fetch options
 * @param {string|Function} token - Token string OR getToken() function from useAuth
 * @returns {Promise<object>} API response
 */
async function callApi(path, options = {}, token = null) {
	const url = BASE.replace(/\/$/, '') + path
	try {
		// Resolve token if it's a function (Clerk's getToken)
		let authToken = null
		
		if (typeof token === 'function') {
			try {
				authToken = await token()
				if (authToken) {
					console.debug('✅ [callApi] Token resolved from function:', authToken.slice(0, 20) + '...')
				} else {
					console.warn('⚠️  [callApi] getToken() returned null for:', path)
				}
			} catch (err) {
				console.warn('❌ [callApi] Failed to resolve Clerk token:', err.message)
				authToken = null
			}
		} else if (typeof token === 'string' && token.length > 0) {
			authToken = token
			console.debug('✅ [callApi] Token passed as string:', token.slice(0, 20) + '...')
		} else if (token) {
			console.warn('⚠️  [callApi] Unexpected token type:', typeof token)
		}

		// Build headers with auth if token exists
		// IMPORTANT: Only set Content-Type for JSON requests, NOT for FormData
		const headers = {
			...options.headers,
		}

		// Only add Content-Type if body is NOT FormData
		if (!(options.body instanceof FormData)) {
			headers['Content-Type'] = 'application/json'
		}

		// Always add Authorization header if token is present
		if (authToken) {
			headers['Authorization'] = `Bearer ${authToken}`
			console.log(`🔐 [callApi] ${options.method || 'GET'} ${path} - Authorization header set ✓`)
		} else {
			console.warn(`⚠️  [callApi] ${options.method || 'GET'} ${path} - NO Authorization header (route may require auth)`)
		}

		// Make request with timeout (increased to 30s for file uploads)
		const controller = new AbortController()
		const timeoutMs = path.includes('/receipts') ? 30000 : 15000
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

		const res = await fetch(url, {
			...options,
			headers,
			signal: controller.signal,
		})

		clearTimeout(timeoutId)

		// Handle non-OK responses
		if (!res.ok) {
			try {
				const errorData = await res.json()
				console.error(`❌ [callApi] ${options.method || 'GET'} ${path} - ${res.status}:`, errorData)
				return {
					success: false,
					error: errorData.error || errorData.message || errorData,
					statusCode: res.status,
					details: errorData
				}
			} catch {
				const text = await res.text()
				console.error(`❌ [callApi] ${options.method || 'GET'} ${path} - ${res.status}:`, text)
				return {
					success: false,
					error: text || res.statusText,
					statusCode: res.status
				}
			}
		}

		// Parse successful response
		try {
			const data = await res.json()
			console.debug(`✅ [callApi] ${options.method || 'GET'} ${path} - Success`)
			return data
		} catch {
			// Some endpoints return empty body on success
			console.debug(`✅ [callApi] ${options.method || 'GET'} ${path} - Success (empty body)`)
			return { success: true }
		}
	} catch (err) {
		if (err.name === 'AbortError') {
			console.error(`❌ [callApi] ${options.method || 'GET'} ${path} - Request timeout (15s)`)
			return { error: 'Request timeout - server may be unreachable', statusCode: 0 }
		}

		console.error(`❌ [callApi] ${options.method || 'GET'} ${path} - Network error:`, {
			message: err.message,
			type: err.name,
		})
		return {
			error: err.message || 'Network error - is the backend running?',
			statusCode: 0
		}
	}
}

// ==================== EXPENSE API ====================
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

// ==================== ANALYTICS API ====================
export async function getAnalytics(range = 'month', token) {
	return callApi(`/analytics?range=${encodeURIComponent(range)}`, {
		method: 'GET',
	}, token)
}

// ==================== RECEIPT API ====================
export async function uploadReceipt(file, token) {
	if (!BASE) {
		return { error: 'no-backend' }
	}

	const url = BASE.replace(/\/$/, '') + '/receipts/upload'
	const form = new FormData()
	form.append('receipt', file)

	try {
		// Resolve token if it's a function
		let authToken = null
		if (typeof token === 'function') {
			try {
				authToken = await token()
				if (!authToken) {
					console.warn('❌ [uploadReceipt] getToken() returned null')
					return { success: false, error: 'Failed to get auth token' }
				}
			} catch (err) {
				console.warn('❌ [uploadReceipt] Failed to get token:', err.message)
				return { success: false, error: 'Failed to get auth token' }
			}
		} else if (typeof token === 'string') {
			authToken = token
		}

		const headers = {}
		if (authToken) {
			headers['Authorization'] = `Bearer ${authToken}`
			console.log('🔐 [uploadReceipt] Authorization header set ✓')
		} else {
			console.warn('⚠️  [uploadReceipt] NO Authorization header - request will fail')
		}

		// Don't set Content-Type for FormData - browser will set it with boundary
		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), 30000)

		const res = await fetch(url, {
			method: 'POST',
			headers,
			body: form,
			signal: controller.signal
		})

		clearTimeout(timeoutId)

		if (!res.ok) {
			const text = await res.text()
			console.error('❌ [uploadReceipt] Error:', res.status, text)
			return { success: false, error: text || res.statusText, statusCode: res.status }
		}

		const data = await res.json()
		console.log('✅ [uploadReceipt] Success:', data)
		return { success: true, ...data }
	} catch (err) {
		if (err.name === 'AbortError') {
			console.error('❌ [uploadReceipt] Request timeout')
			return { success: false, error: 'Request timeout' }
		}
		console.error('❌ [uploadReceipt] Network error:', err.message)
		return { success: false, error: err.message }
	}
}

export async function getReceipts(page = 1, token) {
	if (!BASE) return { data: [], pagination: {} }
	return callApi(`/receipts?page=${page}`, {
		method: 'GET',
	}, token)
}

export async function deleteReceipt(id, token) {
	if (!id) {
		return { error: 'Receipt id is required' }
	}
	return callApi(`/receipts/${id}`, {
		method: 'DELETE',
	}, token)
}

// ==================== CATEGORY API ====================
export async function getCategories(token) {
	console.log('📂 [getCategories] Fetching categories with token:', token ? '✓' : '✗')
	const res = await callApi('/categories', {
		method: 'GET',
	}, token)
	console.log('📂 [getCategories] Response:', res)
	return res
}

// ==================== CHAT API ====================
export async function sendChatMessage(message, token) {
	console.log('💬 [sendChatMessage] Sending message with token:', token ? '✓' : '✗')
	const res = await callApi('/chat/send', {
		method: 'POST',
		body: JSON.stringify({ message }),
	}, token)
	console.log('💬 [sendChatMessage] Response:', res)
	return res
}

export async function createCategory(payload, token) {
	console.log('📂 [createCategory] Creating category with token:', token ? '✓' : '✗')
	return callApi('/categories', {
		method: 'POST',
		body: JSON.stringify(payload),
	}, token)
}

export async function updateCategory(id, payload, token) {
	console.log('📂 [updateCategory] Updating category:', id)
	return callApi(`/categories/${id}`, {
		method: 'PUT',
		body: JSON.stringify(payload),
	}, token)
}

export async function deleteCategory(id, token) {
	console.log('📂 [deleteCategory] Deleting category:', id)
	return callApi(`/categories/${id}`, {
		method: 'DELETE',
	}, token)
}

export default { getExpenses, createExpense, updateExpense, deleteExpense, getAnalytics, getCategories, sendChatMessage, uploadReceipt, getReceipts, deleteReceipt }
