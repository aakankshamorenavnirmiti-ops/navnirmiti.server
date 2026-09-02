const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Update student training progress
// @route   PUT /api/training/progress
// @access  Private (student)
exports.updateTrainingProgress = asyncHandler(async (req, res, next) => {
  const { module, status, score } = req.body;
  
  // Check if user is a student
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Only students can update training progress'
    });
  }
  
  const user = await User.findById(req.user.id);
  
  // Find existing module or create new one
  const moduleIndex = user.trainingProgress.findIndex(item => item.module === module);
  
  if (moduleIndex > -1) {
    // Update existing module
    user.trainingProgress[moduleIndex].status = status;
    user.trainingProgress[moduleIndex].score = score;
    if (status === 'completed') {
      user.trainingProgress[moduleIndex].completedAt = Date.now();
    }
  } else {
    // Add new module
    user.trainingProgress.push({
      module,
      status,
      score,
      completedAt: status === 'completed' ? Date.now() : null
    });
  }
  
  await user.save();
  
  res.status(200).json({
    success: true,
    data: user.trainingProgress
  });
});

// @desc    Get student training progress
// @route   GET /api/training/progress
// @access  Private (student)
exports.getTrainingProgress = asyncHandler(async (req, res, next) => {
  // Check if user is a student
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Only students can view training progress'
    });
  }
  
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: user.trainingProgress
  });
});

// @desc    Upload file for employee
// @route   POST /api/training/upload
// @access  Private (employee)
exports.uploadFile = asyncHandler(async (req, res, next) => {
  const { description } = req.body;
  
  // Check if user is an employee
  if (req.user.role !== 'employee') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Only employees can upload files'
    });
  }
  
  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }
  
  const user = await User.findById(req.user.id);
  
  user.uploadedFiles.push({
    filename: req.file.path,
    originalName: req.file.originalname,
    filePath: req.file.path,
    description: description || ''
  });
  
  await user.save();
  
  res.status(200).json({
    success: true,
    data: user.uploadedFiles
  });
});

// @desc    Get employee uploaded files
// @route   GET /api/training/files
// @access  Private (employee)
exports.getUploadedFiles = asyncHandler(async (req, res, next) => {
  // Check if user is an employee
  if (req.user.role !== 'employee') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Only employees can view uploaded files'
    });
  }
  
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: user.uploadedFiles
  });
});

// @desc    Get all students (for admin)
// @route   GET /api/training/students
// @access  Private (admin)
exports.getStudents = asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Only admins can view all students'
    });
  }
  
  const students = await User.find({ role: 'student' });
  
  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

// @desc    Get all employees (for admin)
// @route   GET /api/training/employees
// @access  Private (admin)
exports.getEmployees = asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Only admins can view all employees'
    });
  }
  
  const employees = await User.find({ role: 'employee' });
  
  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees
  });
});