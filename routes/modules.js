const express = require('express');
const router  = express.Router();
const {
  getModules, getModule, createModule, updateModule, deleteModule,
  startModule, submitQuiz,
  createCertRequest, getMyCertRequests, getAllCertRequests,
  updateCertRequest
} = require('../controllers/modulesController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/multer');
const { memoryUpload, uploadPdfToCloudinary } = require('../utils/cloudinary');
const CertificationRequest = require('../models/CertificationRequest');

/* â”€â”€ Static paths MUST come before /:id to avoid conflicts â”€â”€ */

// Certification requests (static routes first)
router.get('/cert-requests',               protect, authorize('admin'),   getAllCertRequests);
router.get('/cert-requests/mine',          protect, authorize('student'), getMyCertRequests);
router.post('/cert-request',               protect, authorize('student'), createCertRequest);
router.put('/cert-requests/:id',           protect, authorize('admin'),   updateCertRequest);
router.put('/cert-requests/:id/upload-pdf', protect, authorize('admin'), memoryUpload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ success: false, error: 'Only PDF files are allowed' });
    }

    // Upload buffer directly to Cloudinary as raw PDF
    const publicId = `pdf-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const result = await uploadPdfToCloudinary(req.file.buffer, publicId);

    // Store the secure_url (full Cloudinary URL)
    const cert = await CertificationRequest.findByIdAndUpdate(
      req.params.id,
      { certificatePdf: result.secure_url, status: 'issued' },
      { new: true }
    );
    if (!cert) return res.status(404).json({ success: false, error: 'Request not found' });
    res.json({ success: true, data: cert });
  } catch (err) {
    console.error('PDF upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'Upload failed' });
  }
});

// Student: get own issued certificate
router.get('/my-certificate', protect, async (req, res) => {
  try {
    const cert = await CertificationRequest.findOne({
      student: req.user.id,
      status: 'issued',
      certificatePdf: { $ne: null }
    }).sort({ updatedAt: -1 });

    if (!cert) {
      return res.json({ success: true, data: null, message: 'No certificate issued yet.' });
    }
    res.json({ success: true, data: cert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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
