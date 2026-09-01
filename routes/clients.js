const express = require('express');
const router  = express.Router();
const {
  registerClient, approveClient, deleteClient,
  getMyProject,
  getAllClients, getClientProject,
  uploadPlan, uploadAgreement, uploadProgressImages, deleteProgressImage, uploadCompletion, updateProjectTitle,
  createQuery, getMyQueries, getAllQueries, getClientQueries, updateQuery, deleteQuery
} = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const upload = require('../middleware/multer');

// Multi-field upload for registration (profile photo + payment screenshot)
const regUpload = upload.fields([
  { name: 'profilePhoto',      maxCount: 1 },
  { name: 'paymentScreenshot', maxCount: 1 }
]);

/* ── Public ── */
router.post('/register', regUpload, registerClient);

/* ── Client (own data) ── */
router.get('/project',            protect, authorize('client'), getMyProject);
router.post('/queries',           protect, authorize('client'), upload.single('attachment'), createQuery);
router.get('/queries/mine',       protect, authorize('client'), getMyQueries);

/* ── Admin — client list, approval, queries ── */
router.get('/',                   protect, authorize('admin'), getAllClients);
router.put('/:id/approve',        protect, authorize('admin'), approveClient);
router.delete('/:id',             protect, authorize('admin'), deleteClient);
router.get('/queries',            protect, authorize('admin'), getAllQueries);
router.put('/queries/:id',        protect, authorize('admin'), updateQuery);
router.delete('/queries/:id',     protect, authorize('admin'), deleteQuery);

/* ── Admin — per-client project management ── */
router.get('/:id/project',                                  protect, authorize('admin'), getClientProject);
router.put('/:id/project/title',                            protect, authorize('admin'), updateProjectTitle);
router.put('/:id/project/plan',                             protect, authorize('admin'), upload.single('pdf'), uploadPlan);
router.put('/:id/project/agreement',                        protect, authorize('admin'), upload.single('pdf'), uploadAgreement);
router.post('/:id/project/progress',                        protect, authorize('admin'), upload.array('images', 20), uploadProgressImages);
router.delete('/:clientId/project/progress/:imageId',       protect, authorize('admin'), deleteProgressImage);
router.put('/:id/project/completion',                       protect, authorize('admin'), upload.single('image'), uploadCompletion);
router.get('/:id/queries',                                  protect, authorize('admin'), getClientQueries);

module.exports = router;
