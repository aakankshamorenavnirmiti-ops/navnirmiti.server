const express = require('express');
const router  = express.Router();
const {
  getJobOpenings, getJobOpening,
  createJobOpening, updateJobOpening, deleteJobOpening
} = require('../controllers/jobOpeningsController');
const { protect, authorize } = require('../middleware/auth');

// Public — only published openings
router.get('/', getJobOpenings);
router.get('/:id', getJobOpening);

// Admin only — full CRUD
router.post('/',     protect, authorize('admin'), createJobOpening);
router.put('/:id',   protect, authorize('admin'), updateJobOpening);
router.delete('/:id',protect, authorize('admin'), deleteJobOpening);

module.exports = router;
