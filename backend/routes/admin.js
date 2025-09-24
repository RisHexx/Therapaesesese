const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  getAllUsers,
  banUser,
  unbanUser,
  getFlaggedPosts,
  removePost,
  restorePost,
  getAnalytics
} = require('../controllers/adminController');

// Apply admin authentication to all routes
router.use(adminAuth);

// User management routes
router.get('/users', getAllUsers);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/unban', unbanUser);

// Post moderation routes
router.get('/posts/flagged', getFlaggedPosts);
router.put('/posts/:id/remove', removePost);
router.put('/posts/:id/restore', restorePost);

// Analytics route
router.get('/analytics', getAnalytics);

module.exports = router;
