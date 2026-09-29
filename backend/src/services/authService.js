const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userModel = require('../models/userModel');

const authService = {
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  },

  async register({ name, email, password, role = 'user', preferred_city, monthly_budget }) {
    // 1. Check existing user
    const existing = await userModel.findByEmail(email);
    if (existing) {
      const err = new Error('An account with this email address already exists.');
      err.statusCode = 409;
      throw err;
    }

    // 2. Hash password with bcrypt salt rounds = 12
    const password_hash = await bcrypt.hash(password, 12);

    // 3. Create user record
    const createdUser = await userModel.create({
      name,
      email,
      password_hash,
      role,
      preferred_city,
      monthly_budget: monthly_budget ? parseFloat(monthly_budget) : 15000.00
    });

    // 4. Generate JWT
    const token = this.generateToken(createdUser);

    return {
      user: createdUser,
      token
    };
  },

  async login({ email, password }) {
    // 1. Fetch user by email
    const user = await userModel.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    // 2. Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    // 3. Omit password_hash
    const { password_hash, ...safeUser } = user;

    // 4. Generate token
    const token = this.generateToken(safeUser);

    return {
      user: safeUser,
      token
    };
  },

  async getMe(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }
    return user;
  },

  async updateProfile(userId, updateData) {
    const updated = await userModel.update(userId, updateData);
    if (!updated) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }
    return updated;
  }
};

module.exports = authService;
