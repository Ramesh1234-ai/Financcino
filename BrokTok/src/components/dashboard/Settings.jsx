/**
 * Settings.jsx - Complete Settings Page with Clerk Integration
 * 
 * Features:
 * - Profile management (name, avatar)
 * - Email management
 * - Security settings
 * - Preferences
 * - Account connected apps
 * - Session management
 * - Account deletion
 * 
 * Dependencies:
 *   npm install @clerk/clerk-react lucide-react
 */

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { LogOut, Lock, Mail, User, Settings as SettingsIcon, Smartphone, Trash2, ExternalLink } from "lucide-react";
import Sidebar from "../common/Sidebar";

// ─── Utility ────────────────────────────────────────────────────────────────

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700",
        className
      )}
    />
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────

function Badge({ children, color = "zinc" }) {
  const colors = {
    zinc: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
    emerald:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    sky: "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        colors[color]
      )}
    >
      {children}
    </span>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

function Card({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200/80 bg-white p-6",
        "shadow-sm shadow-zinc-100",
        "dark:border-zinc-700/60 dark:bg-zinc-900 dark:shadow-zinc-900",
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({ title, description }) {
  return (
    <div className="mb-5">
      <h2 className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      {description && (
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
    </div>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function Toast({ message, type }) {
  if (!message) return null;
  const styles = {
    success:
      "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300",
    error:
      "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300",
  };
  const icons = { success: "✓", error: "✕" };
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium",
        "transition-all duration-300",
        styles[type]
      )}
    >
      <span className="text-base leading-none">{icons[type]}</span>
      {message}
    </div>
  );
}


// ─── Profile Card ────────────────────────────────────────────────────────────

function ProfileCard({ user, isLoaded }) {
  return (
    <Card className="flex items-center gap-5">
      {isLoaded ? (
        <>
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || "Avatar"}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow-md dark:ring-zinc-800"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-xl font-bold text-white shadow-md">
                {(user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || "U").toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-zinc-900" />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {user?.fullName || "—"}
            </h1>
            <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
              {user?.primaryEmailAddress?.emailAddress || "—"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge color="emerald">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
              </Badge>
              <Badge color="sky">Clerk Auth</Badge>
            </div>
          </div>
        </>
      ) : (
        <>
          <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
        </>
      )}
    </Card>
  );
}

// ─── Edit Profile Form ────────────────────────────────────────────────────────

function EditProfileForm({ user, isLoaded }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      showToast("Profile updated successfully.", "success");
    } catch (err) {
      showToast(err?.errors?.[0]?.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <SectionHeader
        title="Edit Profile"
        description="Update your display name visible across your account."
      />

      {isLoaded ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className={cn(
                  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm",
                  "text-zinc-900 placeholder-zinc-400 outline-none",
                  "transition-all focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-200",
                  "dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500",
                  "dark:focus:border-zinc-500 dark:focus:bg-zinc-750 dark:focus:ring-zinc-700"
                )}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className={cn(
                  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm",
                  "text-zinc-900 placeholder-zinc-400 outline-none",
                  "transition-all focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-200",
                  "dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500",
                  "dark:focus:border-zinc-500 dark:focus:bg-zinc-750 dark:focus:ring-zinc-700"
                )}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Email Address
            </label>
            <input
              type="email"
              value={user?.primaryEmailAddress?.emailAddress || ""}
              readOnly
              className={cn(
                "w-full rounded-xl border border-zinc-200 bg-zinc-100 px-3.5 py-2.5 text-sm",
                "cursor-not-allowed text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-500"
              )}
            />
            <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
              Email changes must be done through the security panel.
            </p>
          </div>

          {toast.message && <Toast message={toast.message} type={toast.type} />}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={() => {
                setFirstName(user?.firstName || "");
                setLastName(user?.lastName || "");
              }}
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold",
                "bg-zinc-900 text-white shadow-sm transition-all",
                "hover:bg-zinc-700 active:scale-[0.98]",
                "dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {saving && (
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              )}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <Skeleton className="h-10" />
          <div className="flex justify-end">
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      )}
    </Card>
  );
}
// ─── Dark Mode Toggle ─────────────────────────────────────────────────────────

function DarkModeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg text-sm",
        "border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all",
        "hover:bg-zinc-50 hover:text-zinc-900",
        "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      )}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
// ─── Root ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [active, setActive] = useState("profile");
  const [dark, setDark] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased dark:bg-zinc-950">
      {/* Desktop Sidebar */}
      <div className="hidden sm:block">
        <Sidebar/>
      </div>
      {/* Main Content */}
      <main className="sm:pl-60">
        <div className="mx-auto max-w-2xl px-5 py-8">
          {/* Desktop header */}
          <div className="mb-7 hidden items-center justify-between sm:flex">
            <div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {navItems.find((n) => n.id === active)?.label}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage your {navItems.find((n) => n.id === active)?.label.toLowerCase()} settings
              </p>
            </div>
            <DarkModeToggle dark={dark} onToggle={() => setDark((d) => !d)} />
          </div>
        </div>
      </main>
    </div>
  );
}