const express = require('express');
const router = express.Router();
const hostelController = require('../controllers/hostelController');
const { authenticate, optionalAuth, requireAdmin } = require('../middleware/authMiddleware');
const { validateReview } = require('../middleware/validationMiddleware');

// Public / optionally authenticated
router.get('/', optionalAuth, hostelController.getAll);
router.get('/search', optionalAuth, hostelController.search);
router.get('/live-search', optionalAuth, hostelController.liveSearch);
router.get('/:id', optionalAuth, hostelController.getById);

// Reviews
router.get('/:id/reviews', hostelController.getReviews);
router.post('/:id/reviews', authenticate, validateReview, hostelController.addReview);

// Admin-only management endpoints
router.post('/', authenticate, requireAdmin, hostelController.create);
router.put('/:id', authenticate, requireAdmin, hostelController.update);
router.delete('/:id', authenticate, requireAdmin, hostelController.delete);

module.exports = router;
