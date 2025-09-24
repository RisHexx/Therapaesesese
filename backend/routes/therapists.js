const express = require('express');
const {
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
} = require('../controllers/therapistsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected - require authentication
router.use(protect);

// Public routes (for authenticated users)
router.get('/', getVerifiedTherapists);
router.get('/pending', authorize('admin'), getPendingVerifications);
router.get('/my-requests', authorize('therapist'), getMyContactRequests);
router.get('/:id', getTherapistById);

// User actions
router.post('/apply', applyAsTherapist);
router.post('/contact/:therapistId', contactTherapist);

// Admin only routes
router.put('/verify/:therapistId', authorize('admin'), verifyTherapist);
router.get('/debug/all', authorize('admin'), getAllTherapistsDebug);
router.post('/debug/create-test', authorize('admin'), createTestTherapist);
router.post('/debug/create-simple', authorize('admin'), createSimpleTestTherapist);
router.post('/debug/create-missing-profiles', authorize('admin'), createMissingTherapistProfiles);

module.exports = router;
