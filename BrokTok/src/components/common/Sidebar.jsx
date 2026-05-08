import { useNavigate, useLocation } from "react-router-dom";
import { UserButton, UserAvatar } from "@clerk/clerk-react";
import { Helmet } from "react-helmet";
import { LayoutDashboard, BarChart2, Settings, Upload, HelpCircle, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
const Sidebar = ({ isCollapsed, setIsCollapsed, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", path: "/dashboard" },
    { icon: <BarChart2 size={18} />, label: "Analytics", path: "/analytics" },
    { icon: <Upload size={18} />, label: "Uploads", path: "/uploads" },
    { icon: <Settings size={18} />, label: "Settings", path: "/settings" },
  ];
  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileOpen(false); // Close mobile menu after navigation
  };
  return (
    <>
      {/* Mobile Hamburger Button - Visible only on mobile */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-11 h-11 rounded-lg bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-all shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      {/* Desktop Toggle Button - Hidden on mobile */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`hidden md:flex fixed top-5 z-50 w-10 h-10 rounded-lg bg-base-200 border border-base-300 items-center justify-center transition-all duration-300 shadow-md ${
          isCollapsed ? "left-3" : "left-64"
        }`}
        aria-label="Toggle sidebar"
      >
        {isCollapsed ? "→" : "←"}
      </button>

      {/* Mobile Overlay - Visible on mobile when menu is open */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black z-30"
          onClick={() => setIsMobileOpen(false)}
          style={{ 
            pointerEvents: 'auto',
            opacity: 0.05,
            backgroundColor: 'rgba(0, 0, 0, 0.05)'
          }}
        />
      )}

      {/* Sidebar - Mobile Version */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-300 p-5 flex flex-col transition-transform duration-300 z-40 shadow-lg ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 mt-12">
          <img src="/financino.svg" alt="Financino Logo" className="w-8 h-8" />
          <h1 className="text-lg font-bold">Financino</h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={i}
                onClick={() => handleNavClick(item.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all min-h-12 ${
                  isActive
                    ? "bg-purple-600 text-white"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* Divider */}
          <div className="divider my-4"></div>

          {/* Help */}
          <button
            onClick={() => handleNavClick("/help")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-gray-100 transition-all min-h-12 text-gray-800"
          >
            <HelpCircle size={18} />
            Help & Support
          </button>
        </nav>

        {/* Footer */}
        <div className="mt-auto flex flex-col gap-3">
          {/* User Profile */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 cursor-pointer hover:bg-gray-200 transition">
            <UserAvatar />
            <span className="text-sm font-medium text-gray-800">My Profile</span>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              onLogout();
              setIsMobileOpen(false);
            }}
            className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-3 rounded-lg text-sm hover:bg-red-600 transition-all min-h-12 font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar - Desktop Version */}
      <aside
        className={`hidden md:flex fixed top-0 left-0 h-screen w-64 bg-base-100 border-r border-base-300 p-5 flex-col transition-all duration-300 z-40 ${
          isCollapsed ? "md:-translate-x-full" : "md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <img src="/financino.svg" alt="Financino Logo" className="w-8 h-8" />
          <h1 className="text-lg font-bold">Financino</h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-purple-600 text-white"
                    : "hover:bg-base-200 text-base-content"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* Divider */}
          <div className="divider my-3"></div>

          {/* Help */}
          <button
            onClick={() => navigate("/help")}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm hover:bg-base-200 transition-all"
          >
            <HelpCircle size={18} />
            Help & Support
          </button>
        </nav>

        {/* Footer */}
        <div className="mt-auto flex flex-col gap-3">
          {/* User Profile */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-base-200 cursor-pointer hover:bg-base-300 transition">
            <UserAvatar />
            <span className="text-sm font-medium">My Profile</span>
          </div>
          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-all font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
      {/* Spacer for desktop - Maintains layout when sidebar is expanded */}
      <div
        className={`hidden md:block transition-all duration-300 ${
          isCollapsed ? "w-0" : "w-64"
        }`}
      />
    </>
  );
};
export default Sidebar;