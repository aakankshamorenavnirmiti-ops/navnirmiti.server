const mongoose = require('mongoose');

const certificationRequestSchema = new mongoose.Schema({
  student:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName:  { type: String, required: true },
  studentEmail: { type: String, required: true },
  // Mobile number where admin can contact student about certificate
  certPhone:    { type: String, required: true },
  type: {
    type: String,
    enum: ['theory', 'onsite'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'issued', 'rejected'],
    default: 'pending'
  },
  message:          { type: String, default: '' },
  adminNotes:       { type: String, default: '' },
  modulesCompleted: [{ type: String }],
  // PDF certificate uploaded by admin — filename stored in /uploads/
  certificatePdf:   { type: String, default: null },
  // Base64-encoded PDF stored directly in MongoDB (no filesystem/CDN required)
  certificatePdfData:     { type: String, default: null },  // Base64 string
  certificatePdfMimeType: { type: String, default: 'application/pdf' },
  certificatePdfName:     { type: String, default: null },  // original filename
}, { timestamps: true });

module.exports = mongoose.model('CertificationRequest', certificationRequestSchema);
