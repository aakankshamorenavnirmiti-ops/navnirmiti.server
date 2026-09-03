const express = require('express');
const router  = express.Router();
const {
  getModules, getModule, createModule, updateModule, deleteModule,
  startModule, submitQuiz,
  createCertRequest, getMyCertRequests, getAllCertRequests,
  updateCertRequest
} = require('../controllers/modulesController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const CertificationRequest = require('../models/CertificationRequest');

// Use memory storage for Base64 PDF storage in MongoDB
const memUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max for DB storage
});

/* ── Static paths MUST come before /:id to avoid conflicts ── */

// Certification requests (static routes first)
router.get('/cert-requests',               protect, authorize('admin'),   getAllCertRequests);
router.get('/cert-requests/mine',          protect, authorize('student'), getMyCertRequests);
router.post('/cert-request',               protect, authorize('student'), createCertRequest);
router.put('/cert-requests/:id',           protect, authorize('admin'),   updateCertRequest);

router.put('/cert-requests/:id/upload-pdf', protect, authorize('admin'), memUpload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    // Convert buffer to Base64
    const base64Data = req.file.buffer.toString('base64');
    const originalName = req.file.originalname || 'certificate.pdf';

    const cert = await CertificationRequest.findByIdAndUpdate(
      req.params.id,
      {
        status:                 'issued',
        certificatePdf:         originalName,       // keep for display name
        certificatePdfData:     base64Data,          // actual PDF data
        certificatePdfMimeType: 'application/pdf',
        certificatePdfName:     originalName,
      },
      { new: true }
    );
    if (!cert) return res.status(404).json({ success: false, error: 'Request not found' });

    // Return cert WITHOUT the Base64 data (too large for general responses)
    const certObj = cert.toObject();
    delete certObj.certificatePdfData;
    res.json({ success: true, data: certObj });
  } catch (err) {
    console.error('PDF upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'Upload failed' });
  }
});

// GET /api/modules/cert-pdf/:id — serve the certificate PDF directly from MongoDB
// No auth required so the browser can load it directly as a download link
router.get('/cert-pdf/:id', async (req, res) => {
  try {
    const cert = await CertificationRequest.findById(req.params.id)
      .select('student certificatePdfData certificatePdfMimeType certificatePdfName studentName');

    if (!cert || !cert.certificatePdfData) {
      return res.status(404).json({ success: false, error: 'Certificate not found' });
    }

    const buffer = Buffer.from(cert.certificatePdfData, 'base64');
    const filename = cert.certificatePdfName || `certificate-${cert.studentName?.replace(/\s+/g, '-') || 'student'}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Student: get own issued certificate
router.get('/my-certificate', protect, async (req, res) => {
  try {
    const cert = await CertificationRequest.findOne({
      student: req.user.id,
      status: 'issued',
      $or: [
        { certificatePdfData: { $ne: null } },
        { certificatePdf: { $ne: null } }
      ]
    })
    .select('-certificatePdfData')
    .sort({ updatedAt: -1 });

    if (!cert) {
      return res.json({ success: true, data: null, message: 'No certificate issued yet.' });
    }
    res.json({ success: true, data: cert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Module list & create
router.get('/', getModules);
router.post('/',   protect, authorize('admin'), createModule);

// Module by ID
router.get('/:id',      protect, getModule);
router.put('/:id',      protect, authorize('admin'), updateModule);
router.delete('/:id',   protect, authorize('admin'), deleteModule);

// Student actions on a module
router.put('/:id/start',  protect, authorize('student'), startModule);
router.post('/:id/quiz',  protect, authorize('student'), submitQuiz);

module.exports = router;
