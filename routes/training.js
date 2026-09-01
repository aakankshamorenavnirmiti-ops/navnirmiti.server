const express = require('express');
const router = express.Router();
const {
  updateTrainingProgress,
  getTrainingProgress,
  uploadFile,
  getUploadedFiles,
  getStudents,
  getEmployees
} = require('../controllers/trainingController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/multer');

// Training progress routes
router.route('/progress')
  .get(protect, getTrainingProgress)
  .put(protect, updateTrainingProgress);

// File upload routes
router.route('/upload')
  .post(protect, upload.single('file'), uploadFile);

router.route('/files')
  .get(protect, getUploadedFiles);

// Admin routes
router.route('/students')
  .get(protect, getStudents);

router.route('/employees')
  .get(protect, getEmployees);

module.exports = router;