const TrainingModule       = require('../models/TrainingModule');
const CertificationRequest = require('../models/CertificationRequest');
const User                 = require('../models/User');
const asyncHandler         = require('../middleware/asyncHandler');
const emailService         = require('../utils/emailService');

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TRAINING MODULES  (admin CRUD)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

// GET /api/modules  â€” all published (students) or all (admin)
exports.getModules = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === 'admin';
  const filter  = isAdmin ? {} : { published: true };
  const modules = await TrainingModule.find(filter).sort({ order: 1, createdAt: 1 });
  res.json({ success: true, count: modules.length, data: modules });
});

// GET /api/modules/:id
exports.getModule = asyncHandler(async (req, res) => {
  const mod = await TrainingModule.findById(req.params.id);
  if (!mod) return res.status(404).json({ success: false, error: 'Module not found' });
  res.json({ success: true, data: mod });
});

// POST /api/modules  (admin)
exports.createModule = asyncHandler(async (req, res) => {
  const mod = await TrainingModule.create(req.body);
  res.status(201).json({ success: true, data: mod });
});

// PUT /api/modules/:id  (admin)
exports.updateModule = asyncHandler(async (req, res) => {
  const mod = await TrainingModule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!mod) return res.status(404).json({ success: false, error: 'Module not found' });
  res.json({ success: true, data: mod });
});

// DELETE /api/modules/:id  (admin)
exports.deleteModule = asyncHandler(async (req, res) => {
  const mod = await TrainingModule.findByIdAndDelete(req.params.id);
  if (!mod) return res.status(404).json({ success: false, error: 'Module not found' });
  res.json({ success: true, data: {} });
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STUDENT â€” START / SUBMIT QUIZ
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

// PUT /api/modules/:id/start  â€” marks module in_progress
exports.startModule = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const mod  = await TrainingModule.findById(req.params.id);
  if (!mod) return res.status(404).json({ success: false, error: 'Module not found' });

  const existing = user.trainingProgress.find(p => p.module === mod.title);
  if (existing) {
    if (existing.status === 'not_started') existing.status = 'in_progress';
  } else {
    user.trainingProgress.push({ module: mod.title, status: 'in_progress' });
  }
  // If module has no quiz, auto-complete it on start
  if (!mod.quiz || mod.quiz.length === 0) {
    const prog = user.trainingProgress.find(p => p.module === mod.title);
    if (prog && prog.status !== 'completed') {
      prog.status = 'completed';
      prog.completedAt = new Date();
    }
  }
  await user.save();
  res.json({ success: true, data: user.trainingProgress });
});

// POST /api/modules/:id/quiz  â€” submit quiz answers, auto-mark completed if pass
exports.submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body; // array of selected option indices
  const mod  = await TrainingModule.findById(req.params.id);
  if (!mod) return res.status(404).json({ success: false, error: 'Module not found' });
  // If module has no quiz, just mark it completed
  if (!mod.quiz || mod.quiz.length === 0) {
    const user = await User.findById(req.user.id);
    const idx = user.trainingProgress.findIndex(p => p.module === mod.title);
    if (idx > -1) {
      user.trainingProgress[idx].status = 'completed';
      user.trainingProgress[idx].completedAt = new Date();
    } else {
      user.trainingProgress.push({ module: mod.title, status: 'completed', completedAt: new Date() });
    }
    await user.save();
    return res.json({
      success: true,
      score: 100,
      passed: true,
      passMark: 0,
      correct: 0,
      total: 0,
      results: [],
      progress: user.trainingProgress
    });
  }

  // Grade
  let correct = 0;
  const results = mod.quiz.map((q, i) => {
    const isCorrect = answers[i] === q.correctIndex;
    if (isCorrect) correct++;
    return {
      question:      q.question,
      selected:      answers[i],
      correctIndex:  q.correctIndex,
      isCorrect,
      explanation:   q.explanation,
      options:       q.options
    };
  });

  const score   = Math.round((correct / mod.quiz.length) * 100);
  const passed  = score >= mod.passMark;

  // Update user progress
  const user = await User.findById(req.user.id);
  const idx  = user.trainingProgress.findIndex(p => p.module === mod.title);

  if (idx > -1) {
    if (passed) {
      user.trainingProgress[idx].status      = 'completed';
      user.trainingProgress[idx].score       = score;
      user.trainingProgress[idx].completedAt = new Date();
    } else {
      user.trainingProgress[idx].status = 'in_progress';
      user.trainingProgress[idx].score  = score;
    }
  } else {
    user.trainingProgress.push({
      module:      mod.title,
      status:      passed ? 'completed' : 'in_progress',
      score,
      completedAt: passed ? new Date() : null
    });
  }

  await user.save();

  // Email student when they pass a module
  if (passed) {
    emailService.studentModuleCompleted(user, mod.title, score);
  }

  res.json({
    success: true,
    score,
    passed,
    passMark:  mod.passMark,
    correct,
    total:     mod.quiz.length,
    results,
    progress:  user.trainingProgress
  });
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CERTIFICATION REQUESTS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

