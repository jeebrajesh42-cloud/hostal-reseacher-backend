import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Compass, Layers, Receipt, PieChart, Heart, 
  ArrowRight, Plus, Wallet, Sparkles, TrendingUp, Clock 
} from 'lucide-react';
import ExpenseCard from '../components/ExpenseCard';
import HostelCard from '../components/HostelCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import expenseService from '../services/expenseService';
import hostelService from '../services/hostelService';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { userCoordinates } = useApp();

  const [analytics, setAnalytics] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [nearbyHostels, setNearbyHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [stats, expList, hostels] = await Promise.all([
          expenseService.getAnalytics('30d'),
          expenseService.getExpenses(),
          hostelService.getAllHostels({
            userLat: userCoordinates.lat,
            userLng: userCoordinates.lng,
            sort: 'highest_rating'
          })
        ]);

        setAnalytics(stats);
        setRecentExpenses(expList.slice(0, 4));
        setNearbyHostels(hostels.slice(0, 3));
      } catch (err) {
        console.warn('Dashboard load error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userCoordinates]);

  if (loading) {
    return <LoadingSpinner text="Preparing your student dashboard..." size="lg" />;
  }

  const budget = analytics?.budget || {
    monthlyBudget: user?.monthly_budget || 15000,
    currentSpending: 0,
    remainingBudget: 15000,
    utilizationPercentage: 0
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-900 via-secondary-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-elevated relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="px-3 py-1 rounded-full bg-white/10 text-primary-200 text-xs font-semibold backdrop-blur inline-block">
            Student Decision & Expense Center
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {getGreeting()}, {user?.name || 'Student'}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Your recorded spending this month is{' '}
            <strong className="text-white font-bold">
              ₹{budget.currentSpending?.toLocaleString('en-IN')}
            </strong>
            . You have{' '}
            <strong className="text-emerald-400 font-bold">
              ₹{budget.remainingBudget?.toLocaleString('en-IN')}
            </strong>{' '}
            remaining in your monthly budget.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-primary-700 font-bold text-xs hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Hostels</span>
            </Link>
            <Link
              to="/expenses"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Expense</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Monthly Budget Summary Cards (Section 20) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-2">
          <span className="text-xs font-bold text-secondary-500 uppercase tracking-wider block">
            Monthly Budget
          </span>
          <div className="text-3xl font-black text-secondary-900">
            ₹{budget.monthlyBudget?.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-secondary-400 block">Target limit set for this month</span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-2">
          <span className="text-xs font-bold text-secondary-500 uppercase tracking-wider block">
            Spent So Far
          </span>
          <div className="text-3xl font-black text-primary-600">
            ₹{budget.currentSpending?.toLocaleString('en-IN')}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-1">
            <div
              className={`h-full ${
                budget.utilizationPercentage > 85
                  ? 'bg-rose-500'
                  : budget.utilizationPercentage > 60
                  ? 'bg-amber-400'
                  : 'bg-primary-600'
              }`}
              style={{ width: `${Math.min(100, budget.utilizationPercentage)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-2">
          <span className="text-xs font-bold text-secondary-500 uppercase tracking-wider block">
            Remaining Budget
          </span>
          <div className="text-3xl font-black text-emerald-600">
            ₹{budget.remainingBudget?.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-emerald-700 font-semibold block">
            {100 - budget.utilizationPercentage}% of budget available
          </span>
        </div>
      </div>

      {/* Main Two-Column Row: Recent Expenses Left, Recommended Hostels Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Expenses List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-secondary-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary-600" />
              <span>Recent Living Expenses</span>
            </h2>
            <Link
              to="/expenses"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentExpenses.length === 0 ? (
              <p className="text-xs text-secondary-400 p-4 bg-white rounded-2xl text-center">
                No recent expenses recorded.
              </p>
            ) : (
              recentExpenses.map((exp) => (
                <ExpenseCard
                  key={exp.id}
                  expense={exp}
                  onEdit={() => (window.location.href = '/expenses')}
                  onDelete={() => (window.location.href = '/expenses')}
                />
              ))
            )}
          </div>
        </div>

        {/* Quick Analytics & Insights Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
            <h3 className="font-bold text-sm text-secondary-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Smart Insight</span>
            </h3>

            {analytics?.insights?.[0] ? (
              <div className="p-4 rounded-2xl bg-primary-50/60 border border-primary-100 text-xs text-primary-900 leading-relaxed">
                {analytics.insights[0].text}
              </div>
            ) : (
              <p className="text-xs text-secondary-400">Log expenses to see smart budgeting insights.</p>
            )}

            <Link
              to="/analytics"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-secondary-800 font-semibold text-xs transition-colors"
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Open Full Analytics</span>
            </Link>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-3">
            <h3 className="font-bold text-sm text-secondary-900">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Link
                to="/compare"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-secondary-700 flex flex-col items-center gap-1 text-center"
              >
                <Layers className="w-4 h-4 text-primary-600" />
                <span>Compare Hostels</span>
              </Link>
              <Link
                to="/favorites"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-secondary-700 flex flex-col items-center gap-1 text-center"
              >
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Saved Hostels</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Nearby Hostels */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-secondary-900">
              Nearby Student Hostels
            </h2>
            <p className="text-xs text-secondary-500">
              Verified accommodations close to coaching centers & universities
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
          >
            <span>Browse More</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {nearbyHostels.map((h) => (
            <HostelCard key={h.id} hostel={h} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
