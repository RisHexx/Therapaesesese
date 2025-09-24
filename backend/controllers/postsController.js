const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Create a new post
// @route   POST /api/posts/create
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content, anonymous = false } = req.body;

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Post content cannot exceed 2000 characters'
      });
    }

    // Create post
    const post = await Post.create({
      content: content.trim(),
      authorId: req.user.id,
      anonymous: Boolean(anonymous)
    });

    // Populate author info for response
    await post.populate('authorId', 'name role');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating post'
    });
  }
};

// @desc    Get all posts with pagination
// @route   GET /api/posts/getAll
// @access  Private
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const includeInactive = req.user.role === 'admin' && req.query.includeInactive === 'true';

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters'
      });
    }

    const posts = await Post.getPaginatedPosts(page, limit, includeInactive);
    
    // Get total count for pagination info
    const totalPosts = await Post.countDocuments(includeInactive ? {} : { isActive: true });
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts'
    });
  }
};

// @desc    Reply to a post
// @route   POST /api/posts/reply/:postId
// @access  Private
const replyToPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, anonymous = false } = req.body;

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Reply content cannot exceed 1000 characters'
      });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (!post.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reply to inactive post'
      });
    }

    // Add reply
    const replyData = {
      content: content.trim(),
      authorId: req.user.id,
      anonymous: Boolean(anonymous)
    };

    await post.addReply(replyData);
    
    // Populate the updated post with author info
    await post.populate('authorId', 'name role');
    await post.populate('replies.authorId', 'name role');

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: post
    });
  } catch (error) {
    console.error('Reply to post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding reply'
    });
  }
};

// @desc    Flag a post
// @route   POST /api/posts/flag/:postId
// @access  Private
const flagPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason = 'other' } = req.body;

    // Validate reason
    const validReasons = ['spam', 'abuse', 'inappropriate', 'other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid flag reason'
      });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already flagged this post
    if (post.hasUserFlagged(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already flagged this post'
      });
    }

    // Add flag
    await post.addFlag(req.user.id, reason);

    res.status(200).json({
      success: true,
      message: 'Post flagged successfully',
      data: {
        flagCount: post.flagCount
      }
    });
  } catch (error) {
    if (error.message === 'You have already flagged this post') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    console.error('Flag post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while flagging post'
    });
  }
};

// @desc    Get user's own posts
// @route   GET /api/posts/my-posts
// @access  Private
const getMyPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;
    
    const posts = await Post.find({ authorId: req.user.id })
      .populate('authorId', 'name role')
      .populate('replies.authorId', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ authorId: req.user.id });
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your posts'
    });
  }
};

// @desc    Delete a post (admin only or post author)
// @route   DELETE /api/posts/:postId
// @access  Private
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is admin or post author
    if (req.user.role !== 'admin' && post.authorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Soft delete by setting isActive to false
    post.isActive = false;
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting post'
    });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  replyToPost,
  flagPost,
  getMyPosts,
  deletePost
};
