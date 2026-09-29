import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Wallet, Receipt, 
  ArrowUpRight, AlertCircle, CheckCircle, TrendingUp, Download, Edit2, Check 
} from 'lucide-react';
import ExpenseCard from '../components/ExpenseCard';
import ExpenseForm from '../components/ExpenseForm';
import EmptyState from '../components/EmptyState';
import { ExpenseCardSkeleton } from '../components/LoadingSpinner';
import expenseService from '../services/expenseService';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const CATEGORIES_FILTER = [
  'All',
  'Hostel Rent',
  'Food',
  'Electricity',
  'Transportation',
  'Groceries',
  'Education',
  'Entertainment',
  'Other'
];

const Expenses = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useApp();

  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingBudget, setEditingBudget] = useState(false);
  const [newBudgetAmount, setNewBudgetAmount] = useState('');

  const exportToCSV = () => {
    if (expenses.length === 0) {
      showToast('No expenses available to export.', 'warning');
      return;
    }
    const headers = ['Date', 'Category', 'Description', 'Amount', 'Payment Method', 'Hostel', 'Recurring', 'Notes'];
    const rows = expenses.map(e => [
      e.expense_date,
      `"${e.category}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount,
      e.payment_method,
      `"${e.hostels?.name || ''}"`,
      e.is_recurring ? 'Yes' : 'No',
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hostel_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Expense report downloaded as CSV!', 'success');
  };

  const handleUpdateBudget = async () => {
    const num = parseFloat(newBudgetAmount);
    if (isNaN(num) || num <= 0) {
      showToast('Please enter a valid budget amount.', 'warning');
      return;
    }
    try {
      await expenseService.setBudget(num);
      showToast('Monthly budget updated!', 'success');
      setEditingBudget(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update budget.', 'danger');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [expenseList, stats] = await Promise.all([
        expenseService.getExpenses(),
        expenseService.getAnalytics('30d')
      ]);
      setExpenses(expenseList);
      setAnalytics(stats);
    } catch (err) {
      console.warn('Failed to load expenses:', err.message);
      showToast(err.message || 'Could not fetch expenses.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleAddExpense = async (data) => {
    try {
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense.id, data);
        showToast('Expense updated successfully!', 'success');
      } else {
        await expenseService.createExpense(data);
        showToast('Expense recorded successfully!', 'success');
      }
      setEditingExpense(null);
      loadData();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await expenseService.deleteExpense(id);
      showToast('Expense deleted.', 'info');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete expense.', 'danger');
    }
  };

  const handleOpenEdit = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  // Filtered expenses list
  const filteredExpenses = expenses.filter((e) => {
    const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
    const matchesSearch = !searchQuery || e.description.toLowerCase().includes(searchQuery.toLowerCase()) || e.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const budget = analytics?.budget || {
    monthlyBudget: user?.monthly_budget || 15000,
    currentSpending: 0,
    remainingBudget: 15000,
    utilizationPercentage: 0
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-1">
            Student Financial Hub
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-secondary-900 tracking-tight">
            Expense Tracker
          </h1>
          <p className="text-xs text-secondary-500 mt-1">
            Keep track of monthly hostel room rent, mess charges, electricity bills, and daily living costs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-secondary-800 font-bold text-xs transition-colors"
            title="Download CSV expense report"
          >
            <Download className="w-4 h-4 text-secondary-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingExpense(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Expense</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs & Budget Progress */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1: Total Monthly */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle space-y-1">
          <span className="text-xs text-secondary-500 font-semibold block">Total Spending</span>
          <div className="text-2xl font-black text-secondary-900">
            ₹{analytics?.kpis?.totalMonthlyExpense?.toLocaleString('en-IN') || '0'}
          </div>
          <span className="text-[11px] text-secondary-400">Current calendar month</span>
        </div>

        {/* KPI 2: Hostel Cost */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle space-y-1">
          <span className="text-xs text-secondary-500 font-semibold block">Hostel & Rent</span>
          <div className="text-2xl font-black text-primary-600">
            ₹{analytics?.kpis?.totalHostelExpense?.toLocaleString('en-IN') || '0'}
          </div>
          <span className="text-[11px] text-secondary-400">Rent & Security Deposits</span>
        </div>

        {/* KPI 3: Food / Mess */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle space-y-1">
          <span className="text-xs text-secondary-500 font-semibold block">Food & Mess</span>
          <div className="text-2xl font-black text-emerald-600">
            ₹{analytics?.kpis?.totalFoodExpense?.toLocaleString('en-IN') || '0'}
          </div>
          <span className="text-[11px] text-secondary-400">Hostel mess & groceries</span>
        </div>

        {/* Monthly Budget Card with Progress */}
        <div className="bg-gradient-to-br from-slate-900 to-secondary-900 text-white rounded-2xl p-5 shadow-card space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-300">Monthly Budget</span>
              <button
                type="button"
                onClick={() => {
                  setNewBudgetAmount(budget.monthlyBudget || 15000);
                  setEditingBudget(!editingBudget);
                }}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Edit monthly budget"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
            <span className="text-xs font-bold text-amber-400">{budget.utilizationPercentage}%</span>
          </div>

          {editingBudget ? (
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-xs text-slate-400">₹</span>
              <input
                type="number"
                value={newBudgetAmount}
                onChange={(e) => setNewBudgetAmount(e.target.value)}
                className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs font-bold text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleUpdateBudget}
                className="p-1 rounded bg-primary-600 hover:bg-primary-700 text-white"
                title="Save budget"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-baseline">
              <div className="text-xl font-black">
                ₹{budget.currentSpending?.toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-slate-400">
                of ₹{budget.monthlyBudget?.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                budget.utilizationPercentage > 85
                  ? 'bg-rose-500'
                  : budget.utilizationPercentage > 65
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, budget.utilizationPercentage)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Remaining:</span>
            <span className="font-bold text-emerald-400">₹{budget.remainingBudget?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {CATEGORIES_FILTER.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-50 text-secondary-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <ExpenseCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredExpenses.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="No expenses recorded"
            description="You haven't recorded any expenses in this category yet. Click below to add your first expense."
            actionLabel="Add Expense"
            onAction={() => {
              setEditingExpense(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteExpense}
            />
          ))
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      <ExpenseForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleAddExpense}
        initialData={editingExpense}
      />
    </div>
  );
};

export default Expenses;
