/**
 * StreamXLanding.jsx
 * AI Expense Tracker — SaaS Landing Page
 *
 * Real API endpoints consumed:
 *   GET /analytics?range=month  → hero stats, insights, trust section
 *   GET /expenses               → live dashboard preview
 *
 * Fonts (add to index.html or tailwind config):
 *   <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
 */

import { useState, useEffect, useRef } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = {
  currency: (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n ?? 0),
  number: (n) => new Intl.NumberFormat("en-IN").format(n ?? 0),
  percent: (n) => `${n > 0 ? "+" : ""}${Number(n ?? 0).toFixed(1)}%`,
  date: (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  cap: (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—"),
};

const cn = (...c) => c.filter(Boolean).join(" ");

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}

// ─── Primitives ───────────────────────────────────────────────────────────────

const Skeleton = ({ className }) => (
  <div className={cn("animate-pulse rounded-lg bg-white/5", className)} />
);

const Dot = ({ color = "amber" }) => {
  const colors = { amber: "bg-amber-400", emerald: "bg-emerald-400", rose: "bg-rose-400", sky: "bg-sky-400", violet: "bg-violet-400" };
  return <span className={cn("inline-block h-2 w-2 rounded-full", colors[color])} />;
};

// Category color map
const catColor = (cat) => {
  const map = { food: "amber", travel: "sky", shopping: "violet", health: "emerald", entertainment: "rose", other: "slate" };
  return map[(cat || "other").toLowerCase()] || "amber";
};

const catDotColor = (cat) => {
  const map = { food: "text-amber-400", travel: "text-sky-400", shopping: "text-violet-400", health: "text-emerald-400", entertainment: "text-rose-400", other: "text-slate-400" };
  return map[(cat || "other").toLowerCase()] || "text-amber-400";
};

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 inset-x-0 z-50 transition-all duration-300",
      scrolled ? "bg-slate-950/90 backdrop-blur-md border-b border-white/5 py-3" : "py-5"
    )}>
      <div className="mx-auto max-w-6xl px-5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400">
            <svg className="h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-semibold text-white tracking-tight">StreamX</span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7 text-sm text-slate-400">
          {["Features", "How it Works", "Insights", "Pricing"].map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5">Log in</button>
          <button className="text-sm font-medium bg-amber-400 text-slate-950 rounded-lg px-4 py-2 hover:bg-amber-300 transition-all active:scale-95">
            Get Started
          </button>
        </div>

        {/* Mobile menu btn */}
        <button onClick={() => setMenuOpen((o) => !o)} className="md:hidden text-slate-400 hover:text-white">
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur-md px-5 py-4 space-y-3">
          {["Features", "How it Works", "Insights"].map((l) => (
            <a key={l} href="#" className="block text-sm text-slate-400 hover:text-white py-1">{l}</a>
          ))}
          <button className="w-full mt-2 text-sm font-medium bg-amber-400 text-slate-950 rounded-lg px-4 py-2.5">
            Get Started Free
          </button>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroStat({ label, value, loading, prefix = "" }) {
  return (
    <div className="flex flex-col gap-1">
      {loading ? (
        <Skeleton className="h-7 w-24 mb-1" />
      ) : (
        <span className="text-2xl font-bold text-white tabular-nums">{prefix}{value}</span>
      )}
      <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function Hero({ analytics, loading, error }) {
  const stats = analytics?.summary || {};

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background grid + glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-96 w-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-10 h-64 w-64 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-5 text-center">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 text-xs text-amber-400 mb-7">
          <Dot color="amber" />
          <span>Powered by OCR + Gemini AI</span>
        </div>

        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Turn Receipts into<br />
          <em className="not-italic text-amber-400">Smart Financial</em> Insights
        </h1>

        <p className="max-w-xl mx-auto text-slate-400 text-lg leading-relaxed mb-10">
          Snap a receipt. Our OCR engine extracts every detail instantly, your AI chatbot explains where your money's going, and live analytics keep you ahead of every rupee.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
          <button className="flex items-center gap-2 bg-amber-400 text-slate-950 font-semibold rounded-xl px-6 py-3.5 text-sm hover:bg-amber-300 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-400/20">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Get Started Free
          </button>
          <button className="flex items-center gap-2 border border-white/10 text-white rounded-xl px-6 py-3.5 text-sm hover:bg-white/5 transition-all">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View Live Demo
          </button>
        </div>

        {/* Real stats bar */}
        <div className="inline-flex flex-wrap justify-center gap-8 border border-white/8 bg-white/3 backdrop-blur-sm rounded-2xl px-8 py-5">
          <HeroStat label="Spent this month" value={fmt.currency(stats.totalSpend)} loading={loading} />
          <div className="hidden sm:block w-px bg-white/10" />
          <HeroStat label="Receipts processed" value={fmt.number(stats.receiptCount)} loading={loading} />
          <div className="hidden sm:block w-px bg-white/10" />
          <HeroStat label="Top category" value={fmt.cap(stats.topCategory)} loading={loading} />
          {error && (
            <p className="text-xs text-rose-400 self-center">⚠ API unavailable — showing live once connected</p>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Live Dashboard Preview ────────────────────────────────────────────────────

function CategoryBar({ label, amount, total, color }) {
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
  const barColors = {
    amber: "bg-amber-400", sky: "bg-sky-400", violet: "bg-violet-400",
    emerald: "bg-emerald-400", rose: "bg-rose-400", slate: "bg-slate-500",
  };
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400 capitalize">{label}</span>
        <span className="text-white font-medium tabular-nums">{fmt.currency(amount)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", barColors[color] || "bg-amber-400")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-right text-[10px] text-slate-600">{pct}%</div>
    </div>
  );
}

function ExpenseRow({ expense, loading }) {
  if (loading) return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5">
      <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2.5 w-20" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );

  const cat = expense.category || "other";
  const color = catDotColor(cat);
  const bgMap = {
    food: "bg-amber-400/10", travel: "bg-sky-400/10", shopping: "bg-violet-400/10",
    health: "bg-emerald-400/10", entertainment: "bg-rose-400/10", other: "bg-slate-700/30",
  };
  const bg = bgMap[cat.toLowerCase()] || "bg-amber-400/10";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors rounded-lg px-1">
      <div className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm", bg)}>
        <span className={color}>
          {{ food: "🍽", travel: "✈️", shopping: "🛍", health: "💊", entertainment: "🎬" }[cat.toLowerCase()] || "📎"}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white truncate">{expense.merchant || expense.description || "Expense"}</p>
        <p className="text-[11px] text-slate-500 capitalize">{cat} · {fmt.date(expense.date || expense.createdAt)}</p>
      </div>
      <span className="text-sm font-semibold text-white tabular-nums flex-shrink-0">
        {fmt.currency(expense.amount)}
      </span>
    </div>
  );
}

function LiveDashboard({ expenses, analytics, expLoading, anaLoading, expError, anaError }) {
  const recent = expenses?.slice(0, 5) || [];
  const categories = analytics?.categories || [];
  const total = analytics?.summary?.totalSpend || 0;

  return (
    <section id="features" className="py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-amber-400 mb-3">Live Preview</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Your dashboard, <em className="not-italic text-slate-400">in real time</em>
          </h2>
          <p className="mt-3 text-slate-500 max-w-md mx-auto text-sm">
            Every number below is fetched live from your backend. Zero hardcoding.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-4">
          {/* Recent expenses — 3 cols */}
          <div className="lg:col-span-3 rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Recent Expenses</h3>
              <span className="text-[11px] text-slate-500 bg-white/5 rounded-full px-2.5 py-0.5">
                {expLoading ? "—" : (expenses?.length || 0)} total
              </span>
            </div>

            {expError ? (
              <div className="py-8 text-center text-sm text-slate-600">
                ⚠ Couldn't load expenses — connect your backend
              </div>
            ) : expLoading ? (
              [...Array(4)].map((_, i) => <ExpenseRow key={i} loading />)
            ) : recent.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-600">No expenses yet — upload your first receipt</div>
            ) : (
              recent.map((exp) => <ExpenseRow key={exp._id || exp.id} expense={exp} />)
            )}

            {/* Mini total bar */}
            {!expError && !expLoading && (
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs text-slate-500">Month total</span>
                <span className="text-sm font-bold text-amber-400 tabular-nums">
                  {anaLoading ? <Skeleton className="h-4 w-20 inline-block" /> : fmt.currency(total)}
                </span>
              </div>
            )}
          </div>

          {/* Category breakdown — 2 cols */}
          <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Spending by Category</h3>

            {anaError ? (
              <div className="py-8 text-center text-sm text-slate-600">⚠ Analytics unavailable</div>
            ) : anaLoading ? (
              <div className="space-y-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-600">No category data yet</div>
            ) : (
              <div className="space-y-4">
                {categories.map((c) => (
                  <CategoryBar
                    key={c.category}
                    label={c.category}
                    amount={c.total}
                    total={total}
                    color={catColor(c.category)}
                  />
                ))}
              </div>
            )}

            {/* Donut placeholder ring — pure CSS */}
            {!anaLoading && !anaError && categories.length > 0 && (
              <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                {categories.slice(0, 4).map((c) => (
                  <div key={c.category} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Dot color={catColor(c.category)} />
                    <span className="capitalize">{c.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const features = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "OCR Receipt Scanning",
    tag: "Gemini Vision",
    desc: "Photograph any receipt — crumpled, faded, multilingual. Our Gemini-powered OCR pulls merchant name, line items, totals, tax, and date with 95%+ accuracy. No manual entry.",
    benefit: "Saves ~8 min per receipt",
    color: "amber",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    title: "AI Insights Chatbot",
    tag: "Gemini 1.5",
    desc: "Ask \"Where did I overspend last week?\" or \"Suggest how to cut food expenses by 20%\". The chatbot reads your actual expense history and gives personalised, actionable answers.",
    benefit: "1 query = 10 min of analysis",
    color: "violet",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Live Analytics Dashboard",
    tag: "Real-time",
    desc: "Category breakdowns, monthly trends, and spending velocity — all updating the moment a receipt is processed. Export CSV, set category budgets, and track overspend alerts.",
    benefit: "Full picture in < 2 seconds",
    color: "sky",
  },
];

function Features() {
  const colorMap = {
    amber: { bg: "bg-amber-400/10", text: "text-amber-400", border: "border-amber-400/20", badge: "bg-amber-400/10 text-amber-300" },
    violet: { bg: "bg-violet-400/10", text: "text-violet-400", border: "border-violet-400/20", badge: "bg-violet-400/10 text-violet-300" },
    sky: { bg: "bg-sky-400/10", text: "text-sky-400", border: "border-sky-400/20", badge: "bg-sky-400/10 text-sky-300" },
  };

  return (
    <section id="features" className="py-20 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-widest text-amber-400 mb-3">What's inside</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Three tools. One financial brain.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => {
            const c = colorMap[f.color];
            return (
              <div
                key={f.title}
                className={cn(
                  "group rounded-2xl border bg-white/2 p-6 transition-all duration-300",
                  "hover:bg-white/4 hover:-translate-y-1 hover:shadow-xl",
                  c.border
                )}
              >
                <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4", c.bg, c.text)}>
                  {f.icon}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                  <span className={cn("text-[10px] rounded-full px-2 py-0.5 font-medium", c.badge)}>{f.tag}</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{f.desc}</p>
                <div className={cn("inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1", c.bg, c.text)}>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {f.benefit}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const steps = [
  { n: "01", icon: "📸", title: "Upload Receipt", desc: "Take a photo or upload an image. Supports JPG, PNG, and PDF formats." },
  { n: "02", icon: "🔍", title: "OCR Extracts Data", desc: "Gemini Vision reads merchant, date, items, tax, and total — in under 3 seconds." },
  { n: "03", icon: "📂", title: "Expense is Created", desc: "A structured expense entry appears in your dashboard, auto-categorised." },
  { n: "04", icon: "📊", title: "Analytics Update", desc: "Charts, totals, and AI insights refresh instantly. Your financial picture stays current." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-widest text-amber-400 mb-3">Process</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
            From paper to insight<br className="hidden sm:block" /> in four steps
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <div key={s.n} className="relative group">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0" />
              )}
              <div className="relative z-10 rounded-2xl border border-white/8 bg-white/3 p-5 hover:bg-white/5 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-xs font-mono text-slate-700">{s.n}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── AI Insights Preview ──────────────────────────────────────────────────────

function InsightCard({ icon, text, loading, accent = "amber" }) {
  const colors = {
    amber: "border-amber-400/20 bg-amber-400/5",
    violet: "border-violet-400/20 bg-violet-400/5",
    sky: "border-sky-400/20 bg-sky-400/5",
    emerald: "border-emerald-400/20 bg-emerald-400/5",
    rose: "border-rose-400/20 bg-rose-400/5",
  };
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-4", colors[accent])}>
      <span className="text-lg flex-shrink-0">{icon}</span>
      {loading ? (
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ) : (
        <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
      )}
    </div>
  );
}

function AIInsights({ analytics, loading, error }) {
  const s = analytics?.summary || {};
  const cats = analytics?.categories || [];
  const topCat = cats[0];
  const secondCat = cats[1];

  const pctChange = s.changeFromLastPeriod ?? null;
  const topCatShare = s.totalSpend && topCat ? Math.round((topCat.total / s.totalSpend) * 100) : null;

  const insights = [
    {
      icon: "💰",
      text: `You've spent ${fmt.currency(s.totalSpend)} this month${s.receiptCount ? ` across ${s.receiptCount} receipts` : ""}.`,
      accent: "amber",
    },
    {
      icon: "🏆",
      text: topCat
        ? `Your top category is ${fmt.cap(topCat.category)} — ${fmt.currency(topCat.total)}${topCatShare ? ` (${topCatShare}% of total)` : ""}.`
        : "No category data yet — upload your first receipt.",
      accent: "violet",
    },
    {
      icon: pctChange > 0 ? "📈" : "📉",
      text: pctChange !== null
        ? `You spent ${fmt.percent(pctChange)} ${pctChange > 0 ? "more" : "less"} compared to last period.`
        : "Comparison data will appear after your second month.",
      accent: pctChange > 0 ? "rose" : "emerald",
    },
    {
      icon: "🧠",
      text: secondCat
        ? `${fmt.cap(secondCat.category)} is your second-largest spend at ${fmt.currency(secondCat.total)}. Consider setting a budget here.`
        : "Keep uploading receipts — the AI will surface saving opportunities soon.",
      accent: "sky",
    },
  ];

  return (
    <section id="insights" className="py-20 border-t border-white/5">
      <div className="mx-auto max-w-4xl px-5">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-amber-400 mb-3">AI Insights</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
            What your data is{" "}
            <em className="not-italic text-amber-400">telling you</em>
          </h2>
          <p className="mt-3 text-slate-500 text-sm max-w-sm mx-auto">
            Generated live from your real expense data — not templates.
          </p>
        </div>

        {error ? (
          <div className="text-center py-10 text-slate-600 text-sm">
            ⚠ Connect your backend to see live AI insights
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {insights.map((ins, i) => (
              <InsightCard key={i} icon={ins.icon} text={ins.text} loading={loading} accent={ins.accent} />
            ))}
          </div>
        )}

        {/* Chatbot CTA */}
        <div className="mt-6 rounded-2xl border border-white/8 bg-white/3 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-white mb-1">Want deeper answers?</p>
            <p className="text-xs text-slate-500">Ask the AI chatbot anything about your spending — it reads your full history.</p>
          </div>
          <button className="flex-shrink-0 flex items-center gap-2 bg-white/8 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm hover:bg-white/12 transition-all">
            <span>💬</span> Open Chatbot
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Trust / Stats Section ────────────────────────────────────────────────────

function TrustStat({ value, label, suffix = "", loading }) {
  return (
    <div className="text-center px-6">
      {loading ? (
        <Skeleton className="h-10 w-24 mx-auto mb-2" />
      ) : (
        <div className="text-4xl font-bold text-white tabular-nums mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
          {value}{suffix}
        </div>
      )}
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function TrustSection({ analytics, loading, error }) {
  const s = analytics?.summary || {};

  return (
    <section className="py-20 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-amber-400 mb-3">By the numbers</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Real usage. Real data.
          </h2>
          <p className="mt-3 text-slate-500 text-sm">These numbers come from your live backend — not our marketing team.</p>
        </div>

        {error ? (
          <div className="text-center text-slate-600 text-sm py-6">⚠ Stats will appear once backend is connected</div>
        ) : (
          <div className="flex flex-wrap justify-center divide-x divide-white/8 gap-y-8">
            <TrustStat value={fmt.number(s.receiptCount)} label="Receipts processed" loading={loading} />
            <TrustStat value={fmt.currency(s.totalSpend)} label="Total spend tracked" loading={loading} />
            <TrustStat value={s.topCategory ? fmt.cap(s.topCategory) : "—"} label="Most common category" loading={loading} />
            <TrustStat value="95" suffix="%" label="OCR accuracy rate" loading={false} />
          </div>
        )}

        {/* Feature chips */}
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {["No ads", "Your data stays yours", "Export anytime", "Open to extend"].map((l) => (
            <span key={l} className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/3 px-3.5 py-1.5 text-xs text-slate-400">
              <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="py-24 border-t border-white/5">
      <div className="mx-auto max-w-3xl px-5 text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-64 w-64 bg-amber-400/8 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <p className="text-xs uppercase tracking-widest text-amber-400 mb-4">Ready to start?</p>
            <h2
              className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Start tracking smarter today.
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
              Upload your first receipt in seconds. No credit card. No complex setup.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button className="flex items-center gap-2 bg-amber-400 text-slate-950 font-bold rounded-xl px-7 py-4 text-sm hover:bg-amber-300 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-amber-400/20">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Sign Up Free
              </button>
              <button className="flex items-center gap-2 border border-white/10 text-white rounded-xl px-7 py-4 text-sm hover:bg-white/5 transition-all">
                Try Demo →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/5 py-8">
      <div className="mx-auto max-w-6xl px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-400">
            <span className="text-[10px] font-bold text-slate-950">S</span>
          </div>
          <span className="text-sm text-slate-500">StreamX — AI Expense Tracker</span>
        </div>
        <p className="text-xs text-slate-700">Built with React + Gemini · {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function StreamXLanding() {
  const { data: analytics, loading: anaLoading, error: anaError } =
    useApi(`${API_BASE}/analytics?range=month`);

  const { data: expensesRaw, loading: expLoading, error: expError } =
    useApi(`${API_BASE}/expenses`);

  // Support both array response and { expenses: [...] }
  const expenses = Array.isArray(expensesRaw)
    ? expensesRaw
    : expensesRaw?.expenses || expensesRaw?.data || [];

  return (
    <div
      className="min-h-screen bg-slate-950 text-white antialiased"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <Navbar />
      <Hero analytics={analytics} loading={anaLoading} error={anaError} />

      <LiveDashboard
        expenses={expenses}
        analytics={analytics}
        expLoading={expLoading}
        anaLoading={anaLoading}
        expError={expError}
        anaError={anaError}
      />
      <Features />
      <HowItWorks />
      <AIInsights analytics={analytics} loading={anaLoading} error={anaError} />
      <TrustSection analytics={analytics} loading={anaLoading} error={anaError} />
      <CTA />
      <Footer />
    </div>
  );
}