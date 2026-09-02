const User           = require('../models/User');
const ClientProject  = require('../models/ClientProject');
const ClientQuery    = require('../models/ClientQuery');
const asyncHandler   = require('../middleware/asyncHandler');
const emailService   = require('../utils/emailService');

const ADMIN_EMAIL = () => process.env.CONTACT_EMAIL || 'navnirmiti67@gmail.com';
const APP_URL     = () => process.env.APP_URL || 'http://localhost:3000';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CLIENT REGISTRATION (with payment screenshot)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
exports.registerClient = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password || !phone)
    return res.status(400).json({ success: false, error: 'Name, email, password and phone are required.' });
  if (password.length < 6)
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing)
    return res.status(409).json({ success: false, error: 'An account with this email already exists.' });

  const userData = {
    name, email: email.toLowerCase(), password,
    role: 'client', phone, address: address || '',
    isApproved: false
  };

  if (req.files?.profilePhoto?.[0])      userData.profilePhoto      = req.files.profilePhoto[0].path;
  if (req.files?.paymentScreenshot?.[0]) userData.paymentScreenshot = req.files.paymentScreenshot[0].path;

  const user = await User.create(userData);
  await ClientProject.create({ client: user._id, projectTitle: `${name}'s Project` });

  // Notify admin
  emailService.sendEmail({
    to: ADMIN_EMAIL(), toName: 'Admin',
    subject: `ðŸ— New Client Registration (Pending Approval) â€” ${name}`,
    eventType: 'admin_client_reg_notify', role: 'admin',
    template: {
      title: `New Client Registration â€” Pending Approval`,
      body: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Address:</strong> ${address || 'Not provided'}</p>
        ${userData.paymentScreenshot
          ? `<p><strong>Payment Screenshot:</strong> <a href="${APP_URL()}/api/download/${userData.paymentScreenshot}" style="color:#450a0a;">View Screenshot</a></p>`
          : '<p><em>No payment screenshot uploaded</em></p>'}
      `,
      ctaLabel: 'Review in Admin Portal',
      ctaUrl:   `${APP_URL()}/admin-portal`,
    }
  });

  res.status(201).json({
    success: true,
    message: 'Registration submitted. You can access your account with the same password once admin approves your entry.',
    data: { id: user._id, name: user.name, email: user.email }
  });
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ADMIN â€” APPROVE / REJECT CLIENT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
exports.approveClient = asyncHandler(async (req, res) => {
  const { action, adminNote } = req.body;
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'client')
    return res.status(404).json({ success: false, error: 'Client not found' });

  if (action === 'approve') {
    user.isApproved = true;
    await user.save();

    emailService.clientWelcome(user);
    res.json({ success: true, message: 'Client approved and notified.', data: user });

  } else if (action === 'reject') {
    emailService.clientRejected(user, adminNote);
    await User.findByIdAndDelete(user._id);
    res.json({ success: true, message: 'Client rejected and notified.' });

  } else {
    res.status(400).json({ success: false, error: 'Invalid action. Use "approve" or "reject".' });
  }
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ADMIN â€” DELETE CLIENT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
exports.deleteClient = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'client')
    return res.status(404).json({ success: false, error: 'Client not found' });

  await User.findByIdAndDelete(req.params.id);
  await ClientProject.deleteOne({ client: req.params.id });
  await ClientQuery.deleteMany({ client: req.params.id });

  res.json({ success: true, data: {} });
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CLIENT PROJECT â€” own data
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
exports.getMyProject = asyncHandler(async (req, res) => {
  let project = await ClientProject.findOne({ client: req.user.id });
  if (!project) project = await ClientProject.create({ client: req.user.id });
  res.json({ success: true, data: project });
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ADMIN â€” list all clients
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
exports.getAllClients = asyncHandler(async (req, res) => {
  const filter = req.query.pending === 'true'
    ? { role: 'client', isApproved: false }
    : { role: 'client' };
  const clients = await User.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: clients.length, data: clients });
});

exports.getClientProject = asyncHandler(async (req, res) => {
  let project = await ClientProject.findOne({ client: req.params.id });
  if (!project) project = await ClientProject.create({ client: req.params.id });
  res.json({ success: true, data: project });
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ADMIN â€” upload stage files + email client
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const notifyClient = async (clientId, stageTitle, stageMessage) => {
  const user = await User.findById(clientId);
  if (user) emailService.clientProjectUpdate(user, stageTitle, stageMessage);
};

exports.uploadPlan = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
  const project = await ClientProject.findOneAndUpdate(
    { client: req.params.id },
    { planPdf: req.file.path, planUploadedAt: new Date() },
    { new: true, upsert: true }
  );
  notifyClient(req.params.id, 'Plan Document Ready',
    'Your project <strong>Plan document</strong> has been uploaded and is now available in your dashboard for download.');
  res.json({ success: true, data: project });
});

exports.uploadAgreement = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
  const project = await ClientProject.findOneAndUpdate(
    { client: req.params.id },
    { agreementPdf: req.file.path, agreementUploadedAt: new Date() },
    { new: true, upsert: true }
  );
  notifyClient(req.params.id, 'Agreement Document Ready',
    'Your project <strong>Agreement document</strong> has been uploaded. Please review it in your dashboard.');
  res.json({ success: true, data: project });
});

exports.uploadProgressImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ success: false, error: 'No files uploaded' });

  const caption   = req.body.caption || '';
  const newImages = req.files.map(f => ({ filename: f.path, caption }));
  const project   = await ClientProject.findOneAndUpdate(
    { client: req.params.id },
    { $push: { progressImages: { $each: newImages, $position: 0 } } },
    { new: true, upsert: true }
  );
  notifyClient(req.params.id, 'New Site Photos Added',
    `<strong>${newImages.length} new site photo${newImages.length > 1 ? 's' : ''}</strong> have been added to your project gallery. Log in to view them.`);
  res.json({ success: true, data: project });
});

exports.deleteProgressImage = asyncHandler(async (req, res) => {
  const project = await ClientProject.findOneAndUpdate(
    { client: req.params.clientId },
    { $pull: { progressImages: { _id: req.params.imageId } } },
    { new: true }
  );
  if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
  res.json({ success: true, data: project });
});

exports.uploadCompletion = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
  const project = await ClientProject.findOneAndUpdate(
    { client: req.params.id },
    { completionImage: req.file.path, completionUploadedAt: new Date() },
    { new: true, upsert: true }
  );
  notifyClient(req.params.id, 'ðŸ  Project Completion â€” Congratulations!',
    'Your project is now <strong>complete</strong>! The final site image is available in your dashboard. Congratulations from the entire Nav Nirmiti team!');
  res.json({ success: true, data: project });
});

exports.updateProjectTitle = asyncHandler(async (req, res) => {
  const project = await ClientProject.findOneAndUpdate(
    { client: req.params.id },
    { projectTitle: req.body.projectTitle, adminNotes: req.body.adminNotes },
    { new: true, upsert: true }
  );
  res.json({ success: true, data: project });
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CLIENT QUERIES
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
exports.createQuery = asyncHandler(async (req, res) => {
  const { requestType, message } = req.body;
  const user = await User.findById(req.user.id);
  if (!requestType || !message)
    return res.status(400).json({ success: false, error: 'Request type and message are required.' });

  const query = await ClientQuery.create({
    client: user._id, clientName: user.name, clientEmail: user.email,
    requestType, message, attachment: req.file ? req.file.path : null
  });

  // Notify admin
  emailService.sendEmail({
    to: ADMIN_EMAIL(), toName: 'Admin',
    subject: `ðŸ“‹ Client ${requestType === 'query' ? 'Query' : requestType === 'approval' ? 'Approval Request' : 'Change Request'} â€” ${user.name}`,
    eventType: 'admin_client_query_notify', role: 'admin',
    template: {
      title: `New Client ${requestType === 'change_request' ? 'Change Request' : requestType.charAt(0).toUpperCase() + requestType.slice(1)}`,
      body: `
        <p><strong>Client:</strong> ${user.name} (${user.email})</p>
        <p><strong>Type:</strong> ${requestType}</p>
        <p><strong>Message:</strong> ${message}</p>
        ${query.attachment ? `<p><strong>Attachment:</strong> ${query.attachment}</p>` : ''}
      `,
      ctaLabel: 'Review in Admin Portal',
      ctaUrl: `${APP_URL()}/admin-portal`,
    }
  });

  res.status(201).json({ success: true, data: query });
});

exports.getMyQueries = asyncHandler(async (req, res) => {
  const queries = await ClientQuery.find({ client: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: queries });
});

exports.getAllQueries = asyncHandler(async (req, res) => {
  const queries = await ClientQuery.find().sort({ createdAt: -1 });
  res.json({ success: true, count: queries.length, data: queries });
});

exports.getClientQueries = asyncHandler(async (req, res) => {
  const queries = await ClientQuery.find({ client: req.params.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: queries });
});

exports.updateQuery = asyncHandler(async (req, res) => {
  const { status, adminReply } = req.body;
  const query = await ClientQuery.findByIdAndUpdate(
    req.params.id,
    { ...(status && { status }), ...(adminReply !== undefined && { adminReply }) },
    { new: true }
  );
  if (!query) return res.status(404).json({ success: false, error: 'Query not found' });

  if (adminReply) {
    const user = await User.findById(query.client);
    if (user) emailService.clientQueryReply(user, query.requestType, adminReply);
  }
  res.json({ success: true, data: query });
});

exports.deleteQuery = asyncHandler(async (req, res) => {
  const query = await ClientQuery.findByIdAndDelete(req.params.id);
  if (!query) return res.status(404).json({ success: false, error: 'Query not found' });
  res.json({ success: true, data: {} });
});
