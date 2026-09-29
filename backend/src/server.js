const app = require('./app');
const env = require('./config/env');

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Hostel Research & Expense Tracker API Server Started `);
  console.log(` Mode: ${env.NODE_ENV}`);
  console.log(` URL:  http://localhost:${PORT}`);
  console.log(` Docs: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Process terminated.');
  });
});

process.on('unhandledRejection', (err) => {
  console.error('[Server] Unhandled Promise Rejection:', err);
});
