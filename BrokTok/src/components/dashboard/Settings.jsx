import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { LogOut, Lock, Mail, Smartphone, Trash2, Bell, Moon } from "lucide-react";
import Sidebar from "../common/Sidebar";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Initialize form with user data
  useEffect(() => {
    if (isLoaded && user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user, isLoaded]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setMessage("");

    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setMessage({ text: "Profile updated successfully!", type: "success" });
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage({ text: "Failed to update profile: " + error.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      await signOut();
      navigate("/");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "⚠️  This will permanently delete your account and all data. This cannot be undone.\n\nType your email to confirm."
    );
    
    if (confirmed) {
      const email = prompt("Enter your email address to confirm deletion:");
      if (email === user?.primaryEmailAddress?.emailAddress) {
        try {
          await user.delete();
          navigate("/");
        } catch (error) {
          alert("Error deleting account: " + error.message);
        }
      } else {
        alert("Email does not match. Account deletion cancelled.");
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isCollapsed ? "ml-0" : "ml-0 md:ml-64"}`}>
        <div className="max-w-5xl mx-auto px-4 py-8 md:px-6 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your account preferences and security
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            {["profile", "security", "preferences", "danger"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Avatar Card */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                  Profile Picture
                </h2>
                <div className="flex items-center gap-6">
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt="Avatar"
                      className="h-20 w-20 rounded-full object-cover border-2 border-indigo-200"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {user?.firstName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0] || "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 mb-2">
                      Your avatar is powered by your email
                    </p>
                    <a
                      href="https://gravatar.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                    >
                      Update on Gravatar →
                    </a>
                  </div>
                </div>
              </div>

              {/* Edit Profile Card */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                  Personal Information
                </h2>
                <div className="space-y-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
                      Email Address
                    </label>
                    <div className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                      {user?.primaryEmailAddress?.emailAddress || "—"}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                      Email changes must be done through Clerk dashboard
                    </p>
                  </div>

                  {/* Status Message */}
                  {message && (
                    <div
                      className={`p-3 rounded-lg text-sm font-medium ${
                        message.type === "success"
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => {
                        setFirstName(user?.firstName || "");
                        setLastName(user?.lastName || "");
                      }}
                      className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium text-sm transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                  Security Settings
                </h2>
                <div className="space-y-4">
                  {/* Password */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">Password</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium transition">
                      Change
                    </button>
                  </div>

                  {/* Two Factor */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">Two-Factor Authentication</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Not enabled</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium transition">
                      Enable
                    </button>
                  </div>

                  {/* Active Sessions */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wide">
                      Active Sessions
                    </p>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">This Browser</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Chrome on Windows • Last active now</p>
                        </div>
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                      </div>
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">Email Notifications</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Receive alerts and reports</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="w-5 h-5 accent-indigo-600"
                      />
                    </label>
                  </div>

                  {/* SMS Notifications */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">SMS Notifications</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Get SMS for large expenses</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center">
                      <input type="checkbox" className="w-5 h-5 accent-indigo-600" />
                    </label>
                  </div>

                  {/* Dark Mode */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">Dark Mode</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Better for your eyes</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                        className="w-5 h-5 accent-indigo-600"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Danger Tab */}
          {activeTab === "danger" && (
            <div className="space-y-6">
              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900 p-6">
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">
                  Danger Zone
                </h2>
                <p className="text-sm text-red-800 dark:text-red-300 mb-6">
                  These actions are irreversible. Proceed with extreme caution.
                </p>

                {/* Delete Account */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-red-950/30 rounded-lg border border-red-300 dark:border-red-900">
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">Delete Account</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Permanently remove your account and data</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}