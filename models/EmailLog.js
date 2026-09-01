const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  recipient:  { type: String, required: true },   // email address
  recipientName: { type: String, default: '' },
  eventType:  { type: String, required: true },   // e.g. 'student_welcome', 'client_plan_uploaded'
  subject:    { type: String, required: true },
  status:     { type: String, enum: ['sent', 'failed'], default: 'sent' },
  error:      { type: String, default: null },     // error message if failed
  role:       { type: String, enum: ['student', 'client', 'admin', 'other'], default: 'other' }
}, { timestamps: true });

// Index for efficient querying
emailLogSchema.index({ createdAt: -1 });
emailLogSchema.index({ recipient: 1 });
emailLogSchema.index({ eventType: 1 });

module.exports = mongoose.model('EmailLog', emailLogSchema);
