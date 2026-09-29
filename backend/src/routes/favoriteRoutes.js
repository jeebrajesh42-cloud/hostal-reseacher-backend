const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', favoriteController.getAll);
router.post('/', favoriteController.add);
router.delete('/:hostelId', favoriteController.remove);

module.exports = router;
