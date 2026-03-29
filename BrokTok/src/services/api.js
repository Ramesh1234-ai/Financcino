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

/**
 * Compress image before upload to reduce transfer time
 * @param {File} file - Image file
 * @param {number} maxWidth - Max width in pixels
 * @param {number} quality - Quality 0-1
 * @returns {Promise<Blob>}
 */
async function compressImage(file, maxWidth = 1200, quality = 0.8) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = (event) => {
			const img = new Image();
			img.src = event.target.result;
			img.onload = () => {
				const canvas = document.createElement('canvas');
				let width = img.width;
				let height = img.height;

				// Scale down if width exceeds maxWidth
				if (width > maxWidth) {
					height = (height * maxWidth) / width;
					width = maxWidth;
				}

				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, width, height);

				canvas.toBlob(
					(blob) => {
						console.log(`📦 [compressImage] Compressed ${(file.size / 1024).toFixed(2)}KB ➜ ${(blob.size / 1024).toFixed(2)}KB`);
						resolve(blob);
					},
					'image/jpeg',
					quality
				);
			};
			img.onerror = reject;
		};
		reader.onerror = reject;
	});
}

export async function uploadReceipt(file, token) {
	if (!BASE) {
		return { error: 'no-backend' };
	}

	console.log('📸 [uploadReceipt] Starting upload:', {
		fileName: file.name,
		fileSize: (file.size / 1024).toFixed(2) + 'KB',
		fileType: file.type
	});

	const url = BASE.replace(/\/$/, '') + '/receipts/upload';

	try {
		// Step 1: Resolve token
		let authToken = null;
		if (typeof token === 'function') {
			try {
				authToken = await token();
				if (!authToken) {
					console.warn('❌ [uploadReceipt] getToken() returned null');
					return { success: false, error: 'Failed to get auth token' };
				}
			} catch (err) {
				console.warn('❌ [uploadReceipt] Failed to get token:', err.message);
				return { success: false, error: 'Failed to get auth token' };
			}
		} else if (typeof token === 'string') {
			authToken = token;
		}
		console.log('✅ [uploadReceipt] Token resolved');
		// Step 2: Compress image if it's too large
		let uploadFile = file;
		if (file.size > 2 * 1024 * 1024) {
			console.log('📦 [uploadReceipt] File too large, compressing...');
			const compressedBlob = await compressImage(file, 1200, 0.75);
			uploadFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
			console.log('📦 [uploadReceipt] Compression complete');
		}
		// Step 3: Create form data
		const form = new FormData();
		form.append('receipt', uploadFile);
		// Step 4: Prepare headers
		const headers = {};
		if (authToken) {
			headers['Authorization'] = `Bearer ${authToken}`;
			console.log('🔐 [uploadReceipt] Authorization header set');
		} else {
			console.warn('⚠️  [uploadReceipt] NO Authorization header');
		}

		// Step 5: Send request with extended timeout
		// OCR + Gemini can take up to 30 seconds, so we allow 60 seconds total
		const controller = new AbortController();
		const timeoutMs = 60000; // 60 seconds for OCR processing
		const timeoutId = setTimeout(() => {
			console.error(`⏱️  [uploadReceipt] Request timeout after ${timeoutMs / 1000}s`);
			controller.abort();
		}, timeoutMs);
		console.log(`⏱️  [uploadReceipt] Sending request (timeout: ${timeoutMs / 1000}s)...`);
		const startTime = Date.now();
		const res = await fetch(url, {
			method: 'POST',
			headers,
			body: form,
			signal: controller.signal
		});
		const elapsed = Date.now() - startTime;
		clearTimeout(timeoutId);
		console.log(`✅ [uploadReceipt] Response received after ${elapsed}ms`, {
			status: res.status,
			statusText: res.statusText
		});

		// Step 6: Parse response
		if (!res.ok) {
			const text = await res.text();
			console.error('❌ [uploadReceipt] Server error:', res.status, text);
			return {
				success: false,
				error: text || res.statusText,
				statusCode: res.status
			};
		}

		const data = await res.json();
		console.log('✅ [uploadReceipt] Success:', {
			receiptId: data.data?.receipt?.id,
			expenseId: data.data?.expense?.id,
			amount: data.data?.expense?.amount,
			duration: elapsed + 'ms'
		});
		return { success: true, ...data };
	} catch (err) {
		if (err.name === 'AbortError') {
			console.error('❌ [uploadReceipt] Request timeout - OCR processing took too long');
			return {
				success: false,
				error: 'Request timeout (OCR processing taking too long)',
				code: 'TIMEOUT'
			};
		}

		console.error('❌ [uploadReceipt] Network error:', err.message);
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
