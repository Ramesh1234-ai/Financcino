import { useState, useEffect } from "react";
import { X, Plus, Edit2, Trash2, AlertCircle, Target } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import * as api from "../../services/api";

export default function SavingsGoalModal({ isOpen, onClose, onSavingsUpdated }) {
  const { getToken } = useAuth();
  const [savingsGoal, setSavingsGoal] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [goalData, setGoalData] = useState(null);
  // Load savings goal on open
  useEffect(() => {
    if (isOpen) {
      loadSavingsGoal();
    }
  }, [isOpen]);
  const loadSavingsGoal = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const res = await api.getSavingsGoal(token);
      if (res?.data) {
        setGoalData(res.data);
        setSavingsGoal(res.data.savingsGoal?.toString() || "");
        setCurrentSavings(res.data.currentSavings?.toString() || "");
      }
    } catch (err) {
      setError("Failed to load savings goal: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSetGoal = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!savingsGoal) {
      setError("Please enter a savings goal amount");
      return;
    }
    const goal = parseFloat(savingsGoal);
    if (isNaN(goal) || goal < 0) {
      setError("Please enter a valid amount");
      return;
    }
    try {
      const token = await getToken();
      const res = await api.setSavingsGoal(goal, parseFloat(currentSavings || 0), token);
      if (res?.success) {
        setSuccess("Savings goal set successfully!");
        await loadSavingsGoal();
        setShowForm(false);
        onSavingsUpdated?.();
      } else {
        setError(res?.error || "Failed to set savings goal");
      }
    } catch (err) {
      setError("Error setting goal: " + err.message);
    }
  };
  const handleUpdateCurrentSavings = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!currentSavings) {
      setError("Please enter current savings amount");
      return;
    }
    const savings = parseFloat(currentSavings);
    if (isNaN(savings) || savings < 0) {
      setError("Please enter a valid amount");
      return;
    }
    try {
      const token = await getToken();
      const res = await api.updateCurrentSavings(savings, token);
      if (res?.success) {
        setSuccess("Current savings updated!");
        await loadSavingsGoal();
        onSavingsUpdated?.();
      } else {
        setError(res?.error || "Failed to update savings");
      }
    } catch (err) {
      setError("Error updating savings: " + err.message);
    }
  };
  const handleDeleteGoal = async () => {
    if (!window.confirm("Delete this savings goal?")) return;

    try {
      const token = await getToken();
      const res = await api.deleteSavingsGoal(token);

      if (res?.success) {
        setSuccess("Savings goal deleted!");
        setSavingsGoal("");
        setCurrentSavings("");
        setGoalData(null);
        setShowForm(false);
        await loadSavingsGoal();
        onSavingsUpdated?.();
      } else {
        setError(res?.error || "Failed to delete savings goal");
      }
    } catch (err) {
      setError("Error deleting goal: " + err.message);
    }
  };
  const goal = parseFloat(goalData?.savingsGoal || 0);
  const current = parseFloat(goalData?.currentSavings || 0);
  const progress = goal > 0 ? (current / goal) * 100 : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Savings Goals
          </h2>
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

          {/* Current Goal Display */}
          {goal > 0 && !showForm && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Savings Goal</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₹{goal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Savings</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    ₹{current.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Progress</p>
                    <p className="text-sm font-semibold text-indigo-600">{progress.toFixed(1)}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ₹{(goal - current).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Goal
                  </button>
                  <button
                    onClick={handleDeleteGoal}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Section */}
          {showForm && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
              <h3 className="font-semibold text-gray-900">
                {goal > 0 ? "Update Savings Goal" : "Create Savings Goal"}
              </h3>

              {/* Goal Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Savings Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(e.target.value)}
                  placeholder="Enter target amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Current Savings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Savings (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(e.target.value)}
                  placeholder="Enter current savings (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSetGoal}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  {goal > 0 ? "Update Goal" : "Create Goal"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSavingsGoal(goalData?.savingsGoal?.toString() || "");
                    setCurrentSavings(goalData?.currentSavings?.toString() || "");
                    setError("");
                  }}
                  className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* No Goal State */}
          {goal === 0 && !showForm && (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-1">No savings goal set yet</p>
              <p className="text-sm text-gray-500 mb-4">Create a goal to track your savings progress</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" />
                Set Savings Goal
              </button>
            </div>
          )}

          {/* Quick Update Current Savings */}
          {goal > 0 && !showForm && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Update</h3>
              <form onSubmit={handleUpdateCurrentSavings} className="space-y-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Update current savings amount..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  defaultValue={current}
                  onChange={(e) => setCurrentSavings(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full bg-indigo-100 text-indigo-600 py-2 rounded-lg font-medium hover:bg-indigo-200 transition"
                >
                  Update Savings
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
