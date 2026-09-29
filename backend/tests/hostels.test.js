const request = require('supertest');
const app = require('../src/app');

describe('Hostels API Tests', () => {
  let sampleHostelId = '';

  it('should list all demo hostels', async () => {
    const res = await request(app).get('/api/hostels');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    sampleHostelId = res.body.data[0].id;
  });

  it('should filter hostels by city Bhopal', async () => {
    const res = await request(app).get('/api/hostels?city=Bhopal');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.every(h => h.city.toLowerCase() === 'bhopal')).toBe(true);
  });

  it('should filter hostels by price range minRent and maxRent', async () => {
    const res = await request(app).get('/api/hostels?minRent=6000&maxRent=8000');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.every(h => h.monthly_rent >= 6000 && h.monthly_rent <= 8000)).toBe(true);
  });

  it('should calculate distance when user coordinates are provided', async () => {
    // Bhopal coordinates near MP Nagar: 23.2300, 77.4300
    const res = await request(app).get('/api/hostels?userLat=23.2300&userLng=77.4300');
    expect(res.statusCode).toBe(200);
    expect(res.body.data[0]).toHaveProperty('distanceKm');
    expect(typeof res.body.data[0].distanceKm).toBe('number');
  });

  it('should get detailed hostel by id with estimated monthly cost breakdown', async () => {
    const res = await request(app).get(`/api/hostels/${sampleHostelId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', sampleHostelId);
    expect(res.body.data).toHaveProperty('estimated_monthly_living_cost');
    expect(res.body.data.estimated_monthly_living_cost).toHaveProperty('total');
  });

  it('should return 404 for non-existent hostel id', async () => {
    const res = await request(app).get('/api/hostels/non-existent-id-999');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
