const { validationResult } = require('express-validator');
const User = require('../models/User');
const Therapist = require('../models/Therapist');
const { sendTokenResponse } = require('../utils/jwt');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, role, specialization, licenseNumber, experience, phone, dateOfBirth } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user object
    const userData = {
      name,
      email,
      password,
      role: role || 'user'
    };

    // Add therapist-specific fields if role is therapist
    if (role === 'therapist') {
      if (!specialization || !licenseNumber || !experience) {
        return res.status(400).json({
          success: false,
          message: 'Specialization, license number, and experience are required for therapists'
        });
      }
      userData.specialization = specialization;
      userData.licenseNumber = licenseNumber;
      userData.experience = experience;
      // Set therapists as unverified by default
      userData.isVerified = false;
    }

    // Add optional fields
    if (phone) userData.phone = phone;
    if (dateOfBirth) userData.dateOfBirth = dateOfBirth;

    // Create user
    const user = await User.create(userData);

    // Create therapist profile if user is a therapist
    if (role === 'therapist') {
      try {
        const therapistProfile = await Therapist.create({
          userId: user._id,
          specialization: [specialization],
          licenseNumber: licenseNumber,
          experience: experience,
          contactInfo: {
            email: user.email,
            phone: phone || '000-000-0000'
          },
          verified: false,
          verificationStatus: 'pending',
          isActive: true
        });
        console.log('Therapist profile created:', therapistProfile._id);
      } catch (therapistError) {
        console.error('Error creating therapist profile:', therapistError);
        // Don't fail the registration if therapist profile creation fails
        // The admin can create it manually later
      }
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    let isMatch;
    try {
      isMatch = await user.matchPassword(password);
    } catch (error) {
      console.error('Password comparison error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout
};
