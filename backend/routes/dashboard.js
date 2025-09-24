const express = require('express');
const {
  getUserDashboard,
  getTherapistDashboard,
  getAdminDashboard
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes with role-based access
router.get('/user', protect, authorize('user'), getUserDashboard);
router.get('/therapist', protect, authorize('therapist'), getTherapistDashboard);
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

module.exports = router;
