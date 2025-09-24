const User = require('../models/User');

// @desc    Get user dashboard data
// @route   GET /api/dashboard/user
// @access  Private (User role)
const getUserDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        message: `Welcome to your dashboard, ${user.name}!`,
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          joinedDate: user.createdAt
        },
        stats: {
          totalSessions: 0, // Placeholder for future implementation
          upcomingAppointments: 0,
          completedSessions: 0
        }
      }
    });
  } catch (error) {
    console.error('User dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get therapist dashboard data
// @route   GET /api/dashboard/therapist
// @access  Private (Therapist role)
const getTherapistDashboard = async (req, res) => {
  try {
    const therapist = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        message: `Welcome to your therapist dashboard, Dr. ${therapist.name}!`,
        therapist: {
          name: therapist.name,
          email: therapist.email,
          role: therapist.role,
          specialization: therapist.specialization,
          licenseNumber: therapist.licenseNumber,
          experience: therapist.experience,
          joinedDate: therapist.createdAt
        },
        stats: {
          totalPatients: 0, // Placeholder for future implementation
          todayAppointments: 0,
          monthlyRevenue: 0,
          averageRating: 0
        }
      }
    });
  } catch (error) {
    console.error('Therapist dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get admin dashboard data
// @route   GET /api/dashboard/admin
// @access  Private (Admin role)
const getAdminDashboard = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    
    // Get user statistics
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalTherapists = await User.countDocuments({ role: 'therapist' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');
    
    res.status(200).json({
      success: true,
      data: {
        message: `Welcome to the admin dashboard, ${admin.name}!`,
        admin: {
          name: admin.name,
          email: admin.email,
          role: admin.role,
          joinedDate: admin.createdAt
        },
        stats: {
          totalUsers,
          totalTherapists,
          totalAdmins,
          totalRegistrations: totalUsers + totalTherapists + totalAdmins
        },
        recentUsers
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getUserDashboard,
  getTherapistDashboard,
  getAdminDashboard
};
