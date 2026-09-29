const authService = require('../services/authService');

const userController = {
  async getProfile(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const { name, preferred_city, monthly_budget, profile_image } = req.body;
      const updated = await authService.updateProfile(req.user.id, {
        ...(name && { name: name.trim() }),
        ...(preferred_city && { preferred_city: preferred_city.trim() }),
        ...(monthly_budget && { monthly_budget: parseFloat(monthly_budget) }),
        ...(profile_image && { profile_image })
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = userController;
