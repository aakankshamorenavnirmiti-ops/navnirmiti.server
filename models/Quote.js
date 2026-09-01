const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  projectType: {
    type: String,
    required: true,
    enum: ['residential', 'commercial', 'interior', 'renovation', 'infrastructure', 'other']
  },
  budget: {
    type: String,
    required: true,
    enum: ['10-50k', '50-100k', '1-5l', '5-10l', '10l+']
  },
  timeline: {
    type: String,
    required: true,
    enum: ['1-3m', '3-6m', '6-12m', '12m+']
  },
  details: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quote', quoteSchema);