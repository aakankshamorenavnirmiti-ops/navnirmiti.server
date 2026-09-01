const Quote = require('../models/Quote');
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

// @desc    Create new quote request
// @route   POST /api/quotes
// @access  Public
exports.createQuote = asyncHandler(async (req, res, next) => {
  const quote = await Quote.create(req.body);
  
  // Send email notification to admin
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Nav Nirmiti Website" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL || 'navnirmiti67@gmail.com',
      subject: `🏗️ New Quote Request from ${quote.name} — ${quote.projectType}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <div style="background:#450a0a;padding:20px 24px;">
            <h2 style="color:#fff;margin:0;font-size:20px;">New Quote Request</h2>
            <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">Submitted via navnirmiti.com quote form</p>
          </div>
          <div style="padding:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;font-weight:bold;color:#374151;width:140px;">Name</td><td style="padding:8px 0;color:#6b7280;">${quote.name}</td></tr>
              <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Email</td><td style="padding:8px 0;color:#6b7280;">${quote.email}</td></tr>
              <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Phone</td><td style="padding:8px 0;color:#6b7280;">${quote.phone}</td></tr>
              <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Project Type</td><td style="padding:8px 0;color:#6b7280;text-transform:capitalize;">${quote.projectType}</td></tr>
              <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Budget</td><td style="padding:8px 0;color:#6b7280;">${quote.budget}</td></tr>
              <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Timeline</td><td style="padding:8px 0;color:#6b7280;">${quote.timeline}</td></tr>
              <tr><td style="padding:8px 0;font-weight:bold;color:#374151;vertical-align:top;">Project Details</td><td style="padding:8px 0;color:#6b7280;">${quote.details || 'Not provided'}</td></tr>
              <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Received At</td><td style="padding:8px 0;color:#6b7280;">${new Date(quote.createdAt).toLocaleString('en-IN')}</td></tr>
            </table>
          </div>
          <div style="background:#f9fafb;padding:16px 24px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">This is an automated notification. View all quote requests at <a href="http://localhost:3000/admin-portal" style="color:#450a0a;">Admin Portal</a></p>
          </div>
        </div>
      `
    });
    console.log('Quote request email sent to admin');
  } catch (error) {
    console.error('Error sending quote email:', error.message);
  }

  res.status(201).json({
    success: true,
    message: 'Thank you for your quote request! We will contact you soon.',
    data: quote
  });
});

// @desc    Get all quote requests
// @route   GET /api/quotes
// @access  Private
exports.getQuotes = asyncHandler(async (req, res, next) => {
  const quotes = await Quote.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: quotes.length,
    data: quotes
  });
});

// @desc    Get single quote request
// @route   GET /api/quotes/:id
// @access  Private
exports.getQuote = asyncHandler(async (req, res, next) => {
  const quote = await Quote.findById(req.params.id);
  
  if (!quote) {
    return res.status(404).json({
      success: false,
      error: 'Quote request not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: quote
  });
});

// @desc    Delete quote request
// @route   DELETE /api/quotes/:id
// @access  Private
exports.deleteQuote = asyncHandler(async (req, res, next) => {
  const quote = await Quote.findByIdAndDelete(req.params.id);
  
  if (!quote) {
    return res.status(404).json({
      success: false,
      error: 'Quote request not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: {}
  });
});