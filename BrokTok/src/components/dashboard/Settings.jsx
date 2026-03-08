import React, { useState } from 'react';
import { FaCog, FaBell, FaLock, FaPalette } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import Sidebar from '../common/Sidebar';
import { useNavigate } from 'react-router-dom';

// ─── Reusable primitives ───────────────────────────────────────────────────────
function SectionLabel({ children, danger }) {
  return (
    <p className={`text-[11px] font-semibold tracking-widest uppercase mb-3 ${danger ? "text-red-500" : "text-gray-400"}`}>
      {children}
    </p>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 p-6 ${className}`}>
      {children}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>}
      <input
        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400
          outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-150"
        {...props}
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>}
      <select
        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl text-gray-900
          outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-150 cursor-pointer"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-[22px] rounded-full border-none outline-none cursor-pointer flex-shrink-0 transition-colors duration-200
        ${checked ? "bg-gray-900" : "bg-gray-200"}`}
    >
      <span
        className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200
          ${checked ? "left-[21px]" : "left-[3px]"}`}
      />
    </button>
  );
}

function ToggleRow({ title, sub, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 last:pb-0 first:pt-0">
      <div>
        <p className="text-sm font-medium text-gray-900 mb-0.5">{title}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function Btn({ children, variant = "primary", size = "md", onClick }) {
  const base = "font-medium font-[Inter] border-none cursor-pointer transition-all duration-150 rounded-xl";
  const sizes = { md: "px-4 py-2 text-sm", sm: "px-3 py-1.5 text-xs rounded-lg" };
  const variants = {
    primary:   "bg-gray-900 text-white shadow-sm hover:bg-gray-700",
    secondary: "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200",
    danger:    "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
}

function Badge({ children, color = "gray" }) {
  const colors = {
    gray:  "bg-gray-100 text-gray-500",
    green: "bg-emerald-50 text-emerald-600",
    blue:  "bg-indigo-50 text-indigo-500",
    red:   "bg-red-50 text-red-500",
  };
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full ${colors[color]}`}>
      {children}
    </span>
  );
}

// ─── Settings Tabs ─────────────────────────────────────────────────────────────

function ProfileTab({ user }) {
  const userInitial = user?.email?.[0]?.toUpperCase() || "U";
  const userEmail = user?.email || "User";
  return (
    <div className="space-y-3.5">
      {/* Profile info */}
      <Card>
        <SectionLabel>Profile</SectionLabel>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {userInitial}
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">{userEmail}</p>
          </div>
          <div className="ml-auto"><Btn variant="secondary" size="sm">Change Photo</Btn></div>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <Input label="Full Name" type="text" placeholder="Enter your full name" />
          <Input label="Email Address" type="email" placeholder="Enter your email" />
          <Select label="Currency">
            <option value="">Select a currency</option>
            <option>USD — US Dollar</option>
            <option>EUR — Euro</option>
            <option>GBP — British Pound</option>
            <option>INR — Indian Rupee</option>
          </Select>
          <Select label="Timezone">
            <option value="">Select a timezone</option>
            <option>UTC-05:00 Eastern Time</option>
            <option>UTC+00:00 London</option>
            <option>UTC+05:30 Mumbai</option>
          </Select>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Btn variant="secondary">Discard</Btn>
          <Btn variant="primary">Save Changes</Btn>
        </div>
      </Card>

      {/* Password */}
      <Card>
        <SectionLabel>Change Password</SectionLabel>
        <div className="grid grid-cols-3 gap-3.5">
          <Input label="Current Password" type="password" placeholder="••••••••" />
          <Input label="New Password" type="password" placeholder="••••••••" />
          <Input label="Confirm Password" type="password" placeholder="••••••••" />
        </div>
        <div className="flex justify-end mt-4">
          <Btn variant="primary">Update Password</Btn>
        </div>
      </Card>

      {/* Danger zone */}
      <Card>
        <SectionLabel danger>Danger Zone</SectionLabel>
        {[
          { title: "Export My Data", sub: "Download all your financial data as CSV", btn: "Export", v: "secondary" },
          { title: "Deactivate Account", sub: "Temporarily disable your account", btn: "Deactivate", v: "secondary" },
          { title: "Delete Account", sub: "Permanently erase all data. Cannot be undone.", btn: "Delete", v: "danger" },
        ].map(({ title, sub, btn, v }) => (
          <div key={title} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 last:pb-0 first:pt-0">
            <div>
              <p className={`text-sm font-medium mb-0.5 ${v === "danger" ? "text-red-600" : "text-gray-900"}`}>{title}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
            <Btn variant={v} size="sm">{btn}</Btn>
          </div>
        ))}
      </Card>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    weeklySummary: true, budgetAlerts: true, largeTransactions: false,
    monthlyReport: true, receiptProcessed: true, savingsGoals: true, newFeatures: false,
  });
  const set = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="space-y-3.5">
      <Card>
        <SectionLabel>Email Notifications</SectionLabel>
        <ToggleRow title="Weekly spending summary" sub="Receive a digest of your weekly expenses" checked={prefs.weeklySummary} onChange={() => set("weeklySummary")} />
        <ToggleRow title="Budget alerts" sub="Get notified when you reach 80% of your budget" checked={prefs.budgetAlerts} onChange={() => set("budgetAlerts")} />
        <ToggleRow title="Large transaction alerts" sub="Notify when a single transaction exceeds your threshold" checked={prefs.largeTransactions} onChange={() => set("largeTransactions")} />
        <ToggleRow title="Monthly report" sub="Detailed monthly financial analysis in your inbox" checked={prefs.monthlyReport} onChange={() => set("monthlyReport")} />
      </Card>
      <Card>
        <SectionLabel>In-App Notifications</SectionLabel>
        <ToggleRow title="Receipt processing complete" sub="Alert when your uploaded receipt has been analysed" checked={prefs.receiptProcessed} onChange={() => set("receiptProcessed")} />
        <ToggleRow title="Savings goal milestones" sub="Celebrate when you hit a savings milestone" checked={prefs.savingsGoals} onChange={() => set("savingsGoals")} />
        <ToggleRow title="New feature announcements" sub="Be the first to know about product updates" checked={prefs.newFeatures} onChange={() => set("newFeatures")} />
      </Card>
      <Card>
        <SectionLabel>Alert Threshold</SectionLabel>
        <div className="max-w-xs">
          <Input label="Large transaction amount ($)" type="number" placeholder="Enter amount" />
        </div>
        <p className="text-xs text-gray-400 mt-2 mb-4">You'll be alerted for any single expense above this amount.</p>
        <div className="flex justify-end"><Btn variant="primary">Save Preferences</Btn></div>
      </Card>
    </div>
  );
}

