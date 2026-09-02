/**
 * multer.js — Cloudinary-backed upload middleware.
 * Routes that require('../middleware/multer') get the mixed uploader
 * (handles both images and PDFs via Cloudinary).
 */
const { uploadMixed } = require('../utils/cloudinary');
module.exports = uploadMixed;
