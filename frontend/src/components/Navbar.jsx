import React from 'react';
import { Bell, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const roleColors = {
  ADMIN: 'bg-red-50 text-red-700 border-red-200',
  BASE_COMMANDER: 'bg-amber-50 text-amber-700 border-amber-200',
  LOGISTICS_OFFICER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const roleLabels = {
  ADMIN: 'Admin',
  BASE_COMMANDER: 'Commander',
  LOGISTICS_OFFICER: 'Logistics',
};

const pageTitles = {
  '/dashboard':   'Operational Dashboard',
  '/purchases':   'Purchases',
  '/transfers':   'Transfers',
  '/assignments': 'Assignments & Expenditures',
  '/audit':       'Audit Log',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pageTitle = pageTitles[location.pathname] || 'MAMS';

  return (
    <header className="h-16 border-b border-surface-200 flex items-center justify-between px-6 bg-white sticky top-0 z-40 shadow-sm">

      {/* Page title */}
      <h1 className="text-xl font-bold text-slate-800 tracking-tight">{pageTitle}</h1>

      {/* Right actions */}
      <div className="flex items-center gap-3">

        {/* Notification bell */}
        <button
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-surface-100 hover:text-slate-700 transition-all"
          id="navbar-bell-btn"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-surface-200" />

        {/* User chip */}
        {user && (
          <div className="flex items-center gap-2.5">
            <span className={`badge border text-xs font-semibold hidden sm:flex ${roleColors[user.role] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
              {roleLabels[user.role] || user.role}
            </span>

            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-700 leading-tight">{user.username}</p>
                <p className="text-xs text-slate-400 leading-tight">{user.baseName || 'All Bases'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              id="logout-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
