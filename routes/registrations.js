const express = require('express');
const router = express.Router();
const {
  createRegistration,
  getRegistrations,
  updateRegistrationStatus,
  deleteRegistration
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

// Public — anyone can submit a registration
router.post('/', createRegistration);

// Admin only — read, update status, delete
router.get('/',           protect, authorize('admin'), getRegistrations);
router.put('/:id/status', protect, authorize('admin'), updateRegistrationStatus);
router.delete('/:id',     protect, authorize('admin'), deleteRegistration);

module.exports = router;
