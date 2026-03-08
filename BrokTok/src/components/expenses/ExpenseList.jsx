import React, { useEffect, useState } from 'react'
import useExpenses from '../../hooks/useExpenses'
import { FaEdit, FaTrash, FaFilter, FaDownload } from 'react-icons/fa'

export default function Expense() {
	const { transactions, loading, error, deleteExpenseItem, loadExpenses } = useExpenses()
	const [filteredTransactions, setFilteredTransactions] = useState([])
	const [selectedCategory, setSelectedCategory] = useState('all')
	const [sortBy, setSortBy] = useState('date-desc')
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

	useEffect(() => {
		loadExpenses()
	}, [])

	useEffect(() => {
		let filtered = transactions

		// Filter by category
		if (selectedCategory !== 'all') {
			filtered = filtered.filter(t => t.category === selectedCategory)
		}

		// Sort
		const sorted = [...filtered].sort((a, b) => {
			if (sortBy === 'date-desc') {
				return new Date(b.date || b.created_at) - new Date(a.date || a.created_at)
			} else if (sortBy === 'date-asc') {
				return new Date(a.date || a.created_at) - new Date(b.date || b.created_at)
			} else if (sortBy === 'amount-desc') {
				return b.amount - a.amount
			} else if (sortBy === 'amount-asc') {
				return a.amount - b.amount
			}
			return 0
		})

		setFilteredTransactions(sorted)
	}, [transactions, selectedCategory, sortBy])

	const handleDelete = async (id) => {
		try {
			await deleteExpenseItem(id)
			setShowDeleteConfirm(null)
		} catch (err) {
			console.error('Delete failed:', err)
		}
	}

	const categories = ['all', ...new Set(transactions.map(t => t.category || 'Other'))]

	const exportCSV = () => {
		const headers = ['Date', 'Category', 'Description', 'Amount']
		const rows = filteredTransactions.map(t => [
			t.date || t.created_at || '',
			t.category || 'Other',
			t.description || '',
			t.amount
		])

		const csv = [headers, ...rows]
			.map(row => row.map(cell => `"${cell}"`).join(','))
			.join('\n')

		const blob = new Blob([csv], { type: 'text/csv' })
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`
		a.click()
		window.URL.revokeObjectURL(url)
	}

	if (loading) {
		return (
			<div className="space-y-3">
				{[1, 2, 3].map(i => (
					<div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 animate-pulse">
						<div className="h-4 bg-white/10 rounded w-24 mb-2" />
						<div className="h-4 bg-white/10 rounded w-32" />
					</div>
				))}
			</div>
		)
	}

	if (error) {
		return (
			<div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-200">
				<p className="font-semibold">Error loading expenses</p>
				<p className="text-sm">{error}</p>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{/* Controls */}
			<div className="flex flex-wrap gap-3 items-center">
				<div className="flex items-center gap-2">
					<FaFilter className="text-gray-400" />
					<select
						value={selectedCategory}
						onChange={(e) => setSelectedCategory(e.target.value)}
						className="bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
					>
						{categories.map(cat => (
							<option key={cat} value={cat} className="bg-gray-900">
								{cat.charAt(0).toUpperCase() + cat.slice(1)}
							</option>
						))}
					</select>
				</div>

				<select
					value={sortBy}
					onChange={(e) => setSortBy(e.target.value)}
					className="bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
				>
					<option value="date-desc" className="bg-gray-900">Latest First</option>
					<option value="date-asc" className="bg-gray-900">Oldest First</option>
					<option value="amount-desc" className="bg-gray-900">Highest Amount</option>
					<option value="amount-asc" className="bg-gray-900">Lowest Amount</option>
				</select>

				<button
					onClick={exportCSV}
					className="ml-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm transition"
				>
					<FaDownload /> Export CSV
				</button>
			</div>

			{/* List */}
			{filteredTransactions.length === 0 ? (
				<div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
					<p className="text-gray-400">No expenses found</p>
				</div>
			) : (
				<div className="space-y-2">
					{filteredTransactions.map(tx => (
						<div
							key={tx.id}
							className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-center hover:bg-white/8 transition"
						>
							<div className="flex-1">
								<div className="flex items-center gap-3">
									<div className="w-2 h-2 rounded-full bg-indigo-500" />
									<div>
										<p className="text-white font-medium">{tx.description || 'Expense'}</p>
										<p className="text-gray-400 text-sm">
											{tx.category || 'Other'} • {tx.date || tx.created_at}
										</p>
									</div>
								</div>
							</div>

							<div className="flex items-center gap-4">
								<div className="text-right">
									<p className="text-white font-semibold">${tx.amount?.toFixed(2) || '0.00'}</p>
								</div>
								<div className="flex gap-2">
									<button
										onClick={() => alert('Edit feature coming soon')}
										className="text-gray-400 hover:text-indigo-400 transition"
									>
										<FaEdit />
									</button>
									<button
										onClick={() => setShowDeleteConfirm(tx.id)}
										className="text-gray-400 hover:text-red-400 transition"
									>
										<FaTrash />
									</button>
								</div>
							</div>

							{showDeleteConfirm === tx.id && (
								<div className="absolute bg-gray-900 border border-white/10 rounded-lg p-4 right-0 top-0 z-50">
									<p className="text-white mb-3">Delete this expense?</p>
									<div className="flex gap-2">
										<button
											onClick={() => handleDelete(tx.id)}
											className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
										>
											Delete
										</button>
										<button
											onClick={() => setShowDeleteConfirm(null)}
											className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition"
										>
											Cancel
										</button>
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	)
}