import api from './api';

export const expenseService = {
  async getExpenses(params = {}) {
    const res = await api.get('/expenses', { params });
    return res.data || [];
  },

  async getExpenseById(id) {
    const res = await api.get(`/expenses/${id}`);
    return res.data;
  },

  async createExpense(data) {
    const res = await api.post('/expenses', data);
    return res.data;
  },

  async updateExpense(id, data) {
    const res = await api.put(`/expenses/${id}`, data);
    return res.data;
  },

  async deleteExpense(id) {
    const res = await api.delete(`/expenses/${id}`);
    return res;
  },

  async getAnalytics(timeRange = '30d') {
    const res = await api.get('/expenses/analytics', { params: { timeRange } });
    return res.data;
  },

  async getMonthlyTrend() {
    const res = await api.get('/expenses/monthly');
    return res.data || [];
  },

  async getCategories(timeRange = '30d') {
    const res = await api.get('/expenses/categories', { params: { timeRange } });
    return res.data || [];
  },

  async getBudget() {
    const res = await api.get('/expenses/budget');
    return res.data;
  },

  async setBudget(amount) {
    const res = await api.post('/expenses/budget', { amount });
    return res.data;
  },

  // Favorites operations
  async getFavorites() {
    const res = await api.get('/favorites');
    return res.data || [];
  },

  async addFavorite(hostelId) {
    const res = await api.post('/favorites', { hostelId });
    return res.data;
  },

  async removeFavorite(hostelId) {
    const res = await api.delete(`/favorites/${hostelId}`);
    return res;
  }
};

export default expenseService;
