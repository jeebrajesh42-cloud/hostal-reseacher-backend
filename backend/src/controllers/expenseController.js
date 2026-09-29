const expenseService = require('../services/expenseService');

const expenseController = {
  async getAll(req, res, next) {
    try {
      const expenses = await expenseService.getExpenses(req.user.id, req.query);
      res.status(200).json({
        success: true,
        count: expenses.length,
        data: expenses
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const expense = await expenseService.getExpenseById(id, req.user.id);
      res.status(200).json({
        success: true,
        data: expense
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const created = await expenseService.createExpense(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Expense recorded successfully.',
        data: created
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await expenseService.updateExpense(id, req.user.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Expense updated successfully.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await expenseService.deleteExpense(id, req.user.id);
      res.status(200).json({
        success: true,
        message: 'Expense deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  },

  async getAnalytics(req, res, next) {
    try {
      const { timeRange } = req.query;
      const analytics = await expenseService.getAnalytics(req.user.id, timeRange || '30d');
      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (err) {
      next(err);
    }
  },

  async getMonthly(req, res, next) {
    try {
      const analytics = await expenseService.getAnalytics(req.user.id, '6m');
      res.status(200).json({
        success: true,
        data: analytics.monthlyTrend
      });
    } catch (err) {
      next(err);
    }
  },

  async getCategories(req, res, next) {
    try {
      const { timeRange } = req.query;
      const analytics = await expenseService.getAnalytics(req.user.id, timeRange || '30d');
      res.status(200).json({
        success: true,
        data: analytics.categoryBreakdown
      });
    } catch (err) {
      next(err);
    }
  },

  async getBudget(req, res, next) {
    try {
      const budget = await expenseService.getBudget(req.user.id);
      res.status(200).json({
        success: true,
        data: budget
      });
    } catch (err) {
      next(err);
    }
  },

  async setBudget(req, res, next) {
    try {
      const { amount } = req.body;
      if (!amount || isNaN(parseFloat(amount))) {
        return res.status(400).json({
          success: false,
          message: 'Valid budget amount is required.'
        });
      }
      const budget = await expenseService.setBudget(req.user.id, amount);
      res.status(200).json({
        success: true,
        message: 'Monthly budget updated successfully.',
        data: budget
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = expenseController;
