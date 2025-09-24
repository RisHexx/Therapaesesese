const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'therapist', 'admin'],
    default: 'user',
    required: true
  },
  // Additional fields for therapists
  specialization: {
    type: String,
    required: function() {
      return this.role === 'therapist';
    }
  },
  licenseNumber: {
    type: String,
    required: function() {
      return this.role === 'therapist';
    }
  },
  experience: {
    type: Number,
    required: function() {
      return this.role === 'therapist';
    }
  },
  // Profile fields
  phone: {
    type: String,
    match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
  },
  dateOfBirth: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  bannedAt: {
    type: Date
  },
  bannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  banReason: {
    type: String,
    maxlength: [500, 'Ban reason cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) {
    throw new Error('Password not available for comparison. Make sure to select password field.');
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to get user info without sensitive data
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
