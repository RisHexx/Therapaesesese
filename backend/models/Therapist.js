const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Contact message cannot be more than 1000 characters']
  },
  contactInfo: {
    email: String,
    phone: String,
    preferredMethod: {
      type: String,
      enum: ['email', 'phone', 'both'],
      default: 'email'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'responded'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const therapistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  verified: {
    type: Boolean,
    default: false,
    index: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  // Professional Information
  specialization: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one specialization is required'
    }
  },
  licenseNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  experience: {
    type: Number,
    required: true,
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years']
  },
  education: {
    degree: String,
    institution: String,
    year: Number
  },
  certifications: [{
    name: String,
    issuer: String,
    year: Number
  }],
  // Contact Information
  contactInfo: {
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      street: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    website: String,
    socialMedia: {
      linkedin: String,
      twitter: String
    }
  },
  // Practice Information
  practiceInfo: {
    name: String,
    type: {
      type: String,
      enum: ['private', 'clinic', 'hospital', 'online'],
      default: 'private'
    },
    acceptsInsurance: {
      type: Boolean,
      default: false
    },
    sessionTypes: [{
      type: String,
      enum: ['individual', 'group', 'family', 'couples']
    }],
    languages: [{
      type: String,
      default: ['English']
    }],
    availability: {
      days: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }],
      hours: {
        start: String, // e.g., "09:00"
        end: String    // e.g., "17:00"
      }
    }
  },
  // Ratings and Reviews (for future implementation)
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  // Contact Requests
  contactRequests: [contactRequestSchema],
  // Profile
  bio: {
    type: String,
    maxlength: [2000, 'Bio cannot be more than 2000 characters']
  },
  profileImage: {
    type: String // URL to profile image
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
therapistSchema.index({ verified: 1, isActive: 1 });
therapistSchema.index({ 'specialization': 1 });
therapistSchema.index({ 'contactInfo.email': 1 });

// Virtual for full name (from User model)
therapistSchema.virtual('fullName').get(function() {
  return this.userId ? this.userId.name : 'Unknown';
});

// Instance method to add contact request
therapistSchema.methods.addContactRequest = function(userId, message, contactInfo) {
  // Check if user already has a pending request
  const existingRequest = this.contactRequests.find(
    req => req.userId.toString() === userId.toString() && req.status === 'pending'
  );
  
  if (existingRequest) {
    throw new Error('You already have a pending contact request with this therapist');
  }
  
  this.contactRequests.push({
    userId,
    message,
    contactInfo
  });
  
  return this.save();
};

// Instance method to update contact request status
therapistSchema.methods.updateContactRequestStatus = function(requestId, status) {
  const request = this.contactRequests.id(requestId);
  if (!request) {
    throw new Error('Contact request not found');
  }
  
  request.status = status;
  return this.save();
};

// Static method to get verified therapists with filters
therapistSchema.statics.getVerifiedTherapists = function(filters = {}, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const query = { verified: true, isActive: true };
  
  // Add specialization filter
  if (filters.specialization) {
    query.specialization = { $in: [filters.specialization] };
  }
  
  
  return this.find(query)
    .populate('userId', 'name email role')
    .sort({ 'rating.average': -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get pending therapist verifications (admin only)
therapistSchema.statics.getPendingVerifications = function() {
  // Get only therapists with pending verification status
  return this.find({ 
    verificationStatus: 'pending',
    verified: false
  })
    .populate('userId', 'name email role createdAt')
    .sort({ createdAt: 1 });
};

// Instance method to verify therapist (admin only)
therapistSchema.methods.verify = function(adminId, approved = true, rejectionReason = null) {
  this.verified = approved;
  this.verificationStatus = approved ? 'approved' : 'rejected';
  this.verifiedBy = adminId;
  this.verifiedAt = new Date();
  
  if (!approved && rejectionReason) {
    this.rejectionReason = rejectionReason;
  }
  
  return this.save();
};

// Transform function to hide sensitive info for public listings
therapistSchema.methods.toPublicJSON = function() {
  const therapistObject = this.toObject();
  
  // Remove sensitive information for public view
  delete therapistObject.contactRequests;
  delete therapistObject.licenseNumber;
  delete therapistObject.verifiedBy;
  delete therapistObject.rejectionReason;
  
  // Only show basic contact info
  if (therapistObject.contactInfo) {
    therapistObject.contactInfo = {
      email: therapistObject.contactInfo.email,
      phone: therapistObject.contactInfo.phone,
      address: {
        state: therapistObject.contactInfo.address?.state
      }
    };
  }
  
  return therapistObject;
};

module.exports = mongoose.model('Therapist', therapistSchema);
