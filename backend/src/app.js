const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const hostelRoutes = require('./routes/hostelRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();

// 1. Security Headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. CORS configuration
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Dev-friendly permissive for local dev
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Rate Limiting (100 req per 15 mins for standard APIs, bypass in tests)
if (env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes.'
    }
  });
  app.use('/api', limiter);
}

// 4. Request Logging with Morgan
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 5. Body Parsers with payload size limit
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 6. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hostel Research & Expense Tracker API is running healthy.',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// 7. Mount Core REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/favorites', favoriteRoutes);

// 8. 404 and Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
