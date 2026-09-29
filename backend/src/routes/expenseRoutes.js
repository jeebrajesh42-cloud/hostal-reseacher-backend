const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateExpense } = require('../middleware/validationMiddleware');

// All expense routes require authentication
router.use(authenticate);

// Analytics & Reports
router.get('/analytics', expenseController.getAnalytics);
router.get('/monthly', expenseController.getMonthly);
router.get('/categories', expenseController.getCategories);

// Budget endpoints
router.get('/budget', expenseController.getBudget);
router.post('/budget', expenseController.setBudget);

// Standard CRUD
router.get('/', expenseController.getAll);
router.post('/', validateExpense, expenseController.create);
router.get('/:id', expenseController.getById);
router.put('/:id', validateExpense, expenseController.update);
router.delete('/:id', expenseController.delete);

module.exports = router;
