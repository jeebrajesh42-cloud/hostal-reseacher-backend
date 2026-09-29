import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ExploreHostels from './pages/ExploreHostels';
import HostelDetailsPage from './pages/HostelDetailsPage';
import CompareHostels from './pages/CompareHostels';
import Favorites from './pages/Favorites';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import LocationModal from './components/LocationModal';
import { useAuth } from './context/AuthContext';
import { useApp } from './context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Heart, Building2 } from 'lucide-react';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const ToastNotification = () => {
  const { toast } = useApp();
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    danger: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-200 bg-white text-secondary-900',
    warning: 'border-amber-200 bg-white text-secondary-900',
    danger: 'border-rose-200 bg-white text-secondary-900',
    info: 'border-blue-200 bg-white text-secondary-900'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in max-w-sm">
      <div className={`p-4 rounded-2xl shadow-elevated border flex items-center gap-3 ${borders[toast.type] || borders.info}`}>
        {icons[toast.type] || icons.info}
        <span className="text-xs font-semibold">{toast.message}</span>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-secondary-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<ExploreHostels />} />
          <Route path="/hostels/:id" element={<HostelDetailsPage />} />
          <Route path="/compare" element={<CompareHostels />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Student Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <LocationModal />
      <ToastNotification />

      {/* Modern Footer with Disclaimer */}
      <footer className="mt-auto border-t border-slate-200 bg-white/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary-500">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary-600" />
            <span className="font-bold text-secondary-800">HostelTracker</span>
            <span>— Student Hostel Discovery & Expense Management Platform</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
              ✓ Verified Places
            </span>
            <span>Real student hostels & PG accommodations with direct Google Maps place links.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
