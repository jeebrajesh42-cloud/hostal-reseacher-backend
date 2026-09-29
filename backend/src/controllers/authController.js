const authService = require('../services/authService');

const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password, preferred_city, monthly_budget } = req.body;
      const result = await authService.register({
        name,
        email,
        password,
        preferred_city,
        monthly_budget
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
