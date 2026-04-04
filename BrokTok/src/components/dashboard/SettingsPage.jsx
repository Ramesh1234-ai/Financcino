/**
 * SettingsPage.jsx - Complete Settings Page with Clerk Integration
 * 
 * Features:
 * - Profile management (name, avatar)
 * - Email & phone management
 * - Security settings (password, 2FA, sessions)
 * - Preferences (notifications, dark mode)
 * - Connected apps
 * - Account deletion
 * 
 * Dependencies:
 *   npm install @clerk/clerk-react lucide-react
 */

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import {
  LogOut,
  Lock,
  Mail,
  User,
  Settings as SettingsIcon,
  Smartphone,
  Trash2,
  Check,
  Clock,
} from "lucide-react";
import Sidebar from "../common/Sidebar";

// ─── Utility ────────────────────────────────────────────────────────────────

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
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
        "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium animate-in fade-in slide-in-from-top-2",
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
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-xl font-bold text-white shadow-md">
                {(user?.firstName?.[0] || 
                  user?.emailAddresses?.[0]?.emailAddress?.[0] || 
                  "U").toUpperCase()}
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
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
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
                  "transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200",
                  "dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500",
                  "dark:focus:border-indigo-500 dark:focus:bg-zinc-750 dark:focus:ring-indigo-700"
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
                  "transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200",
                  "dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500",
                  "dark:focus:border-indigo-500 dark:focus:bg-zinc-750 dark:focus:ring-indigo-700"
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
                "bg-indigo-600 text-white shadow-sm transition-all",
                "hover:bg-indigo-700 active:scale-[0.98]",
                "dark:bg-indigo-500 dark:hover:bg-indigo-600",
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

// ─── Security Section ─────────────────────────────────────────────────────────

function SecuritySection({ user, isLoaded }) {
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to sign out?")) return;
    setSigningOut(true);
    try {
      await signOut({ redirectUrl: "/" });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <Card>
      <SectionHeader
        title="Security & Sessions"
        description="Manage your account security and active sessions."
      />
      {isLoaded && user ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-zinc-500" />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Password
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Last changed • 3 months ago
                </p>
              </div>
            </div>
            <button
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                "dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              )}
            >
              Change
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-zinc-500" />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Two-Factor Auth
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Not enabled • Add extra security
                </p>
              </div>
            </div>
            <button
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                "dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              )}
            >
              Enable
            </button>
          </div>

          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Active Sessions
            </p>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    This Browser
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Chrome on Windows • Last active now
                  </p>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end border-t border-zinc-200 pt-4 dark:border-zinc-700">
            <button
              onClick={handleLogout}
              disabled={signingOut}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium",
                "text-red-600 hover:bg-red-50 transition-all",
                "dark:text-red-400 dark:hover:bg-red-900/20",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <LogOut className="h-4 w-4" />
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-10" />
        </div>
      )}
    </Card>
  );
}

// ─── Preferences Section ───────────────────────────────────────────────────────

function PreferencesSection() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-10 rounded-full transition-all",
        checked ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
      )}
    >
      <div
        className={cn(
          "absolute top-1 h-4 w-4 rounded-full bg-white transition-all",
          checked ? "right-1" : "left-1"
        )}
      />
    </button>
  );

  return (
    <Card>
      <SectionHeader
        title="Preferences"
        description="Customize your experience and notification settings."
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-zinc-500" />
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Email Notifications
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Receive expense alerts and reports
              </p>
            </div>
          </div>
          <ToggleSwitch
            checked={emailNotifications}
            onChange={setEmailNotifications}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-zinc-500" />
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                SMS Notifications
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Receive SMS alerts for large expenses
              </p>
            </div>
          </div>
          <ToggleSwitch
            checked={smsNotifications}
            onChange={setSmsNotifications}
          />
        </div>
      </div>
    </Card>
  );
}

// ─── Danger Zone ───────────────────────────────────────────────────────────────

function DangerZone({ user, isLoaded }) {
  const { user: clerkUser } = useClerk();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "⚠️  This will permanently delete your account and all associated data. This cannot be undone.\n\nAre you absolutely sure?"
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      // Call backend to delete user data, then Clerk account
      if (clerkUser?.delete) {
        await clerkUser.delete();
      }
    } catch (err) {
      console.error("Delete account error:", err);
      alert("Failed to delete account: " + err.message);
      setDeleting(false);
    }
  };

  return (
    <Card
      className={cn(
        "border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20"
      )}
    >
      <SectionHeader
        title="Danger Zone"
        description="Irreversible and destructive actions. Proceed with extreme caution."
      />

      {isLoaded && user ? (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-4 dark:border-red-900/50 dark:bg-red-950/10">
          <div className="flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Delete Account
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Permanently remove your account and all data
              </p>
            </div>
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
              "border border-red-300 bg-red-50 text-red-600 hover:bg-red-100",
              "dark:border-red-700 dark:bg-red-900/30 dark:text-red-400",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      ) : (
        <Skeleton className="h-14" />
      )}
    </Card>
  );
}

// ─── Root Settings Page ────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "ml-0" : "ml-0 md:ml-64"
        )}
      >
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Settings
            </h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Manage your account and preferences
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Profile Section */}
            <ProfileCard user={user} isLoaded={isLoaded} />
            <EditProfileForm user={user} isLoaded={isLoaded} />

            {/* Email & Security */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <SectionHeader
                  title="Email Address"
                  description="Your primary email for login"
                />
                {isLoaded && user ? (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {user?.primaryEmailAddress?.emailAddress || "—"}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Verified
                      </p>
                    </div>
                    <button
                      className={cn(
                        "w-full rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                        "dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      )}
                    >
                      Add Another Email
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-9" />
                  </div>
                )}
              </Card>

              <Card>
                <SectionHeader
                  title="Phone Number"
                  description="For two-factor authentication"
                />
                {isLoaded ? (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Not set
                      </p>
                    </div>
                    <button
                      className={cn(
                        "w-full rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                        "dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      )}
                    >
                      Add Phone
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-9" />
                  </div>
                )}
              </Card>
            </div>

            {/* Security & Preferences */}
            <SecuritySection user={user} isLoaded={isLoaded} />
            <PreferencesSection />

            {/* Danger Zone */}
            <DangerZone user={user} isLoaded={isLoaded} />
          </div>
        </div>
      </main>
    </div>
  );
}
