import api from './api';

export const hostelService = {
  async getAllHostels(params = {}) {
    const res = await api.get('/hostels', { params });
    return res.data || [];
  },

  async searchHostels(params = {}) {
    const res = await api.get('/hostels/search', { params });
    return res.data || [];
  },

  async liveSearchHostels(params = {}) {
    const res = await api.get('/hostels/live-search', { params });
    return res.data || { localResults: [], livePlaces: [], combined: [] };
  },

  async getHostelById(id, userLat, userLng) {
    const params = {};
    if (userLat && userLng) {
      params.userLat = userLat;
      params.userLng = userLng;
    }
    const res = await api.get(`/hostels/${id}`, { params });
    return res.data;
  },

  async getHostelReviews(id) {
    const res = await api.get(`/hostels/${id}/reviews`);
    return res.data || [];
  },

  async addReview(id, reviewData) {
    const res = await api.post(`/hostels/${id}/reviews`, reviewData);
    return res.data;
  },

  async createHostel(data) {
    const res = await api.post('/hostels', data);
    return res.data;
  },

  async updateHostel(id, data) {
    const res = await api.put(`/hostels/${id}`, data);
    return res.data;
  },

  async deleteHostel(id) {
    const res = await api.delete(`/hostels/${id}`);
    return res;
  }
};

export default hostelService;
