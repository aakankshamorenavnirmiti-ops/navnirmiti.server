const mongoose = require('mongoose');

const jobOpeningSchema = new mongoose.Schema({
  title:       { type: String, required: [true, 'Job title is required'], trim: true },
  department:  { type: String, trim: true, default: '' },
  location:    { type: String, trim: true, default: 'Miraj, Maharashtra' },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'],
    default: 'Full-time'
  },
  experience:   { type: String, trim: true, default: '' },   // e.g. "2-4 years"
  description:  { type: String, required: [true, 'Job description is required'] },
  requirements: { type: String, default: '' },               // bullet points / freetext
  deadline:     { type: Date, default: null },               // application deadline
  published:    { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('JobOpening', jobOpeningSchema);
