const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB, isDbConnected } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const seedAdmin = require('./utils/seedAdmin');

dotenv.config();
const app = express();

// Ensure DB connects before starting the server
const startServer = async () => {
  const dbOk = await connectDB();

  if (!dbOk) {
    console.error('MongoDB not connected. Server will not start.');
    process.exit(1);
  }

  // Middleware
  app.use(cors());

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    req.on('aborted', () => {
      console.warn(`REQUEST ABORTED ${req.method} ${req.originalUrl}`);
    });
    next();
  });

  app.use(express.json());
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', dbConnected: isDbConnected() });
  });

  // Prevent auth requests if DB is not connected
  app.use('/api/auth', (req, res, next) => {
    if (!isDbConnected()) {
      return res
        .status(503)
        .json({ message: 'Server temporarily unavailable. Please try again.' });
    }
    return next();
  });

  // Routes
  app.use('/api/auth', authRoutes);

  // Error Handling Middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong on the server!' });
  });

  app.get('/', (req, res) => {
    res.send('DiaCare API is running...');
  });

  const PORT = process.env.PORT || 5000;

  // Listen on all interfaces so physical devices can reach the server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    seedAdmin()
      .then((result) => {
        if (result.created) {
          console.log('Admin account created: admin123@gmail.com');
        }
      })
      .catch((error) => {
        console.error('Failed to seed admin account:', error.message);
      });
  });
};

startServer();
// Export app for testing if needed
module.exports = app;