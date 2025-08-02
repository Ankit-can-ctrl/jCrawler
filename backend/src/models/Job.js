const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [255, 'Job title cannot exceed 255 characters']
  },
  company: {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [255, 'Company name cannot exceed 255 characters']
    },
    industry: {
      type: String,
      trim: true
    },
    size: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
      default: 'medium'
    },
    location: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    }
  },
  location: {
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    remote: {
      type: Boolean,
      default: false
    },
    timezone: {
      type: String,
      trim: true
    }
  },
  jobType: {
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
      required: [true, 'Job type is required']
    },
    experience: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
      default: 'mid'
    },
    salary: {
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
      },
      period: {
        type: String,
        enum: ['hourly', 'monthly', 'yearly'],
        default: 'yearly'
      }
    }
  },
  skills: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [10000, 'Job description cannot exceed 10000 characters']
  },
  requirements: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  url: {
    type: String,
    required: [true, 'Job URL is required'],
    trim: true
  },
  sourceSite: {
    type: String,
    required: [true, 'Source site is required'],
    trim: true,
    lowercase: true
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  scrapedDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative']
    },
    applications: {
      type: Number,
      default: 0,
      min: [0, 'Applications cannot be negative']
    },
    savedCount: {
      type: Number,
      default: 0,
      min: [0, 'Saved count cannot be negative']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ 'company.name': 1 });
jobSchema.index({ 'location.city': 1, 'location.country': 1 });
jobSchema.index({ 'location.remote': 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ sourceSite: 1 });
jobSchema.index({ postedDate: -1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ 'jobType.salary.min': 1, 'jobType.salary.max': 1 });

// Virtual for full location
jobSchema.virtual('fullLocation').get(function() {
  const parts = [];
  if (this.location.city) parts.push(this.location.city);
  if (this.location.state) parts.push(this.location.state);
  if (this.location.country) parts.push(this.location.country);
  return parts.join(', ');
});

// Virtual for salary range
jobSchema.virtual('salaryRange').get(function() {
  if (!this.jobType.salary.min && !this.jobType.salary.max) return null;
  
  const min = this.jobType.salary.min;
  const max = this.jobType.salary.max;
  const currency = this.jobType.salary.currency;
  const period = this.jobType.salary.period;
  
  if (min && max) {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} ${period}`;
  } else if (min) {
    return `${currency} ${min.toLocaleString()}+ ${period}`;
  } else if (max) {
    return `Up to ${currency} ${max.toLocaleString()} ${period}`;
  }
  
  return null;
});

// Instance method to increment views
jobSchema.methods.incrementViews = function() {
  this.metadata.views += 1;
  return this.save();
};

// Instance method to increment applications
jobSchema.methods.incrementApplications = function() {
  this.metadata.applications += 1;
  return this.save();
};

// Instance method to increment saved count
jobSchema.methods.incrementSavedCount = function() {
  this.metadata.savedCount += 1;
  return this.save();
};

// Static method to find jobs by skills
jobSchema.statics.findBySkills = function(skills, options = {}) {
  return this.find({
    skills: { $in: skills },
    isActive: true,
    ...options
  });
};

// Static method to find remote jobs
jobSchema.statics.findRemoteJobs = function(options = {}) {
  return this.find({
    'location.remote': true,
    isActive: true,
    ...options
  });
};

// Static method to find jobs by salary range
jobSchema.statics.findBySalaryRange = function(minSalary, maxSalary, options = {}) {
  const query = {
    isActive: true,
    ...options
  };

  if (minSalary && maxSalary) {
    query['jobType.salary.min'] = { $gte: minSalary };
    query['jobType.salary.max'] = { $lte: maxSalary };
  } else if (minSalary) {
    query['jobType.salary.min'] = { $gte: minSalary };
  } else if (maxSalary) {
    query['jobType.salary.max'] = { $lte: maxSalary };
  }

  return this.find(query);
};

// Pre-save middleware to update scraped date
jobSchema.pre('save', function(next) {
  if (this.isNew) {
    this.scrapedDate = new Date();
  }
  next();
});

module.exports = mongoose.model('Job', jobSchema); 