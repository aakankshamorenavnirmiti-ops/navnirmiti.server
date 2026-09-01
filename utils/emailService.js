/**
 * Centralized Email Service — Nav Nirmiti Constructions
 *
 * All student/client emails are sent from aakankshamore.navnirmiti@gmail.com
 * (configured via EMAIL_FROM in config.env, falls back to EMAIL_USER).
 *
 * NOTE: Gmail SMTP only allows sending from the authenticated account (EMAIL_USER).
 * To send "from" aakankshamore.navnirmiti@gmail.com:
 *   - If EMAIL_USER = aakankshamore.navnirmiti@gmail.com → works directly
 *   - If EMAIL_USER = navnirmiti67@gmail.com → configure "Send Mail As" alias in Gmail settings
 *     OR set EMAIL_USER=aakankshamore.navnirmiti@gmail.com + its App Password in config.env
 */

const nodemailer = require('nodemailer');
const EmailLog   = require('../models/EmailLog');

/* ── Config ── */
const SENDER_EMAIL = process.env.EMAIL_FROM || 'aakankshamore.navnirmiti@gmail.com';
const SENDER_NAME  = 'Nav Nirmiti Constructions';
const APP_URL      = process.env.APP_URL || 'http://localhost:3000';
const BRAND_COLOR  = '#450a0a';
const ACCENT_COLOR = '#c0392b';

/* ── Transporter (singleton-like) ── */
let _transporter = null;
const getTransporter = () => {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST || 'smtp.gmail.com',
      port:   parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      pool:   true,
      maxConnections: 3,
    });
  }
  return _transporter;
};

/* ─────────────────────────────────────────────────
   BRANDED EMAIL TEMPLATE
───────────────────────────────────────────────── */
const buildTemplate = ({ title, preheader = '', body, ctaLabel = 'View Dashboard', ctaUrl, footerNote = '' }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Lora',Georgia,serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:#f5f5f5;">${preheader}</div>` : ''}

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

        <!-- Header bar -->
        <tr>
          <td style="background:linear-gradient(135deg,${BRAND_COLOR} 0%,${ACCENT_COLOR} 100%);padding:0 0 4px 0;"></td>
        </tr>

        <!-- Logo + brand -->
        <tr>
          <td style="background:${BRAND_COLOR};padding:24px 32px;">
            <h1 style="margin:0;color:#ffffff;font-family:'Lora',Georgia,serif;font-size:20px;font-weight:700;letter-spacing:0.02em;">
              Nav Nirmiti Constructions
            </h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.65);font-size:12px;font-family:Arial,sans-serif;">
              Building What Matters Most
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 0;">
            <h2 style="margin:0 0 16px;color:#1a0505;font-family:'Lora',Georgia,serif;font-size:22px;font-weight:700;line-height:1.3;">
              ${title}
            </h2>
            <div style="color:#4a3535;font-family:'Lora',Georgia,serif;font-size:15px;line-height:1.8;">
              ${body}
            </div>
          </td>
        </tr>

        <!-- CTA -->
        ${ctaUrl ? `
        <tr>
          <td style="padding:24px 32px 0;">
            <a href="${ctaUrl}"
               style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:50px;letter-spacing:0.04em;">
              ${ctaLabel} →
            </a>
          </td>
        </tr>` : ''}

        <!-- Divider -->
        <tr><td style="padding:24px 32px 0;"><hr style="border:none;border-top:1px solid #f0e0e0;" /></td></tr>

        <!-- Signature -->
        <tr>
          <td style="padding:20px 32px 0;">
            <p style="margin:0;color:#1a0505;font-size:14px;font-weight:700;font-family:'Lora',Georgia,serif;">Er. Aakanksha More</p>
            <p style="margin:2px 0 8px;color:#7a3535;font-size:12px;font-family:Arial,sans-serif;">Head – Business Operations &amp; Training Coordinator</p>
            <p style="margin:0;color:#1a0505;font-size:13px;font-weight:700;font-family:'Lora',Georgia,serif;">Er. Ramchandra More</p>
            <p style="margin:2px 0 0;color:#7a3535;font-size:12px;font-family:Arial,sans-serif;">Founder &amp; Owner</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px;background:#fdf8f8;margin-top:24px;">
            <p style="margin:0;color:#9ca3af;font-size:11px;font-family:Arial,sans-serif;line-height:1.6;">
              Nav Nirmiti Constructions · Om Sai, Plot No.13, Vetalba Nagar, Miraj, Maharashtra<br/>
              <a href="mailto:aakankshamore.navnirmiti@gmail.com" style="color:#7a3535;text-decoration:none;">aakankshamore.navnirmiti@gmail.com</a>
              &nbsp;·&nbsp; +91 93707 73736
              ${footerNote ? `<br/><em>${footerNote}</em>` : ''}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

