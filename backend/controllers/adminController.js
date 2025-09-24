const User = require('../models/User');
const Post = require('../models/Post');
const Journal = require('../models/Journal');
const Therapist = require('../models/Therapist');

// Get all users with pagination and filtering
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { role, status, search } = req.query;
    
    // Build filter
    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (status === 'banned') filter.isBanned = true;
    if (status === 'active') filter.isBanned = false;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('bannedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Ban/Kick a user
const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Validate reason
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ban reason is required'
      });
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent banning other admins
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot ban admin users'
      });
    }

    // Prevent self-banning
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot ban yourself'
      });
    }

    // Check if already banned
    if (user.isBanned) {
      return res.status(400).json({
        success: false,
        message: 'User is already banned'
      });
    }

    // Ban the user
    user.isBanned = true;
    user.bannedAt = new Date();
    user.bannedBy = req.user._id;
    user.banReason = reason.trim();
    user.isActive = false;

    await user.save();

    res.json({
      success: true,
      message: 'User banned successfully',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        bannedAt: user.bannedAt,
        banReason: user.banReason
      }
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to ban user'
    });
  }
};

// Unban a user
const unbanUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is banned
    if (!user.isBanned) {
      return res.status(400).json({
        success: false,
        message: 'User is not banned'
      });
    }

    // Unban the user
    user.isBanned = false;
    user.bannedAt = undefined;
    user.bannedBy = undefined;
    user.banReason = undefined;
    user.isActive = true;

    await user.save();

    res.json({
      success: true,
      message: 'User unbanned successfully',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unban user'
    });
  }
};

// Get all flagged posts
const getFlaggedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { minFlags } = req.query;
    
    // Build filter for flagged posts
    const filter = { 
      flagCount: { $gt: parseInt(minFlags) || 0 },
      isActive: true // Only show active posts
    };

    const posts = await Post.find(filter)
      .populate('authorId', 'name email role')
      .populate('flags.userId', 'name email')
      .sort({ flagCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get flagged posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flagged posts'
    });
  }
};

// Remove a post
const removePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Validate reason
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Removal reason is required'
      });
    }

    // Find post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if already removed
    if (!post.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Post is already removed'
      });
    }

    // Remove the post (soft delete)
    post.isActive = false;
    post.removedBy = req.user._id;
    post.removedAt = new Date();
    post.removalReason = reason.trim();

    await post.save();

    res.json({
      success: true,
      message: 'Post removed successfully',
      data: {
        postId: post._id,
        removedAt: post.removedAt,
        removalReason: post.removalReason
      }
    });
  } catch (error) {
    console.error('Remove post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove post'
    });
  }
};

// Restore a removed post
const restorePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Find post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if post is removed
    if (post.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Post is not removed'
      });
    }

    // Restore the post
    post.isActive = true;
    post.removedBy = undefined;
    post.removedAt = undefined;
    post.removalReason = undefined;

    await post.save();

    res.json({
      success: true,
      message: 'Post restored successfully',
      data: {
        postId: post._id
      }
    });
  } catch (error) {
    console.error('Restore post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore post'
    });
  }
};

// Get platform analytics/statistics
const getAnalytics = async (req, res) => {
  try {
    // Get counts for different entities
    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      adminUsers,
      therapistUsers,
      totalPosts,
      activePosts,
      flaggedPosts,
      totalJournals,
      totalTherapists,
      verifiedTherapists,
      pendingTherapists
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true, isBanned: false }),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'therapist' }),
      Post.countDocuments(),
      Post.countDocuments({ isActive: true }),
      Post.countDocuments({ flagCount: { $gt: 0 }, isActive: true }),
      Journal.countDocuments(),
      Therapist.countDocuments(),
      Therapist.countDocuments({ verified: true }),
      Therapist.countDocuments({ verificationStatus: 'pending' })
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      newUsersLast30Days,
      newPostsLast30Days,
      newJournalsLast30Days,
      newTherapistsLast30Days
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Post.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Journal.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Therapist.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    // Get top flagged posts (for quick admin action)
    const topFlaggedPosts = await Post.find({ 
      flagCount: { $gt: 0 }, 
      isActive: true 
    })
      .populate('authorId', 'name email')
      .sort({ flagCount: -1 })
      .limit(5)
      .select('content flagCount createdAt authorId');

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          bannedUsers,
          adminUsers,
          therapistUsers,
          totalPosts,
          activePosts,
          flaggedPosts,
          totalJournals,
          totalTherapists,
          verifiedTherapists,
          pendingTherapists
        },
        recentActivity: {
          newUsersLast30Days,
          newPostsLast30Days,
          newJournalsLast30Days,
          newTherapistsLast30Days
        },
        alerts: {
          topFlaggedPosts,
          pendingVerifications: pendingTherapists,
          bannedUsers
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};

module.exports = {
  getAllUsers,
  banUser,
  unbanUser,
  getFlaggedPosts,
  removePost,
  restorePost,
  getAnalytics
};
