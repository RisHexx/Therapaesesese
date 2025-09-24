const Therapist = require('../models/Therapist');
const User = require('../models/User');

// @desc    Get all verified therapists
// @route   GET /api/therapists/
// @access  Private
const getVerifiedTherapists = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const specialization = req.query.specialization;
    const showAll = req.query.showAll === 'true'; // Debug parameter

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters'
      });
    }

    const filters = {};
    if (specialization) filters.specialization = specialization;

    let therapists;
    let query;

    if (showAll) {
      // For debugging - show all therapists regardless of verification status
      query = { isActive: true };
      if (specialization) query.specialization = { $in: [specialization] };
      
      therapists = await Therapist.find(query)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    } else {
      // Normal flow - only verified therapists
      therapists = await Therapist.getVerifiedTherapists(filters, page, limit);
      query = { verified: true, isActive: true };
      if (specialization) query.specialization = { $in: [specialization] };
    }
    
    const totalTherapists = await Therapist.countDocuments(query);
    const totalPages = Math.ceil(totalTherapists / limit);

    // Convert to public JSON (hide sensitive info)
    const publicTherapists = therapists.map(therapist => therapist.toPublicJSON());

    res.status(200).json({
      success: true,
      data: {
        therapists: publicTherapists,
        pagination: {
          currentPage: page,
          totalPages,
          totalTherapists,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get therapists error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching therapists'
    });
  }
};

// @desc    Get therapist details by ID
// @route   GET /api/therapists/:id
// @access  Private
const getTherapistById = async (req, res) => {
  try {
    const { id } = req.params;

    const therapist = await Therapist.findById(id)
      .populate('userId', 'name email role');

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Therapist not found'
      });
    }

    if (!therapist.verified || !therapist.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Therapist not available'
      });
    }

    res.status(200).json({
      success: true,
      data: therapist.toPublicJSON()
    });
  } catch (error) {
    console.error('Get therapist by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching therapist details'
    });
  }
};

// @desc    Contact a therapist
// @route   POST /api/therapists/contact/:therapistId
// @access  Private
const contactTherapist = async (req, res) => {
  try {
    const { therapistId } = req.params;
    const { message, contactInfo } = req.body;

    // Validate message
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Contact message is required'
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Contact message cannot exceed 1000 characters'
      });
    }

    // Validate contact info
    if (!contactInfo || (!contactInfo.email && !contactInfo.phone)) {
      return res.status(400).json({
        success: false,
        message: 'At least email or phone contact information is required'
      });
    }

    // Find the therapist
    const therapist = await Therapist.findById(therapistId);
    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Therapist not found'
      });
    }

    if (!therapist.verified || !therapist.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This therapist is not available for contact'
      });
    }

    // Check if user is trying to contact themselves (if they are a therapist)
    if (therapist.userId.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot contact yourself'
      });
    }

    // Add contact request
    await therapist.addContactRequest(req.user.id, message.trim(), contactInfo);

    res.status(201).json({
      success: true,
      message: 'Contact request sent successfully. The therapist will respond to you directly.'
    });
  } catch (error) {
    if (error.message === 'You already have a pending contact request with this therapist') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    console.error('Contact therapist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending contact request'
    });
  }
};

// @desc    Apply to become a therapist
// @route   POST /api/therapists/apply
// @access  Private
const applyAsTherapist = async (req, res) => {
  try {
    const {
      specialization,
      licenseNumber,
      experience,
      education,
      certifications,
      contactInfo,
      practiceInfo,
      bio
    } = req.body;

    // Check if user already has a therapist application
    const existingTherapist = await Therapist.findOne({ userId: req.user.id });
    if (existingTherapist) {
      return res.status(400).json({
        success: false,
        message: 'You already have a therapist application. Current status: ' + existingTherapist.verificationStatus
      });
    }

    // Validate required fields
    if (!specialization || !Array.isArray(specialization) || specialization.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one specialization is required'
      });
    }

    if (!licenseNumber || !experience || !contactInfo) {
      return res.status(400).json({
        success: false,
        message: 'License number, experience, and contact information are required'
      });
    }

    if (!contactInfo.email || !contactInfo.phone) {
      return res.status(400).json({
        success: false,
        message: 'Email and phone are required in contact information'
      });
    }

    // Create therapist application
    const therapistData = {
      userId: req.user.id,
      specialization: specialization.map(s => s.trim()),
      licenseNumber: licenseNumber.trim(),
      experience: parseInt(experience),
      contactInfo: {
        email: contactInfo.email.toLowerCase().trim(),
        phone: contactInfo.phone.trim(),
        address: contactInfo.address || {}
      },
      verificationStatus: 'pending',
      verified: false
    };

    // Add optional fields
    if (education) therapistData.education = education;
    if (certifications) therapistData.certifications = certifications;
    if (practiceInfo) therapistData.practiceInfo = practiceInfo;
    if (bio) therapistData.bio = bio.trim();

    const therapist = await Therapist.create(therapistData);
    await therapist.populate('userId', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Therapist application submitted successfully. Please wait for admin verification.',
      data: {
        id: therapist._id,
        verificationStatus: therapist.verificationStatus
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'License number already exists. Please use a unique license number.'
      });
    }
    
    console.error('Apply as therapist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting therapist application'
    });
  }
};

