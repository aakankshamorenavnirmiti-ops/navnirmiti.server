const Contact = require('../models/Contact');
const asyncHandler = require('../middleware/asyncHandler');
const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// @desc    Create new contact form submission
// @route   POST /api/contact
// @access  Public
exports.createContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.create(req.body);
  
  // Send email notification to admin
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Nav Nirmiti Website" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL || 'navnirmiti67@gmail.com',
      subject: `📩 New Enquiry from ${contact.name} — ${contact.subject}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <div style="background:#450a0a;padding:20px 24px;">
            <h2 style="color:#fff;margin:0;font-size:20px;">New Website Enquiry</h2>
            <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">Submitted via navnirmiti.com contact form</p>
          </div>
          <div style="padding:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;font-weight:bold;color:#374151;width:130px;">Name</td><td style="padding:8px 0;color:#6b7280;">${contact.name}</td></tr>
              <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Email</td><td style="padding:8px 0;color:#6b7280;">${contact.email}</td></tr>
              <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Phone</td><td style="padding:8px 0;color:#6b7280;">${contact.phone || 'Not provided'}</td></tr>
              <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Subject</td><td style="padding:8px 0;color:#6b7280;">${contact.subject}</td></tr>
              <tr><td style="padding:8px 0;font-weight:bold;color:#374151;vertical-align:top;">Message</td><td style="padding:8px 0;color:#6b7280;">${contact.message}</td></tr>
              <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Received At</td><td style="padding:8px 0;color:#6b7280;">${new Date(contact.createdAt).toLocaleString('en-IN')}</td></tr>
            </table>
          </div>
          <div style="background:#f9fafb;padding:16px 24px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">This is an automated notification from your website. View all enquiries at <a href="http://localhost:3000/admin-portal" style="color:#450a0a;">Admin Portal</a></p>
          </div>
        </div>
      `
    });
    console.log('Contact form email sent to admin');
  } catch (error) {
    console.error('Error sending contact email:', error.message);
  }
  
  res.status(201).json({
    success: true,
    message: 'Thank you for your message! We will contact you soon.',
    data: contact
  });
});

// @desc    Get all contact form submissions
// @route   GET /api/contact
// @access  Private
exports.getContacts = asyncHandler(async (req, res, next) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: contacts.length,
    data: contacts
  });
});

// @desc    Get single contact form submission
// @route   GET /api/contact/:id
// @access  Private
exports.getContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);
  
  if (!contact) {
    return res.status(404).json({
      success: false,
      error: 'Contact submission not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Delete contact form submission
// @route   DELETE /api/contact/:id
// @access  Private
exports.deleteContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  
  if (!contact) {
    return res.status(404).json({
      success: false,
      error: 'Contact submission not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: {}
  });
});