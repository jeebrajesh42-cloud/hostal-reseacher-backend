const expenseModel = require('../models/expenseModel');
const budgetModel = require('../models/budgetModel');
const userModel = require('../models/userModel');

const expenseService = {
  async getExpenses(userId, queryParams = {}) {
    return await expenseModel.findByUserId(userId, queryParams);
  },

  async getExpenseById(id, userId) {
    const expense = await expenseModel.findById(id, userId);
    if (!expense) {
      const err = new Error('Expense record not found.');
      err.statusCode = 404;
      throw err;
    }
    return expense;
  },

  async createExpense(userId, data) {
    return await expenseModel.create({
      ...data,
      user_id: userId
    });
  },

  async updateExpense(id, userId, data) {
    const updated = await expenseModel.update(id, userId, data);
    if (!updated) {
      const err = new Error('Expense record not found or unauthorized.');
      err.statusCode = 404;
      throw err;
    }
    return updated;
  },

  async deleteExpense(id, userId) {
    const success = await expenseModel.delete(id, userId);
    if (!success) {
      const err = new Error('Expense record not found or unauthorized.');
      err.statusCode = 404;
      throw err;
    }
    return true;
  },

  async getAnalytics(userId, timeRange = '30d') {
    const allExpenses = await expenseModel.findByUserId(userId);
    const now = new Date();

    // Determine start date based on timeRange
    let startDate = new Date();
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const filteredExpenses = allExpenses.filter(e => new Date(e.expense_date) >= startDate);

    // Current month and previous month expenses for trend calculation
    const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthYear = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const currentMonthExpenses = allExpenses.filter(e => e.expense_date.startsWith(currentMonthYear));
    const prevMonthExpenses = allExpenses.filter(e => e.expense_date.startsWith(prevMonthYear));

    const totalSpending = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const currentMonthTotal = currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const prevMonthTotal = prevMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);

    // Category aggregations for filtered range
    const categoryTotals = {};
    filteredExpenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const categoryBreakdown = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      percentage: totalSpending > 0 ? parseFloat(((value / totalSpending) * 100).toFixed(1)) : 0
    })).sort((a, b) => b.value - a.value);

    // Core KPI Metrics
    const hostelExpense = (categoryTotals['Hostel Rent'] || 0) + (categoryTotals['Security Deposit'] || 0);
    const foodExpense = categoryTotals['Food'] || 0;
    const transportationExpense = categoryTotals['Transportation'] || 0;
    const otherExpense = totalSpending - (hostelExpense + foodExpense + transportationExpense);

    // Monthly Trend Chart Data (Last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      
      const monthExps = allExpenses.filter(e => e.expense_date.startsWith(ym));
      const mTotal = monthExps.reduce((sum, e) => sum + e.amount, 0);
      const mHostel = monthExps.filter(e => e.category === 'Hostel Rent' || e.category === 'Security Deposit')
        .reduce((sum, e) => sum + e.amount, 0);
      const mFood = monthExps.filter(e => e.category === 'Food')
        .reduce((sum, e) => sum + e.amount, 0);
      const mOther = mTotal - (mHostel + mFood);

      monthlyTrend.push({
        month: monthLabel,
        total: parseFloat(mTotal.toFixed(2)),
        hostel: parseFloat(mHostel.toFixed(2)),
        food: parseFloat(mFood.toFixed(2)),
        other: parseFloat(mOther.toFixed(2))
      });
    }

    // Daily breakdown for shorter windows (7d or 30d)
    const dailyTrend = [];
    if (timeRange === '7d' || timeRange === '30d') {
      const daysCount = timeRange === '7d' ? 7 : 30;
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const ymd = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
        const dayTotal = filteredExpenses
          .filter(e => e.expense_date === ymd)
          .reduce((sum, e) => sum + e.amount, 0);

        dailyTrend.push({
          date: dayLabel,
          amount: parseFloat(dayTotal.toFixed(2))
        });
      }
    }

    // Budget Progress for current month
    const user = await userModel.findById(userId);
    const customBudget = await budgetModel.getBudget(userId, now.getMonth() + 1, now.getFullYear());
    const monthlyBudget = customBudget ? customBudget.amount : (user?.monthly_budget || 15000);
    const remainingBudget = Math.max(0, monthlyBudget - currentMonthTotal);
    const budgetUtilizationPct = monthlyBudget > 0 
      ? Math.min(100, parseFloat(((currentMonthTotal / monthlyBudget) * 100).toFixed(1)))
      : 0;

    // Rule-based Smart Insights
    const insights = [];

    // Insight 1: Food expense percentage
    if (totalSpending > 0 && foodExpense > 0) {
      const foodPct = Math.round((foodExpense / totalSpending) * 100);
      insights.push({
        id: 'food-pct',
        type: foodPct > 35 ? 'warning' : 'info',
        text: `Your food expenses account for ${foodPct}% of your total spending.`
      });
    }

    // Insight 2: Hostel costs share
    if (totalSpending > 0 && hostelExpense > 0) {
      const hostelPct = Math.round((hostelExpense / totalSpending) * 100);
      insights.push({
        id: 'hostel-share',
        type: 'info',
        text: `Your hostel-related living costs account for ${hostelPct}% of your total expenses.`
      });
    }

    // Insight 3: Month-over-month trend
    if (prevMonthTotal > 0) {
      const diff = currentMonthTotal - prevMonthTotal;
      const pctChange = Math.abs(Math.round((diff / prevMonthTotal) * 100));
      if (diff > 0) {
        insights.push({
          id: 'mom-increase',
          type: 'warning',
          text: `Your monthly spending increased by ${pctChange}% compared with last month.`
        });
      } else if (diff < 0) {
        insights.push({
          id: 'mom-decrease',
          type: 'success',
          text: `Great job! Your monthly spending decreased by ${pctChange}% compared with last month.`
        });
      }
    }

    // Insight 4: Transportation trend
    const currentTransport = currentMonthExpenses.filter(e => e.category === 'Transportation').reduce((s, e) => s + e.amount, 0);
    const prevTransport = prevMonthExpenses.filter(e => e.category === 'Transportation').reduce((s, e) => s + e.amount, 0);
    if (prevTransport > 0 && currentTransport > prevTransport) {
      insights.push({
        id: 'trans-increase',
        type: 'warning',
        text: 'Your transportation expenses increased compared with last month.'
      });
    }

    // Insight 5: Budget utilization alert
    if (budgetUtilizationPct >= 90) {
      insights.push({
        id: 'budget-critical',
        type: 'danger',
        text: `Alert: You have utilized ${budgetUtilizationPct}% of your ₹${monthlyBudget.toLocaleString('en-IN')} budget.`
      });
    } else if (budgetUtilizationPct >= 75) {
      insights.push({
        id: 'budget-warning',
        type: 'warning',
        text: `Heads up: You have reached ${budgetUtilizationPct}% of your monthly budget limit.`
      });
    } else {
      insights.push({
        id: 'budget-healthy',
        type: 'success',
        text: `You are on track! Remaining budget for this month is ₹${remainingBudget.toLocaleString('en-IN')}.`
      });
    }

    return {
      timeRange,
      kpis: {
        totalMonthlyExpense: parseFloat(currentMonthTotal.toFixed(2)),
        totalHostelExpense: parseFloat(hostelExpense.toFixed(2)),
        totalFoodExpense: parseFloat(foodExpense.toFixed(2)),
        totalTransportation: parseFloat(transportationExpense.toFixed(2)),
        totalOtherExpense: parseFloat(otherExpense.toFixed(2)),
        periodTotal: parseFloat(totalSpending.toFixed(2))
      },
      budget: {
        monthlyBudget,
        currentSpending: parseFloat(currentMonthTotal.toFixed(2)),
        remainingBudget: parseFloat(remainingBudget.toFixed(2)),
        utilizationPercentage: budgetUtilizationPct
      },
      categoryBreakdown,
      monthlyTrend,
      dailyTrend,
      insights
    };
  },

  async getBudget(userId) {
    const now = new Date();
    const user = await userModel.findById(userId);
    const custom = await budgetModel.getBudget(userId, now.getMonth() + 1, now.getFullYear());
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      amount: custom ? custom.amount : (user?.monthly_budget || 15000.00)
    };
  },

  async setBudget(userId, amount) {
    const now = new Date();
    const budget = await budgetModel.setBudget(userId, now.getMonth() + 1, now.getFullYear(), amount);
    await userModel.update(userId, { monthly_budget: parseFloat(amount) });
    return budget;
  }
};

module.exports = expenseService;
