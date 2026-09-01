/**
 * Admin Account Setup Script
 * Run once: node createAdmin.js
 *
 * Removes all existing admin accounts and creates 3 new ones.
 * All admins have full equal access to the admin dashboard.
 * Changes made by any admin are stored in the shared MongoDB database
 * and are immediately visible to all other admins.
 *
 * Usage: node createAdmin.js
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const User     = require('./models/User');

dotenv.config({ path: './config/config.env' });

const ADMINS = [
  {
    name:        'Er. Aakanksha More',
    designation: 'Head – Business Operations & Training Coordinator',
    email:       'aakankshamore.navnirmiti@gmail.com',
    password:    'NavAdmin@2026',
    role:        'admin',
  },
  {
    name:        'Nav Nirmiti Constructions',
    designation: 'Company Account',
    email:       'navnirmiticonstructions@proton.me',
    password:    'NavAdmin@2026',
    role:        'admin',
  },
  {
    name:        'Er. Ramchandra More',
    designation: 'Founder, Owner & Principal Engineer',
    email:       'rammore522@gmail.com',
    password:    'NavAdmin@2026',
    role:        'admin',
  },
];

const setup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Remove ALL existing admin accounts (clean slate)
    const deleted = await User.deleteMany({ role: 'admin' });
    console.log(`Removed ${deleted.deletedCount} existing admin account(s).\n`);

    // Create the 3 new admin accounts
    for (const adminData of ADMINS) {
      const admin = await User.create(adminData);
      console.log(`✅ Created: ${admin.email}`);
      console.log(`   Name:        ${admin.name}`);
      console.log(`   Designation: ${admin.designation}`);
      console.log(`   Password:    ${adminData.password}`);
      console.log('');
    }

    console.log('All 3 admin accounts created successfully.');
    console.log('Login at: http://localhost:3000/admin-login');
    console.log('\nNote: All 3 admins share the same MongoDB database.');
    console.log('Any change made by one admin is instantly visible to the others.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

setup();
