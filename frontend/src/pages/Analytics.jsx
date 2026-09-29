import React, { useState, useEffect } from 'react';
import { 
  PieChart as PieIcon, TrendingUp, Sparkles, AlertCircle, 
  CheckCircle, ArrowUpRight, ArrowDownRight, Calendar, DollarSign 
} from 'lucide-react';
import { SpendingTrendChart, CategoryPieChart, MonthlyBarChart } from '../components/ExpenseChart';
import { LoadingSpinner } from '../components/LoadingSpinner';
import expenseService from '../services/expenseService';
import { useAuth } from '../context/AuthContext';

const TIME_RANGES = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '3m', label: 'Last 3 Months' },
  { id: '6m', label: 'Last 6 Months' },
  { id: '1y', label: 'Last 1 Year' }
];

const Analytics = () => {
  const { isAuthenticated } = useAuth();
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const data = await expenseService.getAnalytics(selectedTimeRange);
        setAnalytics(data);
      } catch (err) {
        console.warn('Failed to load analytics:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [selectedTimeRange, isAuthenticated]);

  if (loading) {
    return <LoadingSpinner text="Computing student spending analytics & insights..." size="lg" />;
  }

  const kpis = analytics?.kpis || {};
  const budget = analytics?.budget || {};
  const insights = analytics?.insights || [];

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Top Header with Time Filters */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-1">
            Financial Intelligence
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-secondary-900 tracking-tight">
            Spending Analytics & Insights
          </h1>
          <p className="text-xs text-secondary-500 mt-1">
            Visual breakdown of your student life expenditures and monthly hostel budget.
          </p>
        </div>

        {/* Time Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl shrink-0 overflow-x-auto">
          {TIME_RANGES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTimeRange(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTimeRange === t.id
                  ? 'bg-white text-secondary-900 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Smart Rule-Based Spending Insights Cards (Section 11) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white/10 text-amber-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Smart Spending Insights</h2>
            <p className="text-xs text-slate-300">
              Automated financial observations derived from your recorded expenses
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10 flex items-start gap-3"
            >
              {insight.type === 'danger' ? (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : insight.type === 'warning' ? (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <p className="text-xs leading-relaxed text-slate-200">
                {insight.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Numbers Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
          <span className="text-xs text-secondary-500 font-semibold block">Period Spending</span>
          <div className="text-2xl font-black text-secondary-900 mt-1">
            ₹{kpis.periodTotal?.toLocaleString('en-IN') || '0'}
          </div>
          <span className="text-[11px] text-secondary-400">Selected timeframe</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
          <span className="text-xs text-secondary-500 font-semibold block">Hostel Share</span>
          <div className="text-2xl font-black text-primary-600 mt-1">
            ₹{kpis.totalHostelExpense?.toLocaleString('en-IN') || '0'}
          </div>
          <span className="text-[11px] text-secondary-400">Rent & deposits</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
          <span className="text-xs text-secondary-500 font-semibold block">Food & Dining</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            ₹{kpis.totalFoodExpense?.toLocaleString('en-IN') || '0'}
          </div>
          <span className="text-[11px] text-secondary-400">Mess plan & groceries</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
          <span className="text-xs text-secondary-500 font-semibold block">Commute / Transit</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            ₹{kpis.totalTransportation?.toLocaleString('en-IN') || '0'}
          </div>
          <span className="text-[11px] text-secondary-400">Bus, Metro, Auto</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Monthly Spending Trend */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-secondary-900">
              Spending Trends (Last 6 Months)
            </h3>
            <span className="text-xs text-secondary-400 font-medium">Recharts Area</span>
          </div>
          <SpendingTrendChart data={analytics?.monthlyTrend || []} />
        </div>

        {/* Chart 2: Category Distribution Donut */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-secondary-900">
              Category Distribution
            </h3>
            <span className="text-xs text-secondary-400 font-medium">Percentage Share</span>
          </div>
          <CategoryPieChart data={analytics?.categoryBreakdown || []} />
        </div>

        {/* Chart 3: Monthly Bar Comparison */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-secondary-900">
              Monthly Cost Breakdown (Hostel vs Food vs Other)
            </h3>
            <span className="text-xs text-secondary-400 font-medium">Stacked Comparison</span>
          </div>
          <MonthlyBarChart data={analytics?.monthlyTrend || []} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
