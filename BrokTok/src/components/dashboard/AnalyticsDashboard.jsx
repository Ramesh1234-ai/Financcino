/**
 * Analytics Dashboard Component
 * Display CTR metrics and user interaction data from the landing page
 * 
 * Usage:
 * - Add to a protected admin panel or settings page
 * - View real-time CTR metrics
 * - Reset analytics data
 */

import { useEffect, useState } from 'react';
import useAnalytics from '../hooks/useAnalytics';

const AnalyticsDashboard = () => {
  const { getAnalyticsSummary, resetAnalytics } = useAnalytics();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    setSummary(getAnalyticsSummary());
  }, [getAnalyticsSummary]);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all analytics data?')) {
      resetAnalytics();
      setSummary({
        pageVisits: 0,
        totalClicks: 0,
        ctaBreakdown: {
          navbar: 0,
          hero: 0,
          featuresSection: 0,
          pricingSection: 0,
        },
        ctr: {
          navbar: '0%',
          hero: '0%',
          featuresSection: '0%',
          pricingSection: '0%',
          overall: '0%',
        },
        recentEvents: [],
      });
    }
  };

  if (!summary) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  const MetricCard = ({ title, value, subtitle }) => (
    <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
      <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Landing Page Analytics</h1>
          <p className="text-slate-600 mt-2">Track CTR and user interactions</p>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
        >
          Reset Data
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <MetricCard
          title="Page Visits"
          value={summary.pageVisits.toLocaleString()}
          subtitle="Total landing page visits"
        />
        <MetricCard
          title="Total CTA Clicks"
          value={summary.totalClicks.toLocaleString()}
          subtitle="Total 'Start Free' button clicks"
        />
      </div>

      {/* Overall CTR */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg border border-blue-200 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Overall Click-Through Rate</h2>
        <p className="text-5xl font-bold text-indigo-600 mb-2">{summary.ctr.overall}</p>
        <p className="text-slate-600">
          {summary.pageVisits > 0
            ? `${summary.totalClicks} clicks out of ${summary.pageVisits} visits`
            : 'No data available'}
        </p>
      </div>

      {/* CTR by Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">CTR by Section</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Navbar */}
          <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-600">Navbar "Start Free"</span>
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                {summary.ctaBreakdown.navbar} clicks
              </span>
            </div>
            <div className="bg-slate-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    summary.pageVisits > 0
                      ? (summary.ctaBreakdown.navbar / summary.pageVisits) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-4">{summary.ctr.navbar}</p>
          </div>

          {/* Hero Section */}
          <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-600">Hero Section Button</span>
              <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">
                {summary.ctaBreakdown.hero} clicks
              </span>
            </div>
            <div className="bg-slate-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    summary.pageVisits > 0
                      ? (summary.ctaBreakdown.hero / summary.pageVisits) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-4">{summary.ctr.hero}</p>
          </div>

          {/* Features Section */}
          <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-600">Features Section Button</span>
              <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                {summary.ctaBreakdown.featuresSection} clicks
              </span>
            </div>
            <div className="bg-slate-100 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    summary.pageVisits > 0
                      ? (summary.ctaBreakdown.featuresSection / summary.pageVisits) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-4">{summary.ctr.featuresSection}</p>
          </div>

          {/* Pricing Section */}
          <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-600">Pricing Section Button</span>
              <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                {summary.ctaBreakdown.pricingSection} clicks
              </span>
            </div>
            <div className="bg-slate-100 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    summary.pageVisits > 0
                      ? (summary.ctaBreakdown.pricingSection / summary.pageVisits) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-4">{summary.ctr.pricingSection}</p>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Recent Events</h2>
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {summary.recentEvents && summary.recentEvents.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {[...summary.recentEvents].reverse().map((event, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 capitalize">
                        {event.event === 'cta_click'
                          ? `CTA clicked from ${event.source}`
                          : 'Page visited'}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded">
                      {event.source || 'visit'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">No events recorded yet</div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="font-bold text-amber-900 mb-2">How to Use</h3>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>✓ Track user clicks on "Start Free" buttons from different sections</li>
          <li>✓ Calculate CTR (Click-Through Rate) for each section</li>
          <li>✓ View recent events and user interactions</li>
          <li>✓ Use this data to optimize landing page conversion</li>
        </ul>
      </div>
    </div>
  );
};
export default AnalyticsDashboard;
