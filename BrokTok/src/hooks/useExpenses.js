import { useState, useCallback } from 'react'
import useAuth from './useAuth'
import * as api from '../services/api'
export default function useExpenses() {
	const { getToken } = useAuth() || {}
	const [transactions, setTransactions] = useState([])
	const [categories, setCategories] = useState([])
	const [chartData, setChartData] = useState([])
	const [stats, setStats] = useState({ totalSpent: 0, dailyAverage: 0, transactions: 0, savingsGoal: 0 })
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const loadExpenses = useCallback(async () => {
		if (!getToken) {
			console.error('❌ useExpenses: getToken not available')
			return
		}
		setLoading(true)
		setError(null)
		try {
			console.log('📍 [useExpenses.loadExpenses] Starting API call...')
			const token = await getToken()
			console.log('🔑 [useExpenses.loadExpenses] Got token?', !!token, 'length:', token?.length || 0)
			if (!token) {
				console.error('❌ [useExpenses.loadExpenses] Token is null/undefined!')
				setError('Not authenticated - please login')
				setLoading(false)
				return
			}
			console.log('📤 [useExpenses.loadExpenses] Calling api.getExpenses with valid token...')
			const res = await api.getExpenses(token)
			console.log('📥 [useExpenses.loadExpenses] API response:', res)
			if (res?.error) {
				setError(res.error)
				setLoading(false)
				return
			}
			const tx = Array.isArray(res?.data?.expenses)
				? res.data.expenses
				: Array.isArray(res?.data)
				? res.data
				: []
			if (!Array.isArray(tx)) {
				console.warn('Transactions is not an array:', tx)
				setLoading(false)
				return
			}
			setTransactions(tx)
			const total = tx.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0)
			const avg = tx.length > 0 ? total / Math.min(tx.length, 30) : 0
			setStats({ 
				totalSpent: total, 
				dailyAverage: avg, 
				transactions: tx.length, 
				savingsGoal: 0 
			})
			const catMap = {}
			tx.forEach(t => {
				const c = t.categoryId?.name || t.category || 'Other'
				if (!catMap[c]) catMap[c] = { name: c, amount: 0, count: 0 }
				const amount = parseFloat(t.amount) || 0
				catMap[c].amount += amount
				catMap[c].count += 1
			})
			const cats = Object.values(catMap)
			setCategories(cats)
			// simple chart data: group by date
			const byDate = {}
			tx.forEach(t => {
				const d = t.date ? new Date(t.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
				if (!byDate[d]) byDate[d] = 0
				const amount = parseFloat(t.amount) || 0
				byDate[d] += amount
			})
			const chart = Object.keys(byDate)
				.sort()
				.map(k => ({ name: k, amount: byDate[k] }))
			setChartData(chart)

			console.log('Expenses loaded successfully:', { transactionCount: tx.length, total, categories: cats.length })
		} catch (err) {
			console.error('loadExpenses error:', err)
			setError(err?.message || 'Failed to load expenses')
		} finally {
			setLoading(false)
		}
	}, [getToken])
	const addExpense = useCallback(async (payload) => {
		if (!getToken) {
			throw new Error('Authentication required')
		}
		try {
			console.log('📍 [useExpenses.addExpense] Starting...')
			const token = await getToken()  // ✅ Await token first
			console.log('🔑 [useExpenses.addExpense] Got token?', !!token, 'length:', token?.length || 0)
			
			if (!token) {
				console.error('❌ [useExpenses.addExpense] Token is null/undefined!')
				throw new Error('Failed to get authentication token')
			}
			
			console.log('📤 [useExpenses.addExpense] Calling api.createExpense...')
			const res = await api.createExpense(payload, token)  // ✅ Pass resolved token
			console.log('📥 [useExpenses.addExpense] API response:', res)
			
			if (res?.error) {
				throw new Error(res.error)
			}
			await loadExpenses()
			return res?.data || res
		} catch (err) {
			console.error('❌ [useExpenses.addExpense] error:', err)
			throw err
		}
	}, [getToken, loadExpenses])
	const updateExpenseItem = useCallback(async (id, payload) => {
		if (!getToken) {
			throw new Error('Authentication required')
		}
		try {
			console.log('📍 [useExpenses.updateExpenseItem] Updating expense:', id)
			const token = await getToken()  // ✅ Await token
			if (!token) {
				throw new Error('Failed to get authentication token')
			}
			
			const res = await api.updateExpense(id, payload, token)
			if (res?.error) {
				throw new Error(res.error)
			}
			await loadExpenses()
			return res?.data || res
		} catch (err) {
			console.error('❌ [useExpenses.updateExpenseItem] error:', err)
			throw err
		}
	}, [getToken, loadExpenses])
	const deleteExpenseItem = useCallback(async (id) => {
		if (!getToken) {
			throw new Error('Authentication required')
		}
		try {
			console.log('📍 [useExpenses.deleteExpenseItem] Deleting expense:', id)
			const token = await getToken()  // ✅ Await token
			if (!token) {
				throw new Error('Failed to get authentication token')
			}
			const res = await api.deleteExpense(id, token)
			if (res?.error) {
				throw new Error(res.error)
			}
			await loadExpenses()
			return { ok: true }
		} catch (err) {
			console.error('❌ [useExpenses.deleteExpenseItem] error:', err)
			throw err
		}
	}, [getToken, loadExpenses])
	return { 
		transactions, 
		categories, 
		chartData, 
		stats, 
		loading,
		error,
		loadExpenses, 
		addExpense,
		updateExpenseItem,
		deleteExpenseItem 
	}
}