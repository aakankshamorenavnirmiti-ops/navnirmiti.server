const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const emailService = require('../utils/emailService');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { 
    name, 
    email, 
    password, 
    role, 
    mobileNumber, 
    collegeName, 
    city, 
    district, 
    state, 
    courseName, 
    rollNumber, 
    sector 
  } = req.body;
  
  // Create user with role-specific fields
  const userData = {
    name,
    email,
    password,
    role
  };
  
  // Add student-specific fields if role is student
  if (role === 'student') {
    userData.mobileNumber = mobileNumber;
    userData.collegeName = collegeName;
    userData.city = city;
    userData.district = district;
    userData.state = state;
    userData.courseName = courseName;
    userData.rollNumber = rollNumber;
  }
  
  // Add employee-specific fields if role is employee
  if (role === 'employee') {
    userData.mobileNumber = mobileNumber;
    userData.city = city;
    userData.district = district;
    userData.state = state;
    userData.sector = sector;
    if (req.body.services) userData.services = req.body.services;
  }
  
  // Check for duplicate email
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({
      success: false,
      error: 'An account with this email already exists. Please log in or use a different email.'
    });
  }

  // Create user
  const user = await User.create(userData);

  // Send welcome email to students
  if (role === 'student') {
    emailService.studentWelcome(user);
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  
  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide an email and password'
    });
  }
  
  // Check for user
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
  
  // Check if password matches
  const isMatch = await user.matchPassword(password);
  
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Block unapproved client accounts
  if (user.role === 'client' && user.isApproved === false) {
    return res.status(403).json({
      success: false,
      error: 'Your account is pending approval. You will be notified once admin has reviewed your registration.'
    });
  }
  
  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: user
    });
};

// @desc    Upload profile photo for current user
// @route   PUT /api/auth/profile-photo
// @access  Private
exports.uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { profilePhoto: req.file.filename },
    { new: true }
  );
  res.json({ success: true, data: user });
});
