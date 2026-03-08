import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isCollapsed, setIsCollapsed, currentUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const navItems = [
    { icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { icon: '📈', label: 'Analytics', path: '/analytics' },
    { icon: '⚙️', label: 'Settings', path: '/settings' },
    { icon: '📤', label: 'Uploads', path: '/uploads' },
  ];

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`fixed top-5 ${isCollapsed ? 'left-3' : 'left-64'} z-[1001] w-9 h-9 bg-[white]/95 backdrop-blur-md border border-white/10 rounded-lg text-black flex items-center justify-center transition-all duration-300 hover:bg-[white] hover:border-white/20 hover:scale-105 active:scale-95 shadow-lg`}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? '→' : '←'}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-[white]/98 backdrop-blur-xl border-r border-white/8 p-6 flex flex-col transition-transform duration-300 z-[1000] shadow-2xl overflow-y-auto ${isCollapsed ? '-translate-x-full' : 'translate-x-0'
          }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/8">
          <div className="w-10 h-10 bg-linear-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">
            💰
          </div>
          <div className="flex flex-col">
            <span className="text-black text-lg font-bold tracking-tight">ExpenseTrack</span>
            <span className="text-black-400 text-xs tracking-wide">Financial Manager</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm relative w-full text-left ${isActive
                  ? 'bg-emerald-500/12 text-emerald-400 font-semibold'
                  : 'text-gray-400 hover:bg-white/6 hover:text-white hover:translate-x-0.5'
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3/5 bg-emerald-400 rounded-r" />
                )}
                <span className="text-lg w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="h-px bg-white/10 my-5" />

          <button
            onClick={() => navigate('/help')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm text-gray-400 hover:bg-white/6 hover:text-white hover:translate-x-0.5 w-full text-left"
          >
            <span className="text-lg w-5 text-center">❓</span>
            <span>Help & Support</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-white/8">
          <div className="flex items-center justify-start mb-3 px-3 py-2 rounded-lg bg-white/3">
            <span className="text-white text-sm font-medium">{currentUser}</span>
          </div>
          <button onClick={() => onLogout && onLogout()} className="w-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:bg-indigo-500/25 hover:text-white hover:border-indigo-500/50 hover:-translate-y-0.5">
            Logout
          </button>
        </div>
      </aside >
    </>
  );
};

export default Sidebar;
