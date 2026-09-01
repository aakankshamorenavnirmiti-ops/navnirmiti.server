const JobOpening = require('../models/JobOpening');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/job-openings  — public: only published
exports.getJobOpenings = asyncHandler(async (req, res) => {
  const jobs = await JobOpening.find({ published: true }).sort({ createdAt: -1 });
  res.json({ success: true, count: jobs.length, data: jobs });
});

// GET /api/job-openings/:id  — public
exports.getJobOpening = asyncHandler(async (req, res) => {
  const job = await JobOpening.findById(req.params.id);
  if (!job || !job.published)
    return res.status(404).json({ success: false, error: 'Job opening not found' });
  res.json({ success: true, data: job });
});

// POST /api/job-openings  (admin)
exports.createJobOpening = asyncHandler(async (req, res) => {
  const job = await JobOpening.create(req.body);
  res.status(201).json({ success: true, data: job });
});

// PUT /api/job-openings/:id  (admin)
exports.updateJobOpening = asyncHandler(async (req, res) => {
  const job = await JobOpening.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!job) return res.status(404).json({ success: false, error: 'Job opening not found' });
  res.json({ success: true, data: job });
});

// DELETE /api/job-openings/:id  (admin)
exports.deleteJobOpening = asyncHandler(async (req, res) => {
  const job = await JobOpening.findByIdAndDelete(req.params.id);
  if (!job) return res.status(404).json({ success: false, error: 'Job opening not found' });
  res.json({ success: true, data: {} });
});
