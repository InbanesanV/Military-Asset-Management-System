import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, ArrowLeftRight,
  Users, ClipboardList, Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'],
  },
  {
    to: '/purchases',
    label: 'Purchases',
    icon: ShoppingCart,
    roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'],
  },
  {
    to: '/transfers',
    label: 'Transfers',
    icon: ArrowLeftRight,
    roles: ['ADMIN', 'LOGISTICS_OFFICER'],
  },
  {
    to: '/assignments',
    label: 'Assignments',
    icon: Users,
    roles: ['ADMIN', 'BASE_COMMANDER'],
  },
  {
    to: '/audit',
    label: 'Audit Log',
    icon: ClipboardList,
    roles: ['ADMIN'],
  },
];

const roleLabels = {
  ADMIN: 'Administrator',
  BASE_COMMANDER: 'Base Commander',
  LOGISTICS_OFFICER: 'Logistics Officer',
};

const Sidebar = () => {
  const { user } = useAuth();

  const allowedItems = navItems.filter(
    (item) => !user?.role || item.roles.includes(user.role)
  );

  return (
    <aside className="w-60 min-h-full flex flex-col py-5 px-3 shrink-0 bg-sidebar">

      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg overflow-hidden bg-white/10 p-1 shadow-sm">
          <img src={logoImg} alt="MAMS Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight">MAMS</p>
          <p className="text-sidebar-muted text-xs leading-tight">Asset Management</p>
        </div>
      </div>

      {/* Nav section label */}
      <p className="text-xs text-sidebar-muted uppercase tracking-widest px-2 mb-2 font-semibold">
        Navigation
      </p>

      {/* Nav Items */}
      <nav className="flex-1 space-y-0.5">
        {allowedItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            id={`nav-${to.replace('/', '')}`}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User chip at bottom */}
      {user && (
        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">
                {user.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user.username}</p>
              <p className="text-sidebar-muted text-xs truncate">{roleLabels[user.role] || user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
