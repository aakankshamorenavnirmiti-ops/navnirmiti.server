const Registration = require('../models/Registration');
const asyncHandler = require('../middleware/asyncHandler');
const nodemailer = require('nodemailer');

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

// @desc  Create a new registration (student or employee)
// @route POST /api/registrations
// @access Public
exports.createRegistration = asyncHandler(async (req, res) => {
  const { type, email } = req.body;

  if (!type || !['student', 'employee'].includes(type)) {
    return res.status(400).json({ success: false, error: 'Invalid registration type.' });
  }

  // Prevent duplicate submissions (same email + type)
  const existing = await Registration.findOne({ email: email?.toLowerCase(), type });
  if (existing) {
    return res.status(409).json({
      success: false,
      error: `A ${type} registration with this email already exists.`
    });
  }

  const registration = await Registration.create(req.body);

  // Email notification to admin
  try {
    const transporter = createTransporter();
    const label = type === 'student' ? 'Student' : 'Employee';

    const rows = Object.entries(registration.toObject())
      .filter(([k]) => !['_id', '__v', 'status', 'adminNotes', 'updatedAt'].includes(k))
      .map(([k, v]) =>
        `<tr>
          <td style="padding:6px 12px;font-weight:600;color:#374151;white-space:nowrap;">${k}</td>
          <td style="padding:6px 12px;color:#6b7280;">${v}</td>
        </tr>`
      ).join('');

    await transporter.sendMail({
      from: `"Nav Nirmiti Website" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL || 'navnirmiti67@gmail.com',
      subject: `📋 New ${label} Registration — ${registration.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <div style="background:#450a0a;padding:20px 24px;">
            <h2 style="color:#fff;margin:0;font-size:20px;">New ${label} Registration</h2>
            <p style="color:rgba(255,255,255,0.65);margin:4px 0 0;font-size:13px;">Submitted via navnirmiti.com</p>
          </div>
          <div style="padding:24px;">
            <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
              <thead><tr style="background:#f9fafb;">
                <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;">Field</th>
                <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;">Value</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div style="background:#f9fafb;padding:14px 24px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              View all registrations in the
              <a href="${process.env.ADMIN_URL || 'http://localhost:3000/admin-portal'}" style="color:#450a0a;">Admin Portal →</a>
            </p>
          </div>
        </div>`
    });
  } catch (e) {
    console.error('Registration email error:', e.message);
  }

  res.status(201).json({
    success: true,
    message: 'Registration submitted successfully! We will contact you soon.',
    data: registration
  });
});

// @desc  Get all registrations (admin), filterable by ?type=student|employee
// @route GET /api/registrations
// @access Private/Admin
exports.getRegistrations = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.type && ['student', 'employee'].includes(req.query.type)) {
    filter.type = req.query.type;
  }
  const registrations = await Registration.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: registrations.length, data: registrations });
});

// @desc  Update registration status
// @route PUT /api/registrations/:id/status
// @access Private/Admin
exports.updateRegistrationStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;
  const update = {};
  if (status) update.status = status;
  if (adminNotes !== undefined) update.adminNotes = adminNotes;

  const reg = await Registration.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!reg) return res.status(404).json({ success: false, error: 'Registration not found' });
  res.status(200).json({ success: true, data: reg });
});

// @desc  Delete a registration
// @route DELETE /api/registrations/:id
// @access Private/Admin
exports.deleteRegistration = asyncHandler(async (req, res) => {
  const reg = await Registration.findByIdAndDelete(req.params.id);
  if (!reg) return res.status(404).json({ success: false, error: 'Registration not found' });
  res.status(200).json({ success: true, data: {} });
});
