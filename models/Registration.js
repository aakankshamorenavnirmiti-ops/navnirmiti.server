const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['student', 'employee'],
    required: [true, 'Registration type is required']
  },
  // Common fields
  name:     { type: String, required: [true, 'Name is required'], trim: true },
  email:    { type: String, required: [true, 'Email is required'], trim: true, lowercase: true },
  phone:    { type: String, required: [true, 'Phone is required'], trim: true },
  city:     { type: String, required: [true, 'City is required'], trim: true },
  district: { type: String, trim: true },
  state:    { type: String, required: [true, 'State is required'], trim: true },

  // Student-specific
  collegeName: { type: String, trim: true },
  courseName:  { type: String, trim: true },
  rollNumber:  { type: String, trim: true },

  // Employee-specific
  sector:   { type: String, trim: true },
  services: { type: String, trim: true },

  // Admin workflow
  status: {
    type: String,
    enum: ['new', 'in_progress', 'reviewed', 'closed'],
    default: 'new'
  },
  adminNotes: { type: String, default: '' }
}, { timestamps: true });

// Index for duplicate-check
registrationSchema.index({ email: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
