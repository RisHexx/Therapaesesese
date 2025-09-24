const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/error');
const runIndexFixes = require('./utils/indexes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Fix any legacy or stray indexes (non-blocking)
runIndexFixes().catch((e) => {
  console.warn('Index fix routine failed (non-fatal):', e?.message || e);
});

const app = express();

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Route files
const auth = require('./routes/auth');
const dashboard = require('./routes/dashboard');
const posts = require('./routes/posts');
const journals = require('./routes/journals');
const therapists = require('./routes/therapists');
const admin = require('./routes/admin');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/dashboard', dashboard);
app.use('/api/posts', posts);
app.use('/api/journals', journals);
app.use('/api/therapists', therapists);
app.use('/api/admin', admin);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Therapease API is running',
    timestamp: new Date().toISOString()
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});
