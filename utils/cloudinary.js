/**
 * Cloudinary configuration and multer storage helper.
 * All uploaded files (PDFs, images) are stored on Cloudinary
 * instead of the local filesystem, which is ephemeral on Render.
 */
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ── Image storage ── */
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder:          'navnirmiti/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    resource_type:   'image',
    public_id:       `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    transformation:  [{ quality: 'auto', fetch_format: 'auto' }],
  }),
});

/* ── PDF / document storage ── */
const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder:        'navnirmiti/documents',
    resource_type: 'raw',
    public_id:     `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    format:        'pdf',
  }),
});

/* ── Mixed storage: routes that accept both images and PDFs ── */
const mixedStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === 'application/pdf';
    return {
      folder:        isPdf ? 'navnirmiti/documents' : 'navnirmiti/images',
      resource_type: isPdf ? 'raw' : 'image',
      public_id:     `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      ...(isPdf
        ? { format: 'pdf' }
        : { transformation: [{ quality: 'auto', fetch_format: 'auto' }] }),
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'), false);
};

const limits = { fileSize: 20 * 1024 * 1024 };

const uploadImage = multer({ storage: imageStorage, fileFilter, limits });
const uploadPdf   = multer({ storage: pdfStorage,   fileFilter, limits });
const uploadMixed = multer({ storage: mixedStorage,  fileFilter, limits });

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

module.exports = { cloudinary, uploadImage, uploadPdf, uploadMixed, deleteFromCloudinary };
