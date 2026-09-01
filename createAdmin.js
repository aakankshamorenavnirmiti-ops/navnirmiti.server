/**
 * Admin Account Setup Script
 * Run once: node createAdmin.js
 * Creates the admin user for the Nav Nirmiti Admin Portal.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env
dotenv.config({ path: './config/config.env' });

const ADMIN_CREDENTIALS = {
  name: 'Nav Nirmiti Admin',
  email: 'navnirmiti67@gmail.com',
  password: 'NavAdmin@2024',   // ← Change this to your preferred password
  role: 'admin'
};

const setup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN_CREDENTIALS.email });
    if (existing) {
      console.log(`Admin already exists: ${existing.email} (role: ${existing.role})`);
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log('Role updated to admin.');
      }
    } else {
      const admin = await User.create(ADMIN_CREDENTIALS);
      console.log(`✅ Admin created successfully!`);
      console.log(`   Email:    ${ADMIN_CREDENTIALS.email}`);
      console.log(`   Password: ${ADMIN_CREDENTIALS.password}`);
      console.log(`   Portal:   http://localhost:3000/admin-login`);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

setup();
