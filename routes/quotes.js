const express = require('express');
const router = express.Router();
const { 
  createQuote, 
  getQuotes, 
  getQuote, 
  deleteQuote 
} = require('../controllers/quotesController');
const { protect, authorize } = require('../middleware/auth');

// POST a new quote request (public)
router.post('/', createQuote);

// GET all quote requests (admin only)
router.get('/', protect, authorize('admin'), getQuotes);

// GET a single quote request by ID (admin only)
router.get('/:id', protect, authorize('admin'), getQuote);

// DELETE a quote request (admin only)
router.delete('/:id', protect, authorize('admin'), deleteQuote);

module.exports = router;