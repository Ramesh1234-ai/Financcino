/**
 * React Frontend - Notification Settings Component
 * Add to: BrokTok/src/components/settings/NotificationSettings.jsx
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Toast from '../common/Toast';
import {
  Bell,
  Mail,
  AlertCircle,
  Check,
  Loader,
  Clock,
} from 'lucide-react';

export default function NotificationSettings() {
  const { authToken } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch preferences on mount
  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/notifications/preferences', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setPreferences(response.data.data);
    } catch (error) {
      setToast({
        message: 'Failed to load notification preferences',
        type: 'error',
      });
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    const updated = {
      ...preferences,
      [key]: !preferences[key],
    };

    setSaving(true);

    try {
      const response = await api.put('/api/notifications/preferences', updated, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setPreferences(response.data.data);
      setToast({
        message: 'Preferences updated successfully',
        type: 'success',
      });
    } catch (error) {
      setToast({
        message: 'Failed to update preferences',
        type: 'error',
      });
      console.error('Error updating preferences:', error);
      // Revert
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  const handleTimeChange = async (newTime) => {
    setSaving(true);

    try {
      const response = await api.put(
        '/api/notifications/preferences',
        { weeklyDigestTime: newTime },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setPreferences(response.data.data);
      setToast({
        message: 'Digest time updated',
        type: 'success',
      });
    } catch (error) {
      setToast({
        message: 'Failed to update time',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async (type) => {
    try {
      setSaving(true);
      await api.post(
        '/api/notifications/test',
        { type },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setToast({
        message: `Test ${type} email sent! Check your inbox.`,
        type: 'success',
      });
    } catch (error) {
      setToast({
        message: 'Failed to send test email',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!preferences) {
    return <div className="text-center text-red-500">Failed to load preferences</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-6 h-6 text-purple-500" />
          <h1 className="text-3xl font-bold">Notification Preferences</h1>
        </div>
        <p className="text-gray-500">
          Manage when and how you receive email notifications about your finances.
        </p>
      </div>

      <div className="space-y-6">
        {/* Budget Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Budget Alerts
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Get notified when spending approaches or exceeds your budget
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* 75% Alert */}
            <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
              <input
                type="checkbox"
                checked={preferences.budgetAlerts75}
                onChange={() => handleToggle('budgetAlerts75')}
                disabled={saving}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium">Alert at 75% of budget</p>
                <p className="text-sm text-gray-500">
                  Notified when you reach 3/4 of your budget limit
                </p>
              </div>
              {preferences.budgetAlerts75 && (
                <Check className="w-4 h-4 text-green-500 ml-auto" />
              )}
            </label>

            {/* 100% Alert */}
            <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
              <input
                type="checkbox"
                checked={preferences.budgetAlerts100}
                onChange={() => handleToggle('budgetAlerts100')}
                disabled={saving}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium">Alert when over budget</p>
                <p className="text-sm text-gray-500">
                  Notified when spending exceeds your budget limit
                </p>
              </div>
              {preferences.budgetAlerts100 && (
                <Check className="w-4 h-4 text-green-500 ml-auto" />
              )}
            </label>

            <button
              onClick={() => sendTestEmail('budget_alert')}
              disabled={saving}
              className="text-sm text-purple-500 hover:text-purple-600 mt-2"
            >
              Send test email →
            </button>
          </div>
        </div>

        {/* Receipt Confirmation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                Receipt Confirmations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Get confirmation when receipts are successfully processed
              </p>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
            <input
              type="checkbox"
              checked={preferences.receiptConfirmation}
              onChange={() => handleToggle('receiptConfirmation')}
              disabled={saving}
              className="w-4 h-4"
            />
            <div>
              <p className="font-medium">Email receipt confirmation</p>
              <p className="text-sm text-gray-500">
                Notified with extracted amount and category details
              </p>
            </div>
            {preferences.receiptConfirmation && (
              <Check className="w-4 h-4 text-green-500 ml-auto" />
            )}
          </label>

          <button
            onClick={() => sendTestEmail('receipt_confirmation')}
            disabled={saving}
            className="text-sm text-purple-500 hover:text-purple-600 mt-2"
          >
            Send test email →
          </button>
        </div>

        {/* Weekly Digest */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-500" />
                Weekly Summary
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Get a summary of your spending every Sunday
              </p>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded mb-3">
            <input
              type="checkbox"
              checked={preferences.weeklyDigest}
              onChange={() => handleToggle('weeklyDigest')}
              disabled={saving}
              className="w-4 h-4"
            />
            <div>
              <p className="font-medium">Send weekly digest</p>
              <p className="text-sm text-gray-500">
                Includes total spending, top categories, and savings progress
              </p>
            </div>
            {preferences.weeklyDigest && (
              <Check className="w-4 h-4 text-green-500 ml-auto" />
            )}
          </label>

          {preferences.weeklyDigest && (
            <div className="ml-7 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <label className="block text-sm font-medium mb-2">
                Send digest at:
              </label>
              <input
                type="time"
                value={preferences.weeklyDigestTime || '09:00'}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={saving}
                className="w-32 px-3 py-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">UTC timezone</p>
            </div>
          )}

          <button
            onClick={() => sendTestEmail('weekly_digest')}
            disabled={saving}
            className="text-sm text-purple-500 hover:text-purple-600 mt-2"
          >
            Send test email →
          </button>
        </div>

        {/* AI Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">💡 AI Insights</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Get notified about AI-generated spending insights and recommendations
              </p>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
            <input
              type="checkbox"
              checked={preferences.aiInsight}
              onChange={() => handleToggle('aiInsight')}
              disabled={saving}
              className="w-4 h-4"
            />
            <div>
              <p className="font-medium">Send AI insights</p>
              <p className="text-sm text-gray-500">
                Short, actionable insights about your spending patterns
              </p>
            </div>
            {preferences.aiInsight && (
              <Check className="w-4 h-4 text-green-500 ml-auto" />
            )}
          </label>

          <button
            onClick={() => sendTestEmail('ai_insight')}
            disabled={saving}
            className="text-sm text-purple-500 hover:text-purple-600 mt-2"
          >
            Send test email →
          </button>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
