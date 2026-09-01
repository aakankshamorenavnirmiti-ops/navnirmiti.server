const express = require('express');
const router  = express.Router();
const {
  getTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} = require('../controllers/testimonialsController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/multer');

// Public — only published testimonials
router.get('/', getTestimonials);

// Admin — all testimonials including drafts
router.get('/all', protect, authorize('admin'), getAllTestimonials);

// Admin CRUD with optional photo upload
router.post('/',    protect, authorize('admin'), upload.single('photo'), createTestimonial);
router.put('/:id',  protect, authorize('admin'), upload.single('photo'), updateTestimonial);
router.delete('/:id', protect, authorize('admin'), deleteTestimonial);

module.exports = router;