// @desc    Verify therapist (admin only)
// @route   PUT /api/therapists/verify/:therapistId
// @access  Private (Admin only)
const verifyTherapist = async (req, res) => {
  try {
    const { therapistId } = req.params;
    const { approved, rejectionReason } = req.body;

    if (typeof approved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Approval status (approved) must be true or false'
      });
    }

    if (!approved && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting an application'
      });
    }

    const therapist = await Therapist.findById(therapistId)
      .populate('userId', 'name email role');

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Therapist application not found'
      });
    }

    if (therapist.verificationStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Application has already been ${therapist.verificationStatus}`
      });
    }

    // Verify the therapist
    await therapist.verify(req.user.id, approved, rejectionReason);

    res.status(200).json({
      success: true,
      message: `Therapist application ${approved ? 'approved' : 'rejected'} successfully`,
      data: {
        therapistId: therapist._id,
        therapistName: therapist.userId.name,
        verificationStatus: therapist.verificationStatus,
        verified: therapist.verified
      }
    });
  } catch (error) {
    console.error('Verify therapist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying therapist'
    });
  }
};

// @desc    Get pending therapist verifications (admin only)
// @route   GET /api/therapists/pending
// @access  Private (Admin only)
const getPendingVerifications = async (req, res) => {
  try {
    const pendingTherapists = await Therapist.getPendingVerifications();

    res.status(200).json({
      success: true,
      data: pendingTherapists
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending verifications'
    });
  }
};

// @desc    Get therapist's contact requests (therapist only)
// @route   GET /api/therapists/my-requests
// @access  Private (Therapist only)
const getMyContactRequests = async (req, res) => {
  try {
    const therapist = await Therapist.findOne({ userId: req.user.id })
      .populate('contactRequests.userId', 'name email');

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Therapist profile not found'
      });
    }

    if (!therapist.verified) {
      return res.status(403).json({
        success: false,
        message: 'Your therapist profile is not verified yet'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        contactRequests: therapist.contactRequests.sort((a, b) => b.createdAt - a.createdAt)
      }
    });
  } catch (error) {
    console.error('Get contact requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contact requests'
    });
  }
};

// @desc    Get all therapists (debug endpoint)
// @route   GET /api/therapists/debug/all
// @access  Private (Admin only)
const getAllTherapistsDebug = async (req, res) => {
  try {
    const therapists = await Therapist.find({})
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    const therapistInfo = therapists.map(therapist => ({
      id: therapist._id,
      name: therapist.userId?.name,
      email: therapist.userId?.email,
      verified: therapist.verified,
      verificationStatus: therapist.verificationStatus,
      isActive: therapist.isActive,
      specialization: therapist.specialization,
      createdAt: therapist.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        total: therapists.length,
        verified: therapists.filter(t => t.verified).length,
        pending: therapists.filter(t => t.verificationStatus === 'pending').length,
        rejected: therapists.filter(t => t.verificationStatus === 'rejected').length,
        therapists: therapistInfo
      }
    });
  } catch (error) {
    console.error('Get all therapists debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch therapists debug info'
    });
  }
};

// @desc    Create test therapist (debug endpoint)
// @route   POST /api/therapists/debug/create-test
// @access  Private (Admin only)
const createTestTherapist = async (req, res) => {
  try {
    // Create a test user first
    const testUser = new User({
      name: 'Test Therapist',
      email: `test-therapist-${Date.now()}@example.com`,
      password: 'password123',
      role: 'therapist',
      // Required fields for therapist role
      specialization: 'Anxiety',
      licenseNumber: `TEST-${Date.now()}`,
      experience: 5
    });
    await testUser.save();

    // Create therapist profile
    const testTherapist = new Therapist({
      userId: testUser._id,
      specialization: ['Anxiety', 'Depression'],
      licenseNumber: `TEST-${Date.now()}`,
      experience: 5,
      education: {
        degree: 'Master of Psychology',
        institution: 'Test University',
        year: 2018
      },
      contactInfo: {
        email: testUser.email,
        phone: '555-0123',
        address: {
          street: '123 Test St',
          state: 'California',
          zipCode: '90210',
          country: 'USA'
        }
      },
      bio: 'This is a test therapist created for debugging purposes.',
      verified: false,
      verificationStatus: 'pending'
    });

    await testTherapist.save();

    res.status(201).json({
      success: true,
      message: 'Test therapist created successfully',
      data: {
        therapist: testTherapist,
        user: testUser
      }
    });
  } catch (error) {
    console.error('Create test therapist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test therapist'
    });
  }
};

// @desc    Create simple test therapist (alternative method)
// @route   POST /api/therapists/debug/create-simple
// @access  Private (Admin only)
const createSimpleTestTherapist = async (req, res) => {
  try {
    // Create therapist directly without complex user creation
    const testTherapist = new Therapist({
      userId: null, // We'll create a minimal reference
      specialization: ['Anxiety', 'Depression'],
      licenseNumber: `SIMPLE-TEST-${Date.now()}`,
      experience: 3,
      education: {
        degree: 'Psychology Degree',
        institution: 'Test University',
        year: 2020
      },
      contactInfo: {
        email: `simple-test-${Date.now()}@example.com`,
        phone: '555-TEST',
        address: {
          street: 'Test Street',
          state: 'Test State',
          zipCode: '12345',
          country: 'USA'
        }
      },
      bio: 'Simple test therapist for verification testing.',
      verified: false,
      verificationStatus: 'pending',
      isActive: true
    });

    await testTherapist.save();

    res.status(201).json({
      success: true,
      message: 'Simple test therapist created successfully',
      data: {
        therapist: testTherapist
      }
    });
  } catch (error) {
    console.error('Create simple test therapist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create simple test therapist',
      error: error.message
    });
  }
};

// @desc    Create therapist profiles for existing therapist users
// @route   POST /api/therapists/debug/create-missing-profiles
// @access  Private (Admin only)
const createMissingTherapistProfiles = async (req, res) => {
  try {
    // Find all users with role 'therapist'
    const therapistUsers = await User.find({ role: 'therapist' });
    console.log(`Found ${therapistUsers.length} therapist users`);

    // Find existing therapist profiles
    const existingTherapists = await Therapist.find({}).select('userId');
    const existingUserIds = existingTherapists.map(t => t.userId?.toString()).filter(Boolean);
    
    console.log(`Found ${existingTherapists.length} existing therapist profiles`);

    // Find therapist users without profiles
    const usersWithoutProfiles = therapistUsers.filter(user => 
      !existingUserIds.includes(user._id.toString())
    );

    console.log(`Found ${usersWithoutProfiles.length} therapist users without profiles`);

    const createdProfiles = [];

    // Create therapist profiles for users without them
    for (const user of usersWithoutProfiles) {
      const therapistProfile = new Therapist({
        userId: user._id,
        specialization: user.specialization ? [user.specialization] : ['General Therapy'],
        licenseNumber: user.licenseNumber || `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        experience: user.experience || 1,
        education: {
          degree: 'Psychology Degree',
          institution: 'University',
          year: 2020
        },
        contactInfo: {
          email: user.email,
          phone: user.phone || '555-0000',
          address: {
            street: 'Not specified',
            state: 'Not specified',
            zipCode: '00000',
            country: 'India'
          }
        },
        bio: `Professional therapist specializing in ${user.specialization || 'general therapy'}.`,
        verified: false,
        verificationStatus: 'pending',
        isActive: true
      });

      await therapistProfile.save();
      createdProfiles.push({
        userName: user.name,
        userEmail: user.email,
        therapistId: therapistProfile._id
      });
    }

    res.status(200).json({
      success: true,
      message: `Created ${createdProfiles.length} missing therapist profiles`,
      data: {
        totalTherapistUsers: therapistUsers.length,
        existingProfiles: existingTherapists.length,
        createdProfiles: createdProfiles.length,
        createdDetails: createdProfiles
      }
    });
  } catch (error) {
    console.error('Create missing therapist profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create missing therapist profiles',
      error: error.message
    });
  }
};

module.exports = {
  getVerifiedTherapists,
  getTherapistById,
  contactTherapist,
  applyAsTherapist,
  verifyTherapist,
  getPendingVerifications,
  getMyContactRequests,
  getAllTherapistsDebug,
  createTestTherapist,
  createSimpleTestTherapist,
  createMissingTherapistProfiles
};
