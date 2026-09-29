const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters long.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = 'Email address is required.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.',
      errors
    });
  }

  next();
};

const VALID_EXPENSE_CATEGORIES = [
  'Hostel Rent',
  'Security Deposit',
  'Food',
  'Electricity',
  'Water',
  'Internet',
  'Laundry',
  'Transportation',
  'Groceries',
  'Education',
  'Entertainment',
  'Medical',
  'Shopping',
  'Other'
];

const validateExpense = (req, res, next) => {
  const { category, amount, description, expense_date } = req.body;
  const errors = {};

  if (!category || !VALID_EXPENSE_CATEGORIES.includes(category)) {
    errors.category = `Category must be one of: ${VALID_EXPENSE_CATEGORIES.join(', ')}`;
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    errors.amount = 'Amount must be a positive number.';
  }

  if (!description || description.trim().length < 2) {
    errors.description = 'Description is required (minimum 2 characters).';
  }

  if (expense_date && isNaN(Date.parse(expense_date))) {
    errors.expense_date = 'Invalid date format. Use YYYY-MM-DD.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Expense validation failed.',
      errors
    });
  }

  next();
};

const validateReview = (req, res, next) => {
  const { rating, review_text } = req.body;
  const errors = {};

  const numRating = parseInt(rating, 10);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    errors.rating = 'Rating must be an integer between 1 and 5 stars.';
  }

  if (!review_text || review_text.trim().length < 5) {
    errors.review_text = 'Review comments must be at least 5 characters long.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Review validation failed.',
      errors
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateExpense,
  validateReview
};
