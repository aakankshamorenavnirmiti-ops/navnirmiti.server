const express = require('express');
const router = express.Router();
const { 
  createContact, 
  getContacts, 
  getContact, 
  deleteContact 
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

// POST a new contact form submission (public)
router.post('/', createContact);

// GET all contact form submissions (admin only)
router.get('/', protect, authorize('admin'), getContacts);

// GET a single contact form submission by ID (admin only)
router.get('/:id', protect, authorize('admin'), getContact);

// DELETE a contact form submission (admin only)
router.delete('/:id', protect, authorize('admin'), deleteContact);

module.exports = router;