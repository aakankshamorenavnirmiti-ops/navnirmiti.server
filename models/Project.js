const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  year: {
    type: String,
    required: [true, 'Year is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['residential', 'commercial', 'interior', 'hotel', 'infrastructure']
  },
  // Multi-image support — array of filenames stored in /uploads/
  images: {
    type: [String],
    default: []
  },
  // Legacy single-image field (kept for backward compat)
  image: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Virtual: returns images array, falling back to legacy image field
projectSchema.virtual('allImages').get(function () {
  if (this.images && this.images.length > 0) return this.images;
  if (this.image) return [this.image];
  return [];
});

projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);
