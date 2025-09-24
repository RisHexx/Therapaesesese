const express = require('express');
const {
  createPost,
  getAllPosts,
  replyToPost,
  flagPost,
  getMyPosts,
  deletePost
} = require('../controllers/postsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected - require authentication
router.use(protect);

// Public routes (for authenticated users)
router.post('/create', createPost);
router.get('/getAll', getAllPosts);
router.post('/reply/:postId', replyToPost);
router.post('/flag/:postId', flagPost);
router.get('/my-posts', getMyPosts);

// Admin or author only routes
router.delete('/:postId', deletePost);

module.exports = router;
