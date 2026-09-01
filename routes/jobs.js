const express = require('express');
const router  = express.Router();
const {
  getJobs, createJob, updateJob, deleteJob
} = require('../controllers/jobsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/',     getJobs);                                   // public
router.post('/',    protect, authorize('admin'), createJob);
router.put('/:id',  protect, authorize('admin'), updateJob);
router.delete('/:id', protect, authorize('admin'), deleteJob);

module.exports = router;
