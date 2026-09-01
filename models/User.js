const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'student', 'employee', 'client'],
    default: 'user'
  },
  // Client specific fields
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  // Student specific fields
  mobileNumber: {
    type: String,
    trim: true
  },
  collegeName: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  courseName: {
    type: String,
    trim: true
  },
  rollNumber: {
    type: String,
    trim: true
  },
  // Employee specific fields
  sector: {
    type: String,
    trim: true
  },
  services: {
    type: String,
    trim: true
  },
  // Profile photo — filename stored in /uploads/
  profilePhoto: {
    type: String,
    default: null
  },
  // Admin designation / title shown in the admin portal sidebar
  designation: {
    type: String,
    trim: true,
    default: null
  },
  // Client account approval (clients must be approved by admin before login)
  isApproved: {
    type: Boolean,
    default: true   // students/others approved immediately; clients start as false via clientController
  },
  // Payment screenshot for client registration
  paymentScreenshot: {
    type: String,
    default: null
  },
  // Training progress tracking
  trainingProgress: [{
    module: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started'
    },
    completedAt: {
      type: Date
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  // File uploads for employees
  uploadedFiles: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);