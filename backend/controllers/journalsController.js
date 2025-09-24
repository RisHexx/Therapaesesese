const Journal = require('../models/Journal');

// @desc    Create a new journal entry
// @route   POST /api/journals/create
// @access  Private
const createJournal = async (req, res) => {
  try {
    const { title, content, mood, tags, date } = req.body;

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Journal content is required'
      });
    }

    if (content.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Journal content cannot exceed 5000 characters'
      });
    }

    // Validate mood if provided
    const validMoods = ['very-bad', 'bad', 'neutral', 'good', 'very-good'];
    if (mood && !validMoods.includes(mood)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mood value'
      });
    }

    // Create journal entry
    const journalData = {
      userId: req.user.id,
      content: content.trim(),
      mood: mood || 'neutral',
      isPrivate: true // Always private
    };

    // Add optional fields
    if (title) journalData.title = title.trim();
    if (date) journalData.date = new Date(date);
    if (tags && Array.isArray(tags)) {
      journalData.tags = tags.filter(tag => tag && tag.trim()).map(tag => tag.trim().toLowerCase());
    }

    const journal = await Journal.create(journalData);
    await journal.populate('userId', 'name');

    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      data: journal
    });
  } catch (error) {
    console.error('Create journal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating journal entry'
    });
  }
};

// @desc    Get all journal entries for logged-in user
// @route   GET /api/journals/
// @access  Private
const getUserJournals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const mood = req.query.mood;
    const search = req.query.search;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters'
      });
    }

    // Build query
    const query = { userId: req.user.id };
    
    // Add mood filter
    if (mood && ['very-bad', 'bad', 'neutral', 'good', 'very-good'].includes(mood)) {
      query.mood = mood;
    }

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const journals = await Journal.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name');

    // Get total count for pagination
    const totalJournals = await Journal.countDocuments(query);
    const totalPages = Math.ceil(totalJournals / limit);

    res.status(200).json({
      success: true,
      data: {
        journals,
        pagination: {
          currentPage: page,
          totalPages,
          totalJournals,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get journals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching journal entries'
    });
  }
};

// @desc    Get a specific journal entry
// @route   GET /api/journals/:id
// @access  Private
const getJournal = async (req, res) => {
  try {
    const { id } = req.params;

    const journal = await Journal.findById(id).populate('userId', 'name');
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    // Check if user owns this journal
    if (!journal.isOwnedBy(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this journal entry'
      });
    }

    res.status(200).json({
      success: true,
      data: journal
    });
  } catch (error) {
    console.error('Get journal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching journal entry'
    });
  }
};

// @desc    Update a journal entry
// @route   PUT /api/journals/:id
// @access  Private
const updateJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, mood, tags } = req.body;

    const journal = await Journal.findById(id);
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    // Check if user owns this journal
    if (!journal.isOwnedBy(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this journal entry'
      });
    }

    // Validate content if provided
    if (content !== undefined) {
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Journal content cannot be empty'
        });
      }

      if (content.length > 5000) {
        return res.status(400).json({
          success: false,
          message: 'Journal content cannot exceed 5000 characters'
        });
      }
      journal.content = content.trim();
    }

    // Validate mood if provided
    if (mood !== undefined) {
      const validMoods = ['very-bad', 'bad', 'neutral', 'good', 'very-good'];
      if (!validMoods.includes(mood)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mood value'
        });
      }
      journal.mood = mood;
    }

    // Update other fields
    if (title !== undefined) journal.title = title.trim();
    if (tags !== undefined && Array.isArray(tags)) {
      journal.tags = tags.filter(tag => tag && tag.trim()).map(tag => tag.trim().toLowerCase());
    }

    await journal.save();
    await journal.populate('userId', 'name');

    res.status(200).json({
      success: true,
      message: 'Journal entry updated successfully',
      data: journal
    });
  } catch (error) {
    console.error('Update journal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating journal entry'
    });
  }
};

// @desc    Delete a journal entry
// @route   DELETE /api/journals/:id
// @access  Private
const deleteJournal = async (req, res) => {
  try {
    const { id } = req.params;

    const journal = await Journal.findById(id);
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    // Check if user owns this journal
    if (!journal.isOwnedBy(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this journal entry'
      });
    }

    await Journal.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete journal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting journal entry'
    });
  }
};

// @desc    Get journal statistics for user
// @route   GET /api/journals/stats
// @access  Private
const getJournalStats = async (req, res) => {
  try {
    const stats = await Journal.getUserStats(req.user.id);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get journal stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching journal statistics'
    });
  }
};

module.exports = {
  createJournal,
  getUserJournals,
  getJournal,
  updateJournal,
  deleteJournal,
  getJournalStats
};
