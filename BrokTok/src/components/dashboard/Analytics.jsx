import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
  AreaChart, Area,
} from "recharts";
import Sidebar from "../common/Sidebar";
import useAuth from "../../hooks/useAuth";
import * as api from "../../services/api";
import { useNavigate } from "react-router-dom";
// ─── Color palette (matches dashboard's indigo/violet accent tones) ────────────
const CAT_COLORS = ["#6366f1","#8b5cf6","#a78bfa","#c084fc","#e879f9","#f472b6"];
async function fetchAnalytics(range = 'month', token) {
  try {
    const res = await api.getAnalytics(range, token)
    console.log("ANALYTICS DATA:", res);
    if (res?.error) throw new Error(res.error)
    return res?.data || res || {}
  } catch (err) {
    console.error('fetchAnalytics error:', err)
    throw err
  }
}

// ─── API fetch configuration ──────────────────────────────────────────────────

// ─── API fetch ──────────────────────────────────────────────
// ─── Custom chart tooltip — matches dashboard's clean white card style ─────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
        fontSize: 12,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <p style={{ color: "#9ca3af", fontWeight: 600, marginBottom: 6, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase" }}>
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: i < payload.length - 1 ? 4 : 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
          <span style={{ color: "#6b7280", textTransform: "capitalize" }}>{entry.name}: </span>
          <span style={{ color: "#111827", fontWeight: 700, fontFamily: "monospace" }}>
            ${Number(entry.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton shimmer blocks ───────────────────────────────────────────────────
const shimmerStyle = {
  background: "linear-gradient(90deg,#ebebeb 0%,#f5f5f5 50%,#ebebeb 100%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
  borderRadius: 6,
};
function StatCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
      <div style={{ ...shimmerStyle, height: 11, width: "55%" }} />
      <div style={{ ...shimmerStyle, height: 28, width: "45%", borderRadius: 5 }} />
      <div style={{ ...shimmerStyle, height: 10, width: "38%" }} />
      <div style={{ ...shimmerStyle, height: 22, width: "42%", borderRadius: 20 }} />
    </div>
  );
}
function ChartSkeleton({ height = 256 }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height }}>
      {[55, 78, 42, 91, 63, 81, 47, 87, 66, 72, 52, 90].map((pct, i) => (
        <div
          key={i}
          style={{
            ...shimmerStyle,
            flex: 1,
            height: `${pct}%`,
            borderRadius: "4px 4px 0 0",
            animationDelay: `${i * 0.04}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Pie chart inner label ─────────────────────────────────────────────────────
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  if (percent < 0.06) return null;
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ─── Main Analytics Page ───────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { user, logout, getToken } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [range, setRange] = useState("month");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const result = await fetchAnalytics(range, token);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [range, getToken]);

  useEffect(() => { loadData(); }, [loadData]);
  const stats = data?.stats;
  const totalCategories = data?.categories?.reduce((s, c) => s + c.value, 0) || 1;
  const statCards = [
    {
      label: "AVERAGE MONTHLY SPEND",
      value: `₹${stats?.avgSpend?.toLocaleString() ?? "—"}`,
      sub: "Per month average",
      badge: "gray",
      badgeText: "This period",
    },
    {
      label: "BUDGET REMAINING",
      value: `₹${stats?.budgetRemaining?.toLocaleString() ?? "—"}`,
      sub: "Left this period",
      badge: stats?.budgetRemaining > 0 ? "green" : "gray",
      badgeText: stats?.budgetRemaining > 0 ? "▲ On track" : "▼ Over budget",
    },
    {
      label: "HIGHEST CATEGORY",
      value: stats?.topCategory ?? "—",
      sub: "Top spending category",
      badge: "gray",
      badgeText: "Dominant",
    },
    {
      label: "SAVINGS RATE",
      value: `${stats?.savingsRate ?? 0}%`,
      sub: "Of income saved",
      badge: stats?.savingsRate >= 20 ? "green" : "gray",
      badgeText: stats?.savingsRate >= 20 ? "▲ Excellent!" : "Keep saving",
    },
    
  ];

  return (
    <>
     
      {/* Inject shimmer keyframe */}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        currentUser={user?.email || 'User'}
        onLogout={logout}
      />

      {/* Page — bg-[#f5f5f5] matches dashboard background exactly */}
      <div className={`min-h-screen bg-linear-to-br-from-[#0f0f23] to-[#1a1a3e] ${isCollapsed ? 'ml-0' : 'ml-0 md:ml-64'}`} style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="max-w-6xl mx-auto px-6 py-12 pb-20">

          {/* ── Header ── */}
          <div className="mb-7">
            <h1 className="text-[1.45rem] font-bold text-gray-900 tracking-tight mb-1">Analytics</h1>
            <p className="text-sm text-gray-400">Here's your financial overview</p>
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-500 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* ── Time range toggle ── */}
          <div className="mb-6">
            <div className="inline-flex gap-0.5 bg-[#f0f0f0] border border-gray-200 rounded-xl p-1">
              {["week", "month", "year"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-150
                    ${range === r
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800 hover:bg-white/60"
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
              : statCards.map((s, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm
                    hover:shadow-md hover:border-gray-300 transition-all duration-200"
                >
                  {/* matches dashboard "TOTAL SPENT" uppercase label style exactly */}
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-2">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full mt-3
                      ${s.badge === "green" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}
                  >
                    {s.badgeText}
                  </span>
                </div>
              ))}
          </div>

          {/* ── Charts row 1: Bar + Pie ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3.5 mb-3.5">

            {/* Bar chart — 3/5 */}
            <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-1">
                Expense vs Budget
              </p>
              <p className="text-sm text-gray-700 font-medium mb-5">
                Breakdown by {range === "week" ? "day" : range === "month" ? "week" : "month"}
              </p>
              {loading ? (
                <ChartSkeleton height={252} />
              ) : (
                <ResponsiveContainer width="100%" height={252}>
                  <BarChart data={data?.trend} barGap={3} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `$${v >= 1000 ? `${v / 1000}k` : v}`} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "#fafafa" }} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                      formatter={(v) => <span style={{ color: "#6b7280", textTransform: "capitalize" }}>{v}</span>} />
                    <Bar dataKey="expenses" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={34} />
                    <Bar dataKey="budget" fill="#e5e7eb" radius={[4, 4, 0, 0]} maxBarSize={34} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie chart — 2/5 */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-1">
                Spending Categories
              </p>
              <p className="text-sm text-gray-700 font-medium mb-3">Category breakdown</p>

              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div style={{ ...shimmerStyle, width: 130, height: 130, borderRadius: "50%" }} />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie
                      data={data?.categories}
                      cx="50%" cy="50%"
                      innerRadius={44} outerRadius={74}
                      paddingAngle={3} dataKey="value"
                      labelLine={false} label={PieLabel}
                      animationDuration={700}
                    >
                      {data?.categories?.map((_, i) => (
                        <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {/* Category list */}
              {!loading && (
                <div className="mt-3 space-y-2">
                  {data?.categories?.slice(0, 5).map((c, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-sm flex-shrink-0"
                          style={{ background: CAT_COLORS[i % CAT_COLORS.length] }}
                        />
                        <span className="text-xs text-gray-600">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400">
                          {((c.value / totalCategories) * 100).toFixed(0)}%
                        </span>
                        <span className="text-xs font-semibold text-gray-900 font-mono">
                          ${c.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Spending trend area chart ── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-1">
              Spending Trend
            </p>
            <p className="text-sm text-gray-700 font-medium mb-5">
              Your spending pattern over the selected {range}
            </p>
            {loading ? (
              <ChartSkeleton height={212} />
            ) : (
              <ResponsiveContainer width="100%" height={212}>
                <AreaChart data={data?.spendingTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `$${v >= 1000 ? `${v / 1000}k` : v}`} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }} />
                  <Area
                    type="monotone" dataKey="amount"
                    stroke="#6366f1" strokeWidth={2}
                    fill="url(#indigoGrad)"
                    dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }}
                    activeDot={{ fill: "#6366f1", r: 5, stroke: "#fff", strokeWidth: 2 }}
                    animationDuration={900}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>
      </div>
    </>
  );
}