function PrivacyTab() {
  const [p, setP] = useState({ analytics: true, insights: true, thirdParty: false });
  const set = (k) => setP((prev) => ({ ...prev, [k]: !prev[k] }));
  return (
    <div className="space-y-3.5">
      <Card>
        <SectionLabel>Data & Privacy</SectionLabel>
        <ToggleRow title="Analytics & crash reporting" sub="Help us improve by sharing anonymous usage data" checked={p.analytics} onChange={() => set("analytics")} />
        <ToggleRow title="Personalised insights" sub="Allow AI to analyse your spending patterns" checked={p.insights} onChange={() => set("insights")} />
        <ToggleRow title="Third-party integrations" sub="Share data with connected apps and services" checked={p.thirdParty} onChange={() => set("thirdParty")} />
      </Card>
      <Card>
        <SectionLabel>Connected Sessions</SectionLabel>
        <div className="space-y-2.5">
          {[].map(({ name, time, active }) => (
            <div key={name} className={`flex items-center justify-between p-3 rounded-xl border ${active ? "border-gray-200 bg-gray-50" : "border-gray-200"}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                    {active ? <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></> : <><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></>}
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{name}</p>
                  <p className="text-xs text-gray-400">{time}</p>
                </div>
              </div>
              {active ? <Badge color="green">Active</Badge> : <Btn variant="secondary" size="sm">Revoke</Btn>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Settings Page ─────────────────────────────────────────────────────────────

function SettingsPage({ user }) {
  const tabs = ["profile", "notifications","privacy"];
  const [activeTab, setActiveTab] = useState("profile");
  const content = { profile: <ProfileTab user={user} />, notifications: <NotificationsTab />,privacy: <PrivacyTab /> };

  return (
    <div>
      <div className="mb-1">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Settings</h1>
        <p className="text-sm text-gray-400">Manage your account preferences</p>
      </div>
      <div className="flex gap-0.5 bg-[#f0f0f0] border border-gray-200 rounded-xl p-1 w-fit mt-5 mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-150 border-none cursor-pointer
              ${activeTab === t ? "bg-white text-gray-900 font-semibold shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-800"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {content[activeTab]}
    </div>
  );
}
// ─── Root: Settings component ──────────────────────────────────────

function SettingsComponent() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        currentUser={user?.email || 'User'}
        onLogout={logout}
      />

      {/* Page content */}
      <main className={`flex-1 px-9 py-12 pb-20 transition-all duration-300 ${isCollapsed ? 'ml-0' : 'ml-0 md:ml-64'}`}>
        <div className="max-w-4xl">
          <SettingsPage user={user} />
        </div>
      </main>
    </div>
  );
}

export default SettingsComponent;

// ─── Help Page ─────────────────────────────────────────────────────────────────

const FAQS = [
  { q: "How do I upload receipts?", a: "Drag and drop your receipt image onto the upload area on the Dashboard, or click to select a file. Supported formats include JPG, PNG, PDF, and HEIC. We automatically extract the merchant, amount, and category." },
  { q: "How does category detection work?", a: "Our AI reads the merchant name, line items, and contextual signals from your receipt to assign a spending category. You can always manually override — and we learn from your corrections." },
  { q: "Can I set a monthly budget?", a: "Yes — head to Settings → Profile and scroll to the Budget section. Set a total monthly budget and per-category limits. You'll receive alerts when approaching your limits." },
  { q: "Is my data secure?", a: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We never sell your data to third parties. You can delete everything at any time from Settings → Privacy." },
  { q: "How do I export my data?", a: "Go to Settings → Profile and click 'Export My Data'. You'll receive a CSV download containing all your transactions, categories, and metadata within seconds." },
  { q: "What receipt file types are supported?", a: "We support JPG, JPEG, PNG, WEBP, HEIC, and PDF up to 20MB per file. Ensure the receipt is well-lit with clearly legible text for best results." },
];

const SHORTCUTS = [
  { label: "Open command palette", keys: ["⌘", "K"] },
  { label: "Go to Dashboard",       keys: ["G", "D"] },
  { label: "Go to Analytics",       keys: ["G", "A"] },
  { label: "Upload receipt",         keys: ["⌘", "U"] },
  { label: "Search transactions",    keys: ["⌘", "/"] },
  { label: "Toggle sidebar",         keys: ["⌘", "B"] },
];

function HelpPage() {
  const [search, setSearch] = useState("");
  const [openFAQ, setOpenFAQ] = useState(null);

  const filtered = FAQS.filter(
    ({ q, a }) => !search || q.toLowerCase().includes(search.toLowerCase()) || a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-1">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Help & Support</h1>
        <p className="text-sm text-gray-400">Find answers, get in touch, or explore guides</p>
      </div>

      {/* Search */}
      <div className="relative mt-5 mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400
            outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
          placeholder="Search for help…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { icon: "💬", label: "Live Chat", sub: "Typically replies in 5 min", badge: "Online", badgeColor: "green" },
          { icon: "📧", label: "Email Support", sub: "support@finautopsy.com", badge: null },
          { icon: "📖", label: "Documentation", sub: "Guides & API reference", badge: null },
        ].map(({ icon, label, sub, badge, badgeColor }) => (
          <div
            key={label}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white cursor-pointer
              hover:border-gray-300 hover:shadow-md hover:-translate-y-px transition-all duration-150"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">{icon}</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 mb-0.5">{label}</p>
              <p className="text-xs text-gray-400 truncate">{sub}</p>
            </div>
            {badge && <Badge color={badgeColor} className="ml-auto flex-shrink-0">{badge}</Badge>}
          </div>
        ))}
      </div>

      {/* FAQ */}
      <Card className="mb-3.5">
        <SectionLabel>Frequently Asked Questions</SectionLabel>
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-5">No results found — try a different search.</p>
        ) : (
          filtered.map(({ q, a }, i) => (
            <div key={i} className="border-b border-gray-50 last:border-0 cursor-pointer" onClick={() => setOpenFAQ(openFAQ === i ? null : i)}>
              <div className="flex items-center justify-between py-4 gap-3">
                <p className="text-sm font-medium text-gray-900">{q}</p>
                <svg
                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFAQ === i ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                ><path d="M6 9l6 6 6-6"/></svg>
              </div>
              {openFAQ === i && (
                <p className="text-sm text-gray-500 leading-relaxed pb-4 pr-6">{a}</p>
              )}
            </div>
          ))
        )}
      </Card>

      {/* Keyboard shortcuts */}
      <Card className="mb-3.5">
        <SectionLabel>Keyboard Shortcuts</SectionLabel>
        {SHORTCUTS.map(({ label, keys }) => (
          <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 text-sm">
            <span className="text-gray-600">{label}</span>
            <div className="flex gap-1">
              {keys.map((k) => (
                <kbd key={k} className="bg-gray-100 border border-gray-200 rounded-md px-2 py-0.5 text-[11px] font-semibold text-gray-600 font-[Inter]">{k}</kbd>
              ))}
            </div>
          </div>
        ))}
      </Card>

      {/* About */}
      <Card>
        <SectionLabel>About</SectionLabel>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-0.5">Financial Autopsy</p>
            <p className="text-xs text-gray-400">Version 1.2.0 · Build 20260213</p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <Badge color="green">All systems operational</Badge>
            <a href="#" className="text-xs text-indigo-500 font-medium hover:underline">Privacy Policy</a>
            <a href="#" className="text-xs text-indigo-500 font-medium hover:underline">Terms of Service</a>
          </div>
        </div>
      </Card>
    </div>
  );
}