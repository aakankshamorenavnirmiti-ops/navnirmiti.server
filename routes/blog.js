const express = require('express');
const router  = express.Router();
const {
  getBlogPosts,
  getBlogPostsByCategory,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/multer');

// Public routes
router.get('/',                    getBlogPosts);
router.get('/category/:category',  getBlogPostsByCategory);
router.get('/:id',                 getBlogPost);

// Admin-only routes — require auth + image upload support
router.post('/',    protect, authorize('admin'), upload.single('image'), createBlogPost);
router.put('/:id',  protect, authorize('admin'), upload.single('image'), updateBlogPost);
router.delete('/:id', protect, authorize('admin'), deleteBlogPost);

module.exports = router;
