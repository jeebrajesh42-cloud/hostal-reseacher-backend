const hostelService = require('../services/hostelService');
const reviewModel = require('../models/reviewModel');

const hostelController = {
  async getAll(req, res, next) {
    try {
      const hostels = await hostelService.getAllHostels(req.query);
      res.status(200).json({
        success: true,
        count: hostels.length,
        data: hostels
      });
    } catch (err) {
      next(err);
    }
  },

  async search(req, res, next) {
    try {
      const hostels = await hostelService.getAllHostels(req.query);
      res.status(200).json({
        success: true,
        count: hostels.length,
        data: hostels
      });
    } catch (err) {
      next(err);
    }
  },

  async liveSearch(req, res, next) {
    try {
      const result = await hostelService.liveSearchHostels(req.query);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const { userLat, userLng } = req.query;

      const hostel = await hostelService.getHostelById(id, userLat, userLng);
      if (!hostel) {
        return res.status(404).json({
          success: false,
          message: 'Hostel not found.'
        });
      }

      res.status(200).json({
        success: true,
        data: hostel
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const created = await hostelService.createHostel(req.body);
      res.status(201).json({
        success: true,
        message: 'Hostel created successfully.',
        data: created
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await hostelService.updateHostel(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Hostel updated successfully.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await hostelService.deleteHostel(id);
      res.status(200).json({
        success: true,
        message: 'Hostel deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  },

  async getReviews(req, res, next) {
    try {
      const { id } = req.params;
      const reviews = await reviewModel.findByHostelId(id);
      res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews
      });
    } catch (err) {
      next(err);
    }
  },

  async addReview(req, res, next) {
    try {
      const { id } = req.params;
      const { rating, review_text } = req.body;
      const userId = req.user.id;

      const review = await reviewModel.create({
        user_id: userId,
        user_name: req.user.email?.split('@')[0] || 'Resident',
        hostel_id: id,
        rating,
        review_text
      });

      res.status(201).json({
        success: true,
        message: 'Review posted successfully.',
        data: review
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = hostelController;
