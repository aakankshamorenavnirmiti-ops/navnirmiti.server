const Career = require('../models/Career');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create new career application
// @route   POST /api/careers
// @access  Public
exports.createApplication = asyncHandler(async (req, res, next) => {
  const application = await Career.create(req.body);
  
  // In a real application, you would send an email here
  console.log('New career application:', application);
  
  res.status(201).json({
    success: true,
    message: 'Thank you for your application! We will contact you soon.',
    data: application
  });
});

// @desc    Get all career applications
// @route   GET /api/careers
// @access  Private
exports.getApplications = asyncHandler(async (req, res, next) => {
  const applications = await Career.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications
  });
});

// @desc    Get single career application
// @route   GET /api/careers/:id
// @access  Private
exports.getApplication = asyncHandler(async (req, res, next) => {
  const application = await Career.findById(req.params.id);
  
  if (!application) {
    return res.status(404).json({
      success: false,
      error: 'Application not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: application
  });
});

// @desc    Delete career application
// @route   DELETE /api/careers/:id
// @access  Private
exports.deleteApplication = asyncHandler(async (req, res, next) => {
  const application = await Career.findByIdAndDelete(req.params.id);
  
  if (!application) {
    return res.status(404).json({
      success: false,
      error: 'Application not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: {}
  });
});