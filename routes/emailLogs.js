const express    = require('express');
const router     = express.Router();
const EmailLog   = require('../models/EmailLog');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/auth');

// GET /api/email-logs  — admin only, paginated
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip  = (page - 1) * limit;

  const filter = {};
  if (req.query.status)    filter.status    = req.query.status;
  if (req.query.role)      filter.role      = req.query.role;
  if (req.query.eventType) filter.eventType = req.query.eventType;

  const [logs, total] = await Promise.all([
    EmailLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    EmailLog.countDocuments(filter),
  ]);

  res.json({ success: true, count: logs.length, total, page, data: logs });
}));

// DELETE /api/email-logs/:id — admin only
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  await EmailLog.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// DELETE /api/email-logs — clear all logs (admin)
router.delete('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  await EmailLog.deleteMany({});
  res.json({ success: true, message: 'All email logs cleared.' });
}));

module.exports = router;
