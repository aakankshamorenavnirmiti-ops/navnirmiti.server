const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs   = require('fs');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Import database connection
const connectDB = require('./config/db');

// Import routes
const projectRoutes = require('./routes/projects');
const blogRoutes = require('./routes/blog');
const contactRoutes = require('./routes/contact');
const quoteRoutes = require('./routes/quotes');
const careerRoutes = require('./routes/careers');
const authRoutes = require('./routes/auth');
const trainingRoutes = require('./routes/training');
const registrationRoutes = require('./routes/registrations');
const testimonialRoutes  = require('./routes/testimonials');
const moduleRoutes       = require('./routes/modules');
const clientRoutes       = require('./routes/clients');
const jobRoutes          = require('./routes/jobs');
const emailLogRoutes     = require('./routes/emailLogs');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Initialize app
const app = express();

// Ensure uploads directory exists (created fresh on each Render deploy)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads/ directory');
}

// Connect to database
connectDB();

// Root route â€” confirms API is live
app.get('/', (req, res) => {
  res.json({ success: true, message: 'NNC Backend API is running' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
// Build CORS allowed origins from environment variables
const allowedOrigins = [];
if (process.env.APP_URL) {
  allowedOrigins.push(process.env.APP_URL);
}
if (process.env.ADDITIONAL_ORIGINS) {
  process.env.ADDITIONAL_ORIGINS.split(',')
    .map(o => o.trim())
    .filter(Boolean)
    .forEach(o => allowedOrigins.push(o));
}
allowedOrigins.push(/\.pages\.dev$/);

if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 1) {
  console.warn('[CORS] WARNING: APP_URL is not set. No string origin is whitelisted for production.');
}

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? allowedOrigins : '*',
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/testimonials',  testimonialRoutes);
app.use('/api/modules',       moduleRoutes);
app.use('/api/clients',       clientRoutes);
app.use('/api/jobs',          jobRoutes);
app.use('/api/email-logs',    emailLogRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Direct file download endpoint â€” works in both dev and prod
// Used for certificate PDFs so they download through the /api proxy in development
app.get('/api/download/:filename', (req, res) => {
  const filename = path.basename(req.params.filename); // prevent path traversal
  const filePath = path.join(__dirname, 'uploads', filename);
  res.download(filePath, filename, (err) => {
    if (err) {
      res.status(404).json({ success: false, error: 'File not found' });
    }
  });
});

// Unknown route fallback â€” must come after all API routes, before errorHandler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// Keep-alive: ping /api/health every 14 min to prevent Render free tier spin-down
if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
  const https = require('https');
  setInterval(() => {
    https.get(process.env.RENDER_EXTERNAL_URL + '/api/health', res => {
      console.log('[keep-alive] ping ->', res.statusCode);
    }).on('error', e => console.warn('[keep-alive] ping failed:', e.message));
  }, 14 * 60 * 1000);
  console.log('[keep-alive] Self-ping enabled every 14 minutes');
}
module.exports = app;