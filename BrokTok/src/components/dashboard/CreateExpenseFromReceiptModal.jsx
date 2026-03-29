import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import * as api from '../../services/api'
import useAuth from '../../hooks/useAuth'

export default function CreateExpenseFromReceiptModal({ receipt, onClose, onCreate, loading }) {
  const { getToken } = useAuth()
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    title: receipt?.merchant || 'Receipt expense',
    description: receipt?.extractedData?.text || '',
    amount: receipt?.extractedData?.total || '',
    categoryId: '',
    date: receipt?.date || new Date().toISOString().split('T')[0],
  })

  const [error, setError] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const token = await getToken()
      const res = await api.getCategories(token)
      const cats = res?.data?.categories || []
      setCategories(cats)
      if (cats.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: cats[0]._id }))
      }
    } catch (err) {
      console.error('Failed to load categories', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (!formData.date) {
      setError('Date is required')
      return
    }

    try {
      await onCreate({
        description: formData.title.trim(),
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId,
        date: formData.date,
        notes: formData.description.trim(),
      })
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to create expense')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Create Expense from Receipt</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Receipt Preview Info */}
        {receipt?.image && (
          <div className="p-6 bg-gray-50 border-b">
            <div className="flex gap-4 items-start">
              <img
                src={receipt.fileUrl || receipt.image}
                alt="receipt"
                className="w-20 h-20 object-cover rounded"
              />
              <div className="text-sm text-gray-600 flex-1">
                <p className="font-medium text-gray-800">{receipt.merchant}</p>
                <p className="text-xs">{receipt.date}</p>
                {receipt.extractedData?.total && (
                  <p className="font-semibold mt-1">₹{receipt.extractedData.total.toFixed(2)}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expense Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Lunch at Cafe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add notes..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
