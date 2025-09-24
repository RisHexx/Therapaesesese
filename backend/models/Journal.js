const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
    default: function() {
      return `Journal Entry - ${new Date(this.date).toLocaleDateString()}`;
    }
  },
  content: {
    type: String,
    required: [true, 'Journal content is required'],
    trim: true,
    maxlength: [5000, 'Journal content cannot be more than 5000 characters']
  },
  mood: {
    type: String,
    enum: ['very-bad', 'bad', 'neutral', 'good', 'very-good'],
    default: 'neutral'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPrivate: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for efficient querying by user and date
journalSchema.index({ userId: 1, date: -1 });
journalSchema.index({ userId: 1, createdAt: -1 });

// Ensure one journal entry per user per day (optional constraint)
journalSchema.index({ userId: 1, date: 1 }, { 
  unique: false // Allow multiple entries per day
});

// Instance method to check if user owns this journal
journalSchema.methods.isOwnedBy = function(userId) {
  return this.userId.toString() === userId.toString();
};

// Static method to get user's journals with pagination
journalSchema.statics.getUserJournals = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ userId })
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name');
};

// Static method to get journal stats for user
journalSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        moodDistribution: {
          $push: '$mood'
        },
        firstEntry: { $min: '$date' },
        lastEntry: { $max: '$date' }
      }
    },
    {
      $project: {
        _id: 0,
        totalEntries: 1,
        firstEntry: 1,
        lastEntry: 1,
        moodCounts: {
          $reduce: {
            input: '$moodDistribution',
            initialValue: {
              'very-bad': 0,
              'bad': 0,
              'neutral': 0,
              'good': 0,
              'very-good': 0
            },
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $switch: {
                    branches: [
                      { case: { $eq: ['$$this', 'very-bad'] }, then: { 'very-bad': { $add: ['$$value.very-bad', 1] } } },
                      { case: { $eq: ['$$this', 'bad'] }, then: { 'bad': { $add: ['$$value.bad', 1] } } },
                      { case: { $eq: ['$$this', 'neutral'] }, then: { 'neutral': { $add: ['$$value.neutral', 1] } } },
                      { case: { $eq: ['$$this', 'good'] }, then: { 'good': { $add: ['$$value.good', 1] } } },
                      { case: { $eq: ['$$this', 'very-good'] }, then: { 'very-good': { $add: ['$$value.very-good', 1] } } }
                    ],
                    default: {}
                  }
                }
              ]
            }
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalEntries: 0,
    moodCounts: {
      'very-bad': 0,
      'bad': 0,
      'neutral': 0,
      'good': 0,
      'very-good': 0
    },
    firstEntry: null,
    lastEntry: null
  };
};

// Transform function to ensure privacy
journalSchema.methods.toJSON = function() {
  const journalObject = this.toObject();
  
  // Always ensure privacy - journals are private by default
  if (journalObject.isPrivate !== false) {
    journalObject.isPrivate = true;
  }
  
  return journalObject;
};

module.exports = mongoose.model('Journal', journalSchema);
