import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserButton,UserAvatar } from "@clerk/clerk-react";
import { LayoutDashboard, BarChart2, Settings, Upload, HelpCircle, LogOut } from "lucide-react";
const Sidebar = ({ isCollapsed, setIsCollapsed, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", path: "/dashboard" },
    { icon: <BarChart2 size={18} />, label: "Analytics", path: "/analytics" },
    { icon: <Upload size={18} />, label: "Uploads", path: "/uploads" },
    { icon: <Settings size={18} />, label: "Settings", path: "/settings" },
  ];
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`fixed top-5 z-50 w-9 h-9 rounded-lg bg-base-200 border border-base-300 flex items-center justify-center transition-all duration-300 shadow-md ${
          isCollapsed ? "left-3" : "left-64"
        }`}
      >
        {isCollapsed ? "→" : "←"}
      </button>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-base-100 border-r border-base-300 p-5 flex flex-col transition-transform duration-300 z-40 ${
          isCollapsed ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-bold">
            🔴
          </div>
          <h1 className="text-lg font-bold">StreamX</h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-primary text-primary-content"
                    : "hover:bg-base-200"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Divider */}
          <div className="divider my-3"></div>

          {/* Help */}
          <button
            onClick={() => navigate("/help")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-base-200"
          >
            <HelpCircle size={18} />
            Help & Support
          </button>
        </nav>

        {/* Footer */}
        <div className="mt-auto flex flex-col gap-3">
          
          {/* User */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-base-200">
            <UserButton />
            <span className="text-sm">My Profile</span>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
          <UserAvatar/>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;