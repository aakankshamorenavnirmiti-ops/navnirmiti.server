const Project = require('../models/Project');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
exports.getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: projects.length, data: projects });
});

// @desc    Get projects by category
// @route   GET /api/projects/category/:category
// @access  Public
exports.getProjectsByCategory = asyncHandler(async (req, res) => {
  const projects = await Project.find({ category: req.params.category }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: projects.length, data: projects });
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
  res.status(200).json({ success: true, data: project });
});

// @desc    Create project with multiple images (up to 10)
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  // Handle multipart image uploads
  if (req.files && req.files.length > 0) {
    body.images = req.files.map(f => f.filename);
    body.image  = body.images[0]; // legacy compat
  } else if (req.file) {
    body.images = [req.file.filename];
    body.image  = req.file.filename;
  }

  const project = await Project.create(body);
  res.status(201).json({ success: true, data: project });
});

// @desc    Update project (and optionally replace/add images)
// @route   PUT /api/projects/:id
// @access  Private/Admin
exports.updateProject = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  // keepImages is sent from admin portal as the images to retain
  const keepImages = Array.isArray(body.keepImages)
    ? body.keepImages
    : body.keepImages
    ? [body.keepImages]
    : null;

  delete body.keepImages;

  // New images uploaded
  const newImages = req.files && req.files.length > 0
    ? req.files.map(f => f.filename)
    : req.file
    ? [req.file.filename]
    : [];

  // Merge: kept existing + new uploads
  if (keepImages !== null || newImages.length > 0) {
    const existing = keepImages || [];
    body.images = [...existing, ...newImages];
    body.image  = body.images[0] || null;
  }

  const project = await Project.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
  res.status(200).json({ success: true, data: project });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
  res.status(200).json({ success: true, data: {} });
});
