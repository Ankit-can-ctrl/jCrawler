const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  profile: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    skills: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    experience: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
      default: 'mid'
    },
    location: {
      city: String,
      state: String,
      country: String,
      timezone: String
    },
    remotePreference: {
      type: Boolean,
      default: false
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    avatar: {
      type: String,
      trim: true
    }
  },
  preferences: {
    jobTypes: [{
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship']
    }],
    locations: [{
      city: String,
      state: String,
      country: String
    }],
    salaryRange: {
      min: {
        type: Number,
        min: [0, 'Minimum salary cannot be negative']
      },
      max: {
        type: Number,
        min: [0, 'Maximum salary cannot be negative']
      },
      currency: {
        type: String,
        default: 'USD',
        uppercase: true
      }
    },
    skills: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    remoteOnly: {
      type: Boolean,
      default: false
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive']
    }
  },
  savedJobs: [{
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    savedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  }],
  appliedJobs: [{
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['applied', 'interviewing', 'offered', 'rejected', 'withdrawn'],
      default: 'applied'
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  }],
  alerts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'profile.skills': 1 });
userSchema.index({ 'preferences.skills': 1 });
userSchema.index({ isActive: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Virtual for saved jobs count
userSchema.virtual('savedJobsCount').get(function() {
  return this.savedJobs.length;
});

// Virtual for applied jobs count
userSchema.virtual('appliedJobsCount').get(function() {
  return this.appliedJobs.length;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to save a job
userSchema.methods.saveJob = function(jobId, notes = '') {
  const existingIndex = this.savedJobs.findIndex(
    saved => saved.job.toString() === jobId.toString()
  );
  
  if (existingIndex !== -1) {
    // Update existing saved job
    this.savedJobs[existingIndex].notes = notes;
    this.savedJobs[existingIndex].savedAt = new Date();
  } else {
    // Add new saved job
    this.savedJobs.push({
      job: jobId,
      notes,
      savedAt: new Date()
    });
  }
  
  return this.save();
};

// Instance method to remove saved job
userSchema.methods.removeSavedJob = function(jobId) {
  this.savedJobs = this.savedJobs.filter(
    saved => saved.job.toString() !== jobId.toString()
  );
  return this.save();
};

// Instance method to apply for a job
userSchema.methods.applyForJob = function(jobId, notes = '') {
  const existingIndex = this.appliedJobs.findIndex(
    applied => applied.job.toString() === jobId.toString()
  );
  
  if (existingIndex !== -1) {
    // Update existing application
    this.appliedJobs[existingIndex].notes = notes;
    this.appliedJobs[existingIndex].appliedAt = new Date();
  } else {
    // Add new application
    this.appliedJobs.push({
      job: jobId,
      notes,
      appliedAt: new Date(),
      status: 'applied'
    });
  }
  
  return this.save();
};

// Instance method to update application status
userSchema.methods.updateApplicationStatus = function(jobId, status, notes = '') {
  const application = this.appliedJobs.find(
    applied => applied.job.toString() === jobId.toString()
  );
  
  if (application) {
    application.status = status;
    if (notes) application.notes = notes;
    return this.save();
  }
  
  throw new Error('Application not found');
};

// Instance method to check if job is saved
userSchema.methods.isJobSaved = function(jobId) {
  return this.savedJobs.some(
    saved => saved.job.toString() === jobId.toString()
  );
};

// Instance method to check if job is applied
userSchema.methods.isJobApplied = function(jobId) {
  return this.appliedJobs.some(
    applied => applied.job.toString() === jobId.toString()
  );
};

// Static method to find users by skills
userSchema.statics.findBySkills = function(skills, options = {}) {
  return this.find({
    'profile.skills': { $in: skills },
    isActive: true,
    ...options
  });
};

// Static method to find users by location
userSchema.statics.findByLocation = function(location, options = {}) {
  return this.find({
    'profile.location': location,
    isActive: true,
    ...options
  });
};

module.exports = mongoose.model('User', userSchema); 