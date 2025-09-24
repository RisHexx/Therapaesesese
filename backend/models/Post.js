const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Reply content is required'],
    trim: true,
    maxlength: [1000, 'Reply cannot be more than 1000 characters']
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: [2000, 'Post cannot be more than 2000 characters']
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  replies: [replySchema],
  flags: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      enum: ['spam', 'abuse', 'inappropriate', 'other'],
      default: 'other'
    },
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  // Metadata for moderation
  flagCount: {
    type: Number,
    default: 0
  },
  replyCount: {
    type: Number,
    default: 0
  },
  removedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  removedAt: {
    type: Date
  },
  removalReason: {
    type: String,
    maxlength: [500, 'Removal reason cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Index for efficient querying
postSchema.index({ createdAt: -1 });
postSchema.index({ authorId: 1 });
postSchema.index({ isActive: 1 });

// Update flag count when flags are modified
postSchema.pre('save', function(next) {
  if (this.isModified('flags')) {
    this.flagCount = this.flags.length;
  }
  if (this.isModified('replies')) {
    this.replyCount = this.replies.length;
  }
  next();
});

// Instance method to add a reply
postSchema.methods.addReply = function(replyData) {
  this.replies.push(replyData);
  this.replyCount = this.replies.length;
  return this.save();
};

// Instance method to add a flag
postSchema.methods.addFlag = function(userId, reason = 'other') {
  // Check if user already flagged this post
  const existingFlag = this.flags.find(flag => flag.userId.toString() === userId.toString());
  if (existingFlag) {
    throw new Error('You have already flagged this post');
  }
  
  this.flags.push({ userId, reason });
  this.flagCount = this.flags.length;
  return this.save();
};

// Instance method to check if user has flagged
postSchema.methods.hasUserFlagged = function(userId) {
  return this.flags.some(flag => flag.userId.toString() === userId.toString());
};

// Static method to get posts with pagination
postSchema.statics.getPaginatedPosts = function(page = 1, limit = 10, includeInactive = false) {
  const skip = (page - 1) * limit;
  const filter = includeInactive ? {} : { isActive: true };
  
  return this.find(filter)
    .populate('authorId', 'name role')
    .populate('replies.authorId', 'name role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Transform function to hide author info for anonymous posts
postSchema.methods.toJSON = function() {
  const postObject = this.toObject();
  
  // Hide author info if anonymous
  if (postObject.anonymous && postObject.authorId) {
    postObject.authorId = {
      _id: postObject.authorId._id,
      name: 'Anonymous',
      role: 'user'
    };
  }
  
  // Hide author info for anonymous replies
  if (postObject.replies) {
    postObject.replies = postObject.replies.map(reply => {
      if (reply.anonymous && reply.authorId) {
        return {
          ...reply,
          authorId: {
            _id: reply.authorId._id,
            name: 'Anonymous',
            role: 'user'
          }
        };
      }
      return reply;
    });
  }
  
  return postObject;
};

module.exports = mongoose.model('Post', postSchema);
