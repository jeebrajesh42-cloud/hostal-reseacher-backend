const favoriteModel = require('../models/favoriteModel');

const favoriteController = {
  async getAll(req, res, next) {
    try {
      const favorites = await favoriteModel.findByUserId(req.user.id);
      res.status(200).json({
        success: true,
        count: favorites.length,
        data: favorites
      });
    } catch (err) {
      next(err);
    }
  },

  async add(req, res, next) {
    try {
      const { hostelId } = req.body;
      if (!hostelId) {
        return res.status(400).json({
          success: false,
          message: 'hostelId is required.'
        });
      }

      const fav = await favoriteModel.add(req.user.id, hostelId);
      res.status(201).json({
        success: true,
        message: 'Hostel added to favorites.',
        data: fav
      });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const { hostelId } = req.params;
      await favoriteModel.remove(req.user.id, hostelId);
      res.status(200).json({
        success: true,
        message: 'Hostel removed from favorites.'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = favoriteController;
