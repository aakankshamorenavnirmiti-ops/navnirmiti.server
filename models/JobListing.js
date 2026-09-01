const mongoose = require('mongoose');

const jobListingSchema = new mongoose.Schema({
  title:       { type: String, required: [true, 'Title is required'], trim: true },
  department:  { type: String, required: [true, 'Department is required'], trim: true },
  location:    { type: String, required: [true, 'Location is required'], trim: true },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'contract'],
    required: [true, 'Job type is required']
  },
  description: { type: String, required: [true, 'Description is required'], trim: true },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('JobListing', jobListingSchema);
