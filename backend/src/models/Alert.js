const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Alert name is required'],
    trim: true,
    maxlength: [100, 'Alert name cannot exceed 100 characters']
  },
  criteria: {
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    skills: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    locations: [{
      city: String,
      state: String,
      country: String
    }],
    remoteOnly: {
      type: Boolean,
      default: false
    },
    jobTypes: [{
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship']
    }],
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive']
    },
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
    companies: [{
      type: String,
      trim: true
    }],
    excludeKeywords: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  frequency: {
    type: String,
    enum: ['instant', 'daily', 'weekly'],
    default: 'daily'
  },
  notification: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: false
    },
    slack: {
      type: Boolean,
      default: false
    },
    slackWebhook: {
      type: String,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastTriggered: {
    type: Date
  },
  nextTrigger: {
    type: Date
  },
  stats: {
    totalMatches: {
      type: Number,
      default: 0
    },
    lastMatchCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
alertSchema.index({ userId: 1 });
alertSchema.index({ isActive: 1 });
alertSchema.index({ nextTrigger: 1 });
alertSchema.index({ 'criteria.skills': 1 });
alertSchema.index({ 'criteria.keywords': 1 });

// Virtual for criteria summary
alertSchema.virtual('criteriaSummary').get(function() {
  const parts = [];
  
  if (this.criteria.keywords.length > 0) {
    parts.push(`Keywords: ${this.criteria.keywords.join(', ')}`);
  }
  
  if (this.criteria.skills.length > 0) {
    parts.push(`Skills: ${this.criteria.skills.join(', ')}`);
  }
  
  if (this.criteria.locations.length > 0) {
    const locations = this.criteria.locations.map(loc => {
      const parts = [];
      if (loc.city) parts.push(loc.city);
      if (loc.state) parts.push(loc.state);
      if (loc.country) parts.push(loc.country);
      return parts.join(', ');
    });
    parts.push(`Locations: ${locations.join('; ')}`);
  }
  
  if (this.criteria.remoteOnly) {
    parts.push('Remote only');
  }
  
  if (this.criteria.jobTypes.length > 0) {
    parts.push(`Job types: ${this.criteria.jobTypes.join(', ')}`);
  }
  
  return parts.join(' | ');
});

// Instance method to check if alert should be triggered
alertSchema.methods.shouldTrigger = function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  
  switch (this.frequency) {
    case 'instant':
      return true;
    case 'daily':
      if (!this.lastTriggered) return true;
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return this.lastTriggered < dayAgo;
    case 'weekly':
      if (!this.lastTriggered) return true;
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return this.lastTriggered < weekAgo;
    default:
      return false;
  }
};

// Instance method to update trigger time
alertSchema.methods.updateTriggerTime = function() {
  this.lastTriggered = new Date();
  
  // Calculate next trigger time
  const now = new Date();
  switch (this.frequency) {
    case 'instant':
      this.nextTrigger = now;
      break;
    case 'daily':
      this.nextTrigger = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      this.nextTrigger = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
  }
  
  return this.save();
};

// Instance method to increment match count
alertSchema.methods.incrementMatches = function(count = 1) {
  this.stats.totalMatches += count;
  this.stats.lastMatchCount = count;
  return this.save();
};

// Instance method to build search query from criteria
alertSchema.methods.buildSearchQuery = function() {
  const query = {
    isActive: true
  };
  
  // Keywords search
  if (this.criteria.keywords.length > 0) {
    query.$text = { $search: this.criteria.keywords.join(' ') };
  }
  
  // Skills filter
  if (this.criteria.skills.length > 0) {
    query.skills = { $in: this.criteria.skills };
  }
  
  // Location filter
  if (this.criteria.locations.length > 0) {
    const locationQueries = this.criteria.locations.map(loc => {
      const locQuery = {};
      if (loc.city) locQuery['location.city'] = new RegExp(loc.city, 'i');
      if (loc.state) locQuery['location.state'] = new RegExp(loc.state, 'i');
      if (loc.country) locQuery['location.country'] = new RegExp(loc.country, 'i');
      return locQuery;
    });
    query.$or = locationQueries;
  }
  
  // Remote filter
  if (this.criteria.remoteOnly) {
    query['location.remote'] = true;
  }
  
  // Job type filter
  if (this.criteria.jobTypes.length > 0) {
    query['jobType.type'] = { $in: this.criteria.jobTypes };
  }
  
  // Experience level filter
  if (this.criteria.experienceLevel) {
    query['jobType.experience'] = this.criteria.experienceLevel;
  }
  
  // Salary range filter
  if (this.criteria.salaryRange.min || this.criteria.salaryRange.max) {
    if (this.criteria.salaryRange.min && this.criteria.salaryRange.max) {
      query['jobType.salary.min'] = { $gte: this.criteria.salaryRange.min };
      query['jobType.salary.max'] = { $lte: this.criteria.salaryRange.max };
    } else if (this.criteria.salaryRange.min) {
      query['jobType.salary.min'] = { $gte: this.criteria.salaryRange.min };
    } else if (this.criteria.salaryRange.max) {
      query['jobType.salary.max'] = { $lte: this.criteria.salaryRange.max };
    }
  }
  
  // Company filter
  if (this.criteria.companies.length > 0) {
    query['company.name'] = { $in: this.criteria.companies };
  }
  
  // Exclude keywords
  if (this.criteria.excludeKeywords.length > 0) {
    const excludeQueries = this.criteria.excludeKeywords.map(keyword => ({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ]
    }));
    query.$and = excludeQueries.map(q => ({ $not: q }));
  }
  
  return query;
};

// Static method to find active alerts
alertSchema.statics.findActiveAlerts = function() {
  return this.find({
    isActive: true
  }).populate('userId', 'email profile.firstName profile.lastName');
};

// Static method to find alerts by user
alertSchema.statics.findByUser = function(userId) {
  return this.find({
    userId,
    isActive: true
  }).sort({ createdAt: -1 });
};

// Static method to find alerts ready for triggering
alertSchema.statics.findReadyToTrigger = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    $or: [
      { lastTriggered: { $exists: false } },
      { lastTriggered: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }
    ]
  }).populate('userId', 'email profile.firstName profile.lastName');
};

module.exports = mongoose.model('Alert', alertSchema); 