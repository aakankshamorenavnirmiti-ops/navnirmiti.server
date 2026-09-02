const Testimonial = require('../models/Testimonial');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all published testimonials (optionally filtered by category)
// @route   GET /api/testimonials
// @access  Public
exports.getTestimonials = asyncHandler(async (req, res) => {
  const filter = { published: true };
  if (req.query.category && ['client', 'employee', 'student'].includes(req.query.category)) {
    filter.category = req.query.category;
  }
  const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
});

// @desc    Get ALL testimonials including unpublished (admin)
// @route   GET /api/testimonials/all
// @access  Private/Admin
exports.getAllTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
});

// @desc    Create a testimonial
// @route   POST /api/testimonials
// @access  Private/Admin
exports.createTestimonial = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (req.file) body.photo = req.file.path;
  if (typeof body.published === 'string') body.published = body.published === 'true';

  const testimonial = await Testimonial.create(body);
  res.status(201).json({ success: true, data: testimonial });
});

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Private/Admin
exports.updateTestimonial = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (req.file) body.photo = req.file.path;
  if (typeof body.published === 'string') body.published = body.published === 'true';

  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  if (!testimonial) return res.status(404).json({ success: false, error: 'Testimonial not found' });
  res.status(200).json({ success: true, data: testimonial });
});

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
exports.deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
  if (!testimonial) return res.status(404).json({ success: false, error: 'Testimonial not found' });
  res.status(200).json({ success: true, data: {} });
});
