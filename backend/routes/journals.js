const express = require('express');
const {
  createJournal,
  getUserJournals,
  getJournal,
  updateJournal,
  deleteJournal,
  getJournalStats
} = require('../controllers/journalsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected - require authentication
router.use(protect);

// Journal CRUD routes
router.post('/create', createJournal);
router.get('/', getUserJournals);
router.get('/stats', getJournalStats);
router.get('/:id', getJournal);
router.put('/:id', updateJournal);
router.delete('/:id', deleteJournal);

module.exports = router;
