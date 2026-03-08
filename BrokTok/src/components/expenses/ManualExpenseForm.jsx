import React, { useState, useEffect } from 'react'
import useExpenses from '../../hooks/useExpenses'
import * as api from '../../services/api'
import useAuth from '../../hooks/useAuth'
import { FaPlus, FaTimes } from 'react-icons/fa'

export default function ManualExpenseForm({ onSuccess }) {
	const { getToken } = useAuth() || {}
	const { addExpense } = useExpenses()
	const [isOpen, setIsOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [categories, setCategories] = useState([])

	const [formData, setFormData] = useState({
		description: '',
		amount: '',
		category: '',
		date: new Date().toISOString().split('T')[0]
	})

	// Fetch categories when modal opens
	useEffect(() => {
		if (isOpen && getToken) {
			loadCategories()
		}
	}, [isOpen, getToken])

	const loadCategories = async () => {
		try {
			const res = await api.getCategories(getToken)
			const cats = res?.categories || res?.data || [
				'Food & Dining',
				'Transportation',
				'Shopping',
				'Entertainment',
				'Bills & Utilities',
				'Health & Fitness',
				'Education',
				'Other'
			]
			setCategories(cats)
		} catch (err) {
			console.error('Failed to load categories:', err)
			setCategories([
				'Food & Dining',
				'Transportation',
				'Shopping',
				'Entertainment',
				'Bills & Utilities',
				'Health & Fitness',
				'Education',
				'Other'
			])
		}
	}

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError(null)

		if (!formData.description.trim()) {
			setError('Description is required')
			return
		}
		if (!formData.amount || parseFloat(formData.amount) <= 0) {
			setError('Valid amount is required')
			return
		}
		if (!formData.category) {
			setError('Category is required')
			return
		}

		setLoading(true)
		try {
			console.log('Submitting expense form:', formData)
			await addExpense({
				description: formData.description.trim(),
				amount: parseFloat(formData.amount),
				category: formData.category,
				date: formData.date
			})
			console.log('Expense added successfully')
			setFormData({
				description: '',
				amount: '',
				category: '',
				date: new Date().toISOString().split('T')[0]
			})
			setIsOpen(false)
			if (onSuccess) {
				console.log('Calling onSuccess callback')
				onSuccess()
			}
		} catch (err) {
			console.error('Error adding expense:', err)
			setError(err.message || 'Failed to create expense')
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			{/* Button to open form */}
			<button
				onClick={() => setIsOpen(true)}
				className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
			>
				<FaPlus /> Add Expense
			</button>

			{/* Modal */}
			{isOpen && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
					<div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
						{/* Header */}
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-white text-2xl font-bold">Add Expense</h2>
							<button
								onClick={() => setIsOpen(false)}
								className="text-gray-400 hover:text-white transition"
							>
								<FaTimes size={24} />
							</button>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Error Alert */}
							{error && (
								<div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
									<p className="text-red-200 text-sm">{error}</p>
								</div>
							)}

							{/* Description */}
							<div>
								<label className="block text-gray-300 text-sm font-medium mb-2">
									Description
								</label>
								<input
									type="text"
									name="description"
									value={formData.description}
									onChange={handleChange}
									placeholder="e.g., Grocery shopping"
									className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-indigo-500 transition"
								/>
							</div>

							{/* Amount */}
							<div>
								<label className="block text-gray-300 text-sm font-medium mb-2">
									Amount ($)
								</label>
								<input
									type="number"
									name="amount"
									value={formData.amount}
									onChange={handleChange}
									placeholder="0.00"
									step="0.01"
									min="0"
									className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-indigo-500 transition"
								/>
							</div>

							{/* Category */}
							<div>
								<label className="block text-gray-300 text-sm font-medium mb-2">
									Category
								</label>
								<select
									name="category"
									value={formData.category}
									onChange={handleChange}
									className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-indigo-500 transition"
								>
									<option value="" className="bg-gray-900">Select a category</option>
									{categories.map(cat => (
										<option key={cat} value={cat} className="bg-gray-900">
											{typeof cat === 'string' ? cat : cat.name}
										</option>
									))}
								</select>
							</div>

							{/* Date */}
							<div>
								<label className="block text-gray-300 text-sm font-medium mb-2">
									Date
								</label>
								<input
									type="date"
									name="date"
									value={formData.date}
									onChange={handleChange}
									className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-indigo-500 transition"
								/>
							</div>

							{/* Buttons */}
							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={loading}
									className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
								>
									{loading ? 'Creating...' : 'Create'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	)
};