/* ─────────────────────────────────────────────────
   CORE SEND + LOG FUNCTION
───────────────────────────────────────────────── */
/**
 * @param {Object} opts
 * @param {string}  opts.to           - recipient email
 * @param {string}  opts.toName       - recipient name (for log)
 * @param {string}  opts.subject      - email subject
 * @param {string}  opts.html         - pre-built HTML OR use opts.template
 * @param {Object}  opts.template     - { title, preheader, body, ctaLabel, ctaUrl, footerNote }
 * @param {string}  opts.eventType    - event key for logging (e.g. 'student_welcome')
 * @param {string}  [opts.role]       - 'student' | 'client' | 'admin'
 */
const sendEmail = async ({ to, toName = '', subject, html, template, eventType, role = 'other' }) => {
  const finalHtml = html || (template ? buildTemplate(template) : '');

  let status = 'sent';
  let error  = null;

  try {
    await getTransporter().sendMail({
      from:    `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
      to,
      subject,
      html: finalHtml,
    });
  } catch (err) {
    status = 'failed';
    error  = err.message;
    console.error(`[Email] FAILED → ${to} | ${eventType} | ${err.message}`);
  }

  // Always log (fire and forget — don't await to avoid blocking the request)
  EmailLog.create({
    recipient: to, recipientName: toName,
    eventType, subject, status, error, role
  }).catch(e => console.error('[EmailLog] DB error:', e.message));

  return status === 'sent';
};

/* ─────────────────────────────────────────────────
   PRE-BUILT EMAIL HELPERS
───────────────────────────────────────────────── */

/** Student welcome (on registration) */
exports.studentWelcome = (user) => sendEmail({
  to: user.email, toName: user.name,
  subject: '🎓 Welcome to Nav Nirmiti Student Training Program!',
  eventType: 'student_welcome', role: 'student',
  template: {
    title: `Welcome, ${user.name}!`,
    preheader: 'Your student account has been created successfully.',
    body: `
      <p>We're <strong>delighted</strong> to have you join the Nav Nirmiti Student Training Program!</p>
      <p>Your account has been created successfully. You can now log in and begin your learning journey — complete all training modules, pass the quizzes, and earn your certificate.</p>
      <p style="color:#6b7280;font-size:13px;">If you have any questions, feel free to reach out to us at any time.</p>
    `,
    ctaLabel: 'Go to Student Dashboard',
    ctaUrl: `${APP_URL}/login`,
  }
});

/** Student — module completed */
exports.studentModuleCompleted = (user, moduleName, score) => sendEmail({
  to: user.email, toName: user.name,
  subject: `✅ Module Completed: ${moduleName}`,
  eventType: 'student_module_completed', role: 'student',
  template: {
    title: `Module Completed — ${moduleName}`,
    preheader: `You passed with ${score}%!`,
    body: `
      <p>Congratulations, <strong>${user.name}</strong>!</p>
      <p>You have successfully completed the <strong>${moduleName}</strong> module with a score of <strong>${score}%</strong>. Great work!</p>
      <p>Keep going — log in to continue with your next module.</p>
    `,
    ctaLabel: 'Continue Training',
    ctaUrl: `${APP_URL}/student-dashboard`,
  }
});

/** Student — certificate status update */
exports.studentCertUpdate = (user, certType, status, adminNotes) => sendEmail({
  to: user.email, toName: user.name,
  subject: `🎓 Certificate Update: ${certType === 'theory' ? 'Theory' : 'On-Site'} — ${status}`,
  eventType: 'student_cert_update', role: 'student',
  template: {
    title: `Certificate ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    preheader: `Your ${certType} certificate request has been ${status}.`,
    body: `
      <p>Dear <strong>${user.name}</strong>,</p>
      <p>Your <strong>${certType === 'theory' ? 'Theory Training' : 'On-Site Training'} Certificate</strong> request has been updated to: <strong style="color:${status==='issued'?'#16a34a':status==='rejected'?'#dc2626':'#d97706'};">${status.toUpperCase()}</strong></p>
      ${adminNotes ? `<p style="background:#fdf8f8;border-left:3px solid ${BRAND_COLOR};padding:10px 14px;border-radius:4px;"><strong>Note from team:</strong> ${adminNotes}</p>` : ''}
      ${status === 'issued' ? '<p>Your certificate PDF is now available for download in your dashboard.</p>' : ''}
    `,
    ctaLabel: 'View in Dashboard',
    ctaUrl: `${APP_URL}/student-dashboard`,
  }
});

/** Client welcome (on admin approval) */
exports.clientWelcome = (user) => sendEmail({
  to: user.email, toName: user.name,
  subject: '🏗️ Your Nav Nirmiti Client Account is Ready!',
  eventType: 'client_welcome', role: 'client',
  template: {
    title: `Welcome to Nav Nirmiti, ${user.name}!`,
    preheader: 'Your client account has been approved and is now active.',
    body: `
      <p>We're <strong>delighted</strong> to have you associated with us. Your onboarding has been successfully completed.</p>
      <p>You can now log in to your <strong>Client Portal</strong> to track your project — view documents, see site progress photos, and communicate directly with our team.</p>
      <p>We truly appreciate your trust and confidence in us. Our team is committed to providing you with the best possible support throughout our association.</p>
      <p style="color:#6b7280;font-size:13px;">We look forward to building a successful journey ahead together!</p>
    `,
    ctaLabel: 'Access Client Portal',
    ctaUrl: `${APP_URL}/client-login`,
  }
});

/** Client — registration rejected */
exports.clientRejected = (user, adminNote) => sendEmail({
  to: user.email, toName: user.name,
  subject: 'Your Nav Nirmiti Registration Update',
  eventType: 'client_rejected', role: 'client',
  template: {
    title: 'Registration Update',
    body: `
      <p>Dear <strong>${user.name}</strong>,</p>
      <p>Thank you for your interest in Nav Nirmiti Constructions. Unfortunately, your registration could not be approved at this time.</p>
      ${adminNote ? `<p style="background:#fdf8f8;border-left:3px solid ${BRAND_COLOR};padding:10px 14px;border-radius:4px;"><strong>Reason:</strong> ${adminNote}</p>` : ''}
      <p>Please contact us at <a href="mailto:navnirmiti67@gmail.com" style="color:${BRAND_COLOR};">navnirmiti67@gmail.com</a> or call <strong>+91 93707 73736</strong> for further assistance.</p>
    `,
  }
});

/** Client — project stage update (generic) */
exports.clientProjectUpdate = (user, stageTitle, stageMessage) => sendEmail({
  to: user.email, toName: user.name,
  subject: `📋 Project Update: ${stageTitle}`,
  eventType: `client_project_${stageTitle.toLowerCase().replace(/\s+/g,'_')}`, role: 'client',
  template: {
    title: stageTitle,
    preheader: stageMessage,
    body: `
      <p>Dear <strong>${user.name}</strong>,</p>
      <p>${stageMessage}</p>
      <p>Log in to your Client Portal to view the latest updates, documents, and site photos.</p>
    `,
    ctaLabel: 'View My Project',
    ctaUrl: `${APP_URL}/client-dashboard`,
  }
});

/** Client — admin replied to query */
exports.clientQueryReply = (user, requestType, adminReply) => sendEmail({
  to: user.email, toName: user.name,
  subject: `💬 Response to Your ${requestType === 'query' ? 'Query' : requestType === 'approval' ? 'Approval Request' : 'Change Request'}`,
  eventType: 'client_query_reply', role: 'client',
  template: {
    title: 'Response from Nav Nirmiti',
    body: `
      <p>Dear <strong>${user.name}</strong>,</p>
      <p>Our team has responded to your <strong>${requestType}</strong>:</p>
      <blockquote style="margin:16px 0;padding:12px 16px;background:#fdf8f8;border-left:3px solid ${BRAND_COLOR};border-radius:4px;color:#374151;">
        ${adminReply}
      </blockquote>
      <p>Log in to your Client Portal to view the full thread and reply if needed.</p>
    `,
    ctaLabel: 'View Conversation',
    ctaUrl: `${APP_URL}/client-dashboard`,
  }
});

/** Export the core send function for custom use */
exports.sendEmail = sendEmail;
exports.buildTemplate = buildTemplate;
exports.APP_URL = APP_URL;
