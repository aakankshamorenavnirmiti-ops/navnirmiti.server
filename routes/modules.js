const express = require('express');
const router  = express.Router();
const {
  getModules, getModule, createModule, updateModule, deleteModule,
  startModule, submitQuiz,
  createCertRequest, getMyCertRequests, getAllCertRequests,
  updateCertRequest, uploadCertPdf
} = require('../controllers/modulesController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/multer');

/* ── Static paths MUST come before /:id to avoid conflicts ── */

// Certification requests (static routes first)
router.get('/cert-requests',               protect, authorize('admin'),   getAllCertRequests);
router.get('/cert-requests/mine',          protect, authorize('student'), getMyCertRequests);
router.post('/cert-request',               protect, authorize('student'), createCertRequest);
router.put('/cert-requests/:id',           protect, authorize('admin'),   updateCertRequest);
router.put('/cert-requests/:id/upload-pdf', protect, authorize('admin'),  upload.single('pdf'), uploadCertPdf);

// Module list & create
router.get('/',    protect, getModules);
router.post('/',   protect, authorize('admin'), createModule);

// Module by ID
router.get('/:id',      protect, getModule);
router.put('/:id',      protect, authorize('admin'), updateModule);
router.delete('/:id',   protect, authorize('admin'), deleteModule);

// Student actions on a module
router.put('/:id/start',  protect, authorize('student'), startModule);
router.post('/:id/quiz',  protect, authorize('student'), submitQuiz);

module.exports = router;
