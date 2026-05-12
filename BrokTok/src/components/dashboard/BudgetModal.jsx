import { useState, useEffect } from "react";
import { X, Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import * as api from "../../services/api";

export default function BudgetModal({ isOpen, onClose, onBudgetCreated }) {
  const { getToken } = useAuth();
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: "",
    budgetLimit: "",
    period: "monthly",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Load categories and budgets
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      // Fetch categories
      const catRes = await api.getCategories(token);
      if (catRes?.data?.categories) {
        setCategories(catRes.data.categories);
      }
      // Fetch budgets
      const budRes = await api.getBudgets(token);
      if (budRes?.data?.budgets) {
        setBudgets(budRes.data.budgets);
      }
    } catch (err) {
      setError("Failed to load data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.categoryId || !formData.budgetLimit) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const token = await getToken();
      let res;

      if (editingId) {
        // Update budget
        res = await api.updateBudget(
          editingId,
          {
            budgetLimit: parseFloat(formData.budgetLimit),
            period: formData.period,
          },
          token
        );
      } else {
        // Create budget
        res = await api.createBudget(
          formData.categoryId,
          parseFloat(formData.budgetLimit),
          formData.period,
          token
        );
      }

      if (res?.success) {
        setSuccess(
          editingId ? "Budget updated successfully!" : "Budget created successfully!"
        );
        setFormData({ categoryId: "", budgetLimit: "", period: "monthly" });
        setEditingId(null);
        setShowForm(false);
        await loadData();
        onBudgetCreated?.();
      } else {
        setError(res?.error || "Failed to save budget");
      }
    } catch (err) {
      setError("Error saving budget: " + err.message);
    }
  };

  const handleEdit = (budget) => {
    setEditingId(budget._id);
    setFormData({
      categoryId: budget.categoryId?._id || budget.categoryId,
      budgetLimit: budget.budgetLimit.toString(),
      period: budget.period,
    });
    setShowForm(true);
  };

  const handleDelete = async (budgetId) => {
    if (!window.confirm("Delete this budget?")) return;

    try {
      const token = await getToken();
      const res = await api.deleteBudget(budgetId, token);

      if (res?.success) {
        setSuccess("Budget deleted successfully!");
        await loadData();
        onBudgetCreated?.();
      } else {
        setError(res?.error || "Failed to delete budget");
      }
    } catch (err) {
      setError("Error deleting budget: " + err.message);
    }
  };

  const getCategoryName = (categoryId) => {
    return categories.find((c) => c._id === categoryId)?.name || "Unknown";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Budget Management</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-sm text-green-700">✓ {success}</span>
            </div>
          )}

          {/* Form Section */}
          {showForm && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">
                {editingId ? "Edit Budget" : "Create New Budget"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    disabled={editingId !== null}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Limit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budgetLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, budgetLimit: e.target.value })
                    }
                    placeholder="Enter budget amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) =>
                      setFormData({ ...formData, period: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
                  >
                    {editingId ? "Update Budget" : "Create Budget"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({
                        categoryId: "",
                        budgetLimit: "",
                        period: "monthly",
                      });
                      setError("");
                    }}
                    className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Budgets List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Your Budgets ({budgets.length})
              </h3>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Budget
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : budgets.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No budgets set yet.</p>
                <p className="text-sm mt-1">Create one to track your spending!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {budgets.map((budget) => {
                  const categoryName = getCategoryName(budget.categoryId?._id || budget.categoryId);
                  return (
                    <div
                      key={budget._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{categoryName}</p>
                        <p className="text-sm text-gray-600">
                          ₹{budget.budgetLimit.toLocaleString()} per {budget.period}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(budget)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(budget._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
