const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, getUsers, uploadProfilePhoto } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/multer');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', logout);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/profile-photo', protect, upload.single('photo'), uploadProfilePhoto);

module.exports = router;