const request = require('supertest');
const app = require('../src/app');

describe('Expenses API Tests', () => {
  let token = '';
  let createdExpenseId = '';

  beforeAll(async () => {
    // Log in demo user to get JWT token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@demo.com',
        password: 'password123'
      });
    token = res.body.data.token;
  });

  it('should reject expenses request without token', async () => {
    const res = await request(app).get('/api/expenses');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should list user expenses with valid token', async () => {
    const res = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should create a new expense with valid inputs', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: 'Food',
        amount: 350.00,
        description: 'Dinner with college friends',
        expense_date: '2026-09-29',
        payment_method: 'UPI',
        is_recurring: false,
        notes: 'Restaurant bill split'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.amount).toBe(350);
    createdExpenseId = res.body.data.id;
  });

  it('should reject expense creation with invalid category or negative amount', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: 'InvalidCategory',
        amount: -100,
        description: 'Test'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('errors');
  });

  it('should get analytics dashboard metrics and smart insights', async () => {
    const res = await request(app)
      .get('/api/expenses/analytics?timeRange=30d')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('kpis');
    expect(res.body.data.kpis).toHaveProperty('totalMonthlyExpense');
    expect(res.body.data).toHaveProperty('budget');
    expect(res.body.data).toHaveProperty('insights');
    expect(Array.isArray(res.body.data.insights)).toBe(true);
    expect(res.body.data).toHaveProperty('categoryBreakdown');
  });

  it('should update an existing expense', async () => {
    const res = await request(app)
      .put(`/api/expenses/${createdExpenseId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: 'Food',
        amount: 400.00,
        description: 'Updated dinner bill'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(400);
  });

  it('should delete an existing expense', async () => {
    const res = await request(app)
      .delete(`/api/expenses/${createdExpenseId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
