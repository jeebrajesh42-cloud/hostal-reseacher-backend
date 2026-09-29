import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Building2, Compass, Layers, Receipt, PieChart, Heart, 
  User, ShieldCheck, Wallet, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const Sidebar = () => {
  const { user } = useAuth();
  const { comparedHostels, favoriteHostels } = useApp();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Building2 },
    { label: 'Explore Hostels', path: '/explore', icon: Compass },
    { 
      label: 'Compare Hostels', 
      path: '/compare', 
      icon: Layers, 
      badge: comparedHostels.length || null 
    },
    { label: 'Expense Tracker', path: '/expenses', icon: Receipt },
    { label: 'Financial Analytics', path: '/analytics', icon: PieChart },
    { 
      label: 'Favorite Hostels', 
      path: '/favorites', 
      icon: Heart, 
      badge: favoriteHostels.length || null 
    },
    { label: 'Student Profile', path: '/profile', icon: User }
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:block">
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-subtle sticky top-24 space-y-6">
        {/* User Card */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <img
            src={user?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2563EB&color=fff`}
            alt={user?.name}
            className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
          />
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm text-secondary-900 truncate">{user?.name}</h4>
            <p className="text-xs text-secondary-500 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-bold'
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Student Budget Quick Info Widget */}
        <div className="bg-gradient-to-br from-primary-50 to-blue-50/50 rounded-2xl p-4 border border-primary-100/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary-900 mb-1">
            <Wallet className="w-3.5 h-3.5 text-primary-600" />
            <span>Monthly Target</span>
          </div>
          <p className="text-lg font-extrabold text-primary-700">
            ₹{(user?.monthly_budget || 15000).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-primary-600/80 mt-1">
            Preferred: {user?.preferred_city || 'Bhopal'}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
