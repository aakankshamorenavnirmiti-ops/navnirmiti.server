const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['client', 'employee', 'student']
  },
  text: {
    type: String,
    required: [true, 'Testimonial text is required'],
    trim: true
  },
  // Optional photo — filename stored in /uploads/
  photo: {
    type: String,
    default: null
  },
  // Optional designation / role label shown under name
  designation: {
    type: String,
    trim: true,
    default: ''
  },
  // Admin can hide a testimonial without deleting it
  published: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
