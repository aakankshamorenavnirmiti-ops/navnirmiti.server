const JobListing = require('../models/JobListing');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/jobs — public: only active listings
exports.getJobs = asyncHandler(async (req, res) => {
  const isAdmin = req.headers.authorization?.startsWith('Bearer');
  const filter  = isAdmin ? {} : { status: 'active' };
  const jobs    = await JobListing.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: jobs.length, data: jobs });
});

// POST /api/jobs — admin
exports.createJob = asyncHandler(async (req, res) => {
  const job = await JobListing.create(req.body);
  res.status(201).json({ success: true, data: job });
});

// PUT /api/jobs/:id — admin
exports.updateJob = asyncHandler(async (req, res) => {
  const job = await JobListing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
  res.json({ success: true, data: job });
});

// DELETE /api/jobs/:id — admin
exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await JobListing.findByIdAndDelete(req.params.id);
  if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
  res.json({ success: true, data: {} });
});