// POST /api/modules/cert-request  â€” student applies for certificate
exports.createCertRequest = asyncHandler(async (req, res) => {
  const { certPhone, type, message } = req.body;

  if (!['theory', 'onsite'].includes(type))
    return res.status(400).json({ success: false, error: 'Invalid certification type' });

  if (!certPhone || certPhone.trim().length < 10)
    return res.status(400).json({ success: false, error: 'Please provide a valid mobile number.' });

  const user = await User.findById(req.user.id);

  const completedModules = user.trainingProgress
    .filter(p => p.status === 'completed')
    .map(p => p.module);

  if (type === 'theory') {
    const allMods = await TrainingModule.find({ published: true });
    if (completedModules.length < allMods.length) {
      return res.status(400).json({
        success: false,
        error: `You must complete all ${allMods.length} modules before applying for a theory certificate. You have completed ${completedModules.length}.`
      });
    }
  }

  const existing = await CertificationRequest.findOne({ student: user._id, type, status: 'pending' });
  if (existing)
    return res.status(409).json({ success: false, error: 'You already have a pending certification request of this type.' });

  const cert = await CertificationRequest.create({
    student:          user._id,
    studentName:      user.name,
    studentEmail:     user.email,
    certPhone:        certPhone.trim(),
    type,
    message:          message || '',
    modulesCompleted: completedModules
  });

  // Notify admin
  emailService.sendEmail({
    to: process.env.CONTACT_EMAIL || 'navnirmiti67@gmail.com',
    toName: 'Admin',
    subject: `ðŸŽ“ ${type === 'theory' ? 'Theory' : 'On-Site'} Certificate Request â€” ${user.name}`,
    eventType: 'admin_cert_request_notify',
    role: 'admin',
    template: {
      title: `New Certificate Request â€” ${user.name}`,
      body: `
        <p><strong>Student:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Type:</strong> ${type === 'theory' ? 'Theory Training' : 'On-Site Training'}</p>
        <p><strong>Contact Mobile:</strong> ${certPhone}</p>
        <p><strong>Modules Completed:</strong> ${completedModules.join(', ')}</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
      `,
      ctaLabel: 'Review in Admin Portal',
      ctaUrl: `${emailService.APP_URL}/admin-portal`,
    }
  });

  res.status(201).json({ success: true, data: cert });
});

// GET /api/modules/cert-requests/mine  â€” student's own requests
exports.getMyCertRequests = asyncHandler(async (req, res) => {
  const reqs = await CertificationRequest.find({ student: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: reqs });
});

// GET /api/modules/cert-requests  â€” admin: all requests
exports.getAllCertRequests = asyncHandler(async (req, res) => {
  const reqs = await CertificationRequest.find().sort({ createdAt: -1 });
  res.json({ success: true, count: reqs.length, data: reqs });
});

// PUT /api/modules/cert-requests/:id  â€” admin: update status
exports.updateCertRequest = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;
  const cert = await CertificationRequest.findByIdAndUpdate(
    req.params.id,
    { status, adminNotes },
    { new: true }
  );
  if (!cert) return res.status(404).json({ success: false, error: 'Request not found' });

  // Email student about cert status change
  if (status && ['approved', 'issued', 'rejected'].includes(status)) {
    const student = await User.findById(cert.student);
    if (student) {
      emailService.studentCertUpdate(student, cert.type, status, adminNotes);
    }
  }

  res.json({ success: true, data: cert });
});

// PUT /api/modules/cert-requests/:id/upload-pdf  â€” admin uploads certificate PDF
exports.uploadCertPdf = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

  const cert = await CertificationRequest.findByIdAndUpdate(
    req.params.id,
    { certificatePdf: req.file.path, status: 'issued' },
    { new: true }
  );
  if (!cert) return res.status(404).json({ success: false, error: 'Request not found' });
  res.json({ success: true, data: cert });
});
