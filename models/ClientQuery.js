const mongoose = require('mongoose');

const clientQuerySchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientName:  { type: String, required: true },
  clientEmail: { type: String, required: true },

  requestType: {
    type: String,
    enum: ['query', 'approval', 'change_request'],
    required: true
  },
  message: { type: String, required: true, trim: true },

  // Optional file attachment — filename in /uploads/
  attachment: { type: String, default: null },

  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved'],
    default: 'new'
  },
  adminReply: { type: String, default: '' }

}, { timestamps: true });

module.exports = mongoose.model('ClientQuery', clientQuerySchema);
