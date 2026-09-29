const request = require('supertest');
const app = require('../src/app');

describe('Favorites & Reviews API Tests', () => {
  let token = '';
  let sampleHostelId = '';

  beforeAll(async () => {
    // Log in demo user to get JWT token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@demo.com',
        password: 'password123'
      });
    token = res.body.data.token;

    // Get a sample hostel
    const hostelRes = await request(app).get('/api/hostels');
    sampleHostelId = hostelRes.body.data[0].id;
  });

  describe('Favorites API', () => {
    it('should reject favorites access without auth token', async () => {
      const res = await request(app).get('/api/favorites');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should add a hostel to user favorites', async () => {
      const res = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({ hostelId: sampleHostelId });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('added to favorites');
    });

    it('should list all favorite hostels for the authenticated user', async () => {
      const res = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some(f => f.hostel && f.hostel.id === sampleHostelId)).toBe(true);
    });

    it('should remove a hostel from favorites', async () => {
      const res = await request(app)
        .delete(`/api/favorites/${sampleHostelId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('removed from favorites');
    });
  });

  describe('Hostel Reviews API', () => {
    it('should list reviews for a hostel publicly without auth', async () => {
      const res = await request(app).get(`/api/hostels/${sampleHostelId}/reviews`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should add a review with valid rating and text', async () => {
      const res = await request(app)
        .post(`/api/hostels/${sampleHostelId}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          rating: 5,
          review_text: 'Excellent cleanliness and very responsive warden!'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('rating', 5);
    });

    it('should reject a review with invalid rating outside 1-5', async () => {
      const res = await request(app)
        .post(`/api/hostels/${sampleHostelId}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          rating: 7,
          review_text: 'Rating is out of bounds'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('errors');
    });

    it('should reject a review with too short text', async () => {
      const res = await request(app)
        .post(`/api/hostels/${sampleHostelId}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          rating: 4,
          review_text: 'Hi'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toHaveProperty('review_text');
    });
  });
});
