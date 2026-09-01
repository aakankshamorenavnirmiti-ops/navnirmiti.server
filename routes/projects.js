const express = require('express');
const router  = express.Router();
const {
  getProjects,
  getProjectsByCategory,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectsController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/multer');

// Public
router.get('/',                   getProjects);
router.get('/category/:category', getProjectsByCategory);
router.get('/:id',                getProject);

// Admin — multi-image upload (up to 10 files per project)
router.post('/',    protect, authorize('admin'), upload.array('images', 10), createProject);
router.put('/:id',  protect, authorize('admin'), upload.array('images', 10), updateProject);
router.delete('/:id', protect, authorize('admin'), deleteProject);

module.exports = router;
