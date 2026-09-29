import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, Compass, Layers, Receipt, PieChart, Heart, 
  User, LogOut, Menu, X, Navigation, Shield, MapPin, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const {
    comparedHostels,
    favoriteHostels,
    userCoordinates,
    requestBrowserLocation,
    setIsLocationModalOpen,
    openInGoogleMaps
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Explore', path: '/explore', icon: Compass },
    { 
      label: 'Compare', 
      path: '/compare', 
      icon: Layers, 
      badge: comparedHostels.length > 0 ? comparedHostels.length : null 
    },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Analytics', path: '/analytics', icon: PieChart },
    { 
      label: 'Favorites', 
      path: '/favorites', 
      icon: Heart, 
      badge: favoriteHostels.length > 0 ? favoriteHostels.length : null 
    },
    { label: 'Dashboard', path: '/dashboard', icon: Building2 }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-secondary-900 group-hover:text-primary-600 transition-colors">
                Hostel<span className="text-primary-600">Tracker</span>
              </span>
              <span className="hidden sm:block text-[10px] font-semibold text-secondary-400 tracking-wider uppercase -mt-0.5">
                Research & Expenses
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-primary-600' : 'text-secondary-400'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Menu */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Location Selector Pill */}
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-all text-secondary-800 shadow-xs max-w-[190px]"
              title="Click to select city, student hub, or area"
            >
              <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              <span className="truncate">{userCoordinates.label || 'Select Location'}</span>
              <span className="text-[10px] text-secondary-400 font-semibold">▼</span>
            </button>

            {/* GPS quick button */}
            <button
              onClick={requestBrowserLocation}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                userCoordinates.hasLocation
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title={userCoordinates.hasLocation ? 'Using active coordinates' : 'Click to enable device GPS location'}
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold">GPS</span>
            </button>

            {/* View on Google Maps quick button */}
            <button
              type="button"
              onClick={() => openInGoogleMaps(userCoordinates.lat, userCoordinates.lng, userCoordinates.label)}
              className="p-2 px-2.5 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Open active location on Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px]">Map ↗</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <img
                    src={user?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2563EB&color=fff`}
                    alt={user?.name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                  />
                  <div className="text-left">
                    <span className="text-xs font-bold text-secondary-900 block leading-tight">
                      {user?.name?.split(' ')[0]}
                    </span>
                    {user?.role === 'admin' ? (
                      <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5" /> Admin
                      </span>
                    ) : (
                      <span className="text-[10px] text-secondary-400 block leading-tight">Student</span>
                    )}
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-secondary-700 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl">
          {/* Mobile Location Selector & Map Row */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsLocationModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-between p-3 rounded-2xl bg-primary-50/70 border border-primary-200 text-xs font-bold text-primary-900 truncate"
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-primary-600 shrink-0" />
                <span className="truncate">📍 {userCoordinates.label}</span>
              </div>
              <span className="text-[11px] text-primary-700 underline font-semibold shrink-0">Change</span>
            </button>

            <button
              type="button"
              onClick={() => openInGoogleMaps(userCoordinates.lat, userCoordinates.lng, userCoordinates.label)}
              className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1 shrink-0"
              title="View on Google Maps"
            >
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span>Map ↗</span>
            </button>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 text-secondary-900 font-medium text-xs"
                >
                  <User className="w-4 h-4 text-primary-600" />
                  <span>My Student Profile ({user?.name})</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 text-rose-700 font-semibold text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center rounded-xl bg-slate-100 text-secondary-900 font-semibold text-xs"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center rounded-xl bg-primary-600 text-white font-semibold text-xs shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
