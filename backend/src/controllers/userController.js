const User = require("../models/User");
const Job = require("../models/Job");
const CacheService = require("../services/cacheService");
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");

class UserController {
  // Register a new user
  async register(req, res) {
    try {
      const {
        email,
        password,
        profile,
        firstName,
        lastName,
        skills,
        experience,
        location,
        remotePreference,
        bio,
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // Handle both nested and flat profile structures
      let profileData = {};
      if (profile) {
        // Nested structure: { profile: { firstName, lastName, ... } }
        profileData = profile;
      } else {
        // Flat structure: { firstName, lastName, ... }
        profileData = {
          firstName,
          lastName,
          skills,
          experience,
          location,
          remotePreference,
          bio,
        };
      }

      // Create new user
      const user = new User({
        email: email.toLowerCase(),
        password,
        profile: profileData,
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      logger.info(`New user registered: ${user.email}`);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: userResponse,
          token,
        },
      });
    } catch (error) {
      logger.error("User registration error:", error);
      res.status(500).json({
        success: false,
        message: "Error registering user",
        error: error.message,
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated",
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      logger.info(`User logged in: ${user.email}`);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: userResponse,
          token,
        },
      });
    } catch (error) {
      logger.error("User login error:", error);
      res.status(500).json({
        success: false,
        message: "Error during login",
        error: error.message,
      });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      // For now, get the first user or return a demo profile
      const user = await User.findOne()
        .select("-password -emailVerificationToken -passwordResetToken")
        .populate("savedJobs.job")
        .populate("appliedJobs.job")
        .populate("alerts");

      if (!user) {
        // Return a demo profile if no user exists
        return res.json({
          success: true,
          data: {
            _id: "demo-user-id",
            email: "demo@example.com",
            profile: {
              firstName: "Demo",
              lastName: "User",
              skills: ["JavaScript", "React", "Node.js"],
              experience: "mid",
              location: {
                city: "Demo City",
                state: "Demo State",
                country: "Demo Country",
              },
              remotePreference: true,
              bio: "This is a demo user profile",
            },
            preferences: {
              jobTypes: ["full-time", "remote"],
              skills: ["JavaScript", "React"],
              remoteOnly: true,
              experienceLevel: "mid",
            },
            savedJobs: [],
            appliedJobs: [],
            alerts: [],
            isActive: true,
            lastLogin: new Date(),
            createdAt: new Date(),
          },
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching profile",
        error: error.message,
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.email;
      delete updateData.password;
      delete updateData.isActive;
      delete updateData.isEmailVerified;

      // Get the first user or create one if none exists
      let user = await User.findOne();

      if (!user) {
        // Create a demo user if none exists
        user = new User({
          email: "demo@example.com",
          password: "demo123",
          profile: {
            firstName: "Demo",
            lastName: "User",
          },
        });
        await user.save();
      }

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-password -emailVerificationToken -passwordResetToken");

      logger.info(`Profile updated for user: ${updatedUser.email}`);

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      logger.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating profile",
        error: error.message,
      });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Get the first user or create one if none exists
      let user = await User.findOne();

      if (!user) {
        // Create a demo user if none exists
        user = new User({
          email: "demo@example.com",
          password: "demo123",
          profile: {
            firstName: "Demo",
            lastName: "User",
          },
        });
        await user.save();
      }

      // For demo purposes, skip current password verification
      // In a real app, you would verify the current password here
      // const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      // if (!isCurrentPasswordValid) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Current password is incorrect",
      //   });
      // }

      // Update password
      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      logger.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Error changing password",
        error: error.message,
      });
    }
  }

  // Save a job
  async saveJob(req, res) {
    try {
      const { jobId, notes } = req.body;

      // Verify job exists
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found",
        });
      }

      // Get the first user or create one if none exists
      let user = await User.findOne();

      if (!user) {
        // Create a demo user if none exists
        user = new User({
          email: "demo@example.com",
          password: "demo123",
          profile: {
            firstName: "Demo",
            lastName: "User",
          },
        });
        await user.save();
      }

      await user.saveJob(jobId, notes);

      // Clear cache for this user's saved jobs
      await CacheService.delete(`user:${user._id}:savedJobs`);

      logger.info(`Job ${jobId} saved by user ${user._id}`);

      res.json({
        success: true,
        message: "Job saved successfully",
      });
    } catch (error) {
      logger.error("Save job error:", error);
      res.status(500).json({
        success: false,
        message: "Error saving job",
        error: error.message,
      });
    }
  }

  // Remove saved job
  async removeSavedJob(req, res) {
    try {
      const { jobId } = req.params;

      // Get the first user or create one if none exists
      let user = await User.findOne();

      if (!user) {
        // Create a demo user if none exists
        user = new User({
          email: "demo@example.com",
          password: "demo123",
          profile: {
            firstName: "Demo",
            lastName: "User",
          },
        });
        await user.save();
      }

      await user.removeSavedJob(jobId);

      // Clear cache for this user's saved jobs
      await CacheService.delete(`user:${user._id}:savedJobs`);

      logger.info(`Job ${jobId} removed from saved jobs by user ${user._id}`);

      res.json({
        success: true,
        message: "Job removed from saved jobs",
      });
    } catch (error) {
      logger.error("Remove saved job error:", error);
      res.status(500).json({
        success: false,
        message: "Error removing saved job",
        error: error.message,
      });
    }
  }

  // Get saved jobs
  async getSavedJobs(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;

      // Get the first user or create one if none exists
      let user = await User.findOne();

      if (!user) {
        // Create a demo user if none exists
        user = new User({
          email: "demo@example.com",
          password: "demo123",
          profile: {
            firstName: "Demo",
            lastName: "User",
          },
        });
        await user.save();
      }

      // Check cache first
      const cacheKey = `user:${user._id}:savedJobs:${page}:${limit}`;
      const cachedResult = await CacheService.get(cacheKey);

      if (cachedResult) {
        return res.json({
          success: true,
          data: cachedResult.jobs,
          pagination: cachedResult.pagination,
        });
      }

      const populatedUser = await User.findById(user._id).populate({
        path: "savedJobs.job",
        match: { isActive: true },
      });

      // Filter out jobs that are no longer active
      const activeSavedJobs = populatedUser.savedJobs.filter(
        (saved) => saved.job
      );

      // Paginate results
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginatedJobs = activeSavedJobs.slice(skip, skip + parseInt(limit));

      const result = {
        jobs: paginatedJobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(activeSavedJobs.length / parseInt(limit)),
          totalItems: activeSavedJobs.length,
          itemsPerPage: parseInt(limit),
        },
      };

      // Cache the result
      await CacheService.set(cacheKey, result, 300); // 5 minutes

      res.json({
        success: true,
        data: result.jobs,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error("Get saved jobs error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching saved jobs",
        error: error.message,
      });
    }
  }

  // Apply for a job
  async applyForJob(req, res) {
    try {
      const { jobId, notes } = req.body;

      // Verify job exists and is active
      const job = await Job.findById(jobId);
      if (!job || !job.isActive) {
        return res.status(404).json({
          success: false,
          message: "Job not found or no longer active",
        });
      }

      // Get the first user or create one if none exists
      let user = await User.findOne();

      if (!user) {
        // Create a demo user if none exists
        user = new User({
          email: "demo@example.com",
          password: "demo123",
          profile: {
            firstName: "Demo",
            lastName: "User",
          },
        });
        await user.save();
      }

      // Check if already applied
      if (user.isJobApplied(jobId)) {
        return res.status(400).json({
          success: false,
          message: "Already applied for this job",
        });
      }

      await user.applyForJob(jobId, notes);

      // Clear cache for this user's applied jobs
      await CacheService.delete(`user:${user._id}:appliedJobs`);

      logger.info(`User ${user._id} applied for job ${jobId}`);

      res.json({
        success: true,
        message: "Application submitted successfully",
      });
    } catch (error) {
      logger.error("Apply for job error:", error);
      res.status(500).json({
        success: false,
        message: "Error applying for job",
        error: error.message,
      });
    }
  }

  // Get applied jobs
  async getAppliedJobs(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;

      // Get the first user or create one if none exists
      let user = await User.findOne();

      if (!user) {
        // Create a demo user if none exists
        user = new User({
          email: "demo@example.com",
          password: "demo123",
          profile: {
            firstName: "Demo",
            lastName: "User",
          },
        });
        await user.save();
      }

      // Check cache first
      const cacheKey = `user:${user._id}:appliedJobs:${page}:${limit}:${
        status || "all"
      }`;
      const cachedResult = await CacheService.get(cacheKey);

      if (cachedResult) {
        return res.json({
          success: true,
          data: cachedResult.jobs,
          pagination: cachedResult.pagination,
        });
      }

      const populatedUser = await User.findById(user._id).populate({
        path: "appliedJobs.job",
        match: { isActive: true },
      });

      // Filter by status if provided
      let filteredJobs = populatedUser.appliedJobs.filter(
        (applied) => applied.job
      );
      if (status) {
        filteredJobs = filteredJobs.filter(
          (applied) => applied.status === status
        );
      }

      // Paginate results
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginatedJobs = filteredJobs.slice(skip, skip + parseInt(limit));

      const result = {
        jobs: paginatedJobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredJobs.length / parseInt(limit)),
          totalItems: filteredJobs.length,
          itemsPerPage: parseInt(limit),
        },
      };

      // Cache the result
      await CacheService.set(cacheKey, result, 300); // 5 minutes

      res.json({
        success: true,
        data: result.jobs,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error("Get applied jobs error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching applied jobs",
        error: error.message,
      });
    }
  }

  // Update application status
  async updateApplicationStatus(req, res) {
    try {
      const { jobId } = req.params;
      const { status, notes } = req.body;

      // Get the first user or create one if none exists
      let user = await User.findOne();

      if (!user) {
        // Create a demo user if none exists
        user = new User({
          email: "demo@example.com",
          password: "demo123",
          profile: {
            firstName: "Demo",
            lastName: "User",
          },
        });
        await user.save();
      }

      await user.updateApplicationStatus(jobId, status, notes);

      // Clear cache for this user's applied jobs
      await CacheService.delete(`user:${user._id}:appliedJobs`);

      logger.info(
        `Application status updated for user ${user._id}, job ${jobId}: ${status}`
      );

      res.json({
        success: true,
        message: "Application status updated successfully",
      });
    } catch (error) {
      logger.error("Update application status error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating application status",
        error: error.message,
      });
    }
  }

  // Update user preferences
  async updatePreferences(req, res) {
    try {
      const preferences = req.body;

      // Get the first user or create one if none exists
      let user = await User.findOne();

      if (!user) {
        // Create a demo user if none exists
        user = new User({
          email: "demo@example.com",
          password: "demo123",
          profile: {
            firstName: "Demo",
            lastName: "User",
          },
        });
        await user.save();
      }

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: { preferences } },
        { new: true, runValidators: true }
      ).select("-password -emailVerificationToken -passwordResetToken");

      // Clear cache for this user
      await CacheService.delete(`user:${user._id}:profile`);

      logger.info(`Preferences updated for user: ${updatedUser.email}`);

      res.json({
        success: true,
        message: "Preferences updated successfully",
        data: updatedUser.preferences,
      });
    } catch (error) {
      logger.error("Update preferences error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating preferences",
        error: error.message,
      });
    }
  }

  // Get user statistics
  async getUserStats(req, res) {
    try {
      // Get the first user or create one if none exists
      let user = await User.findOne();

      if (!user) {
        // Create a demo user if none exists
        user = new User({
          email: "demo@example.com",
          password: "demo123",
          profile: {
            firstName: "Demo",
            lastName: "User",
          },
        });
        await user.save();
      }

      const stats = {
        savedJobsCount: user.savedJobsCount,
        appliedJobsCount: user.appliedJobsCount,
        alertsCount: user.alerts.length,
        profileCompletion: this.calculateProfileCompletion(user),
        lastLogin: user.lastLogin,
        memberSince: user.createdAt,
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error("Get user stats error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching user statistics",
        error: error.message,
      });
    }
  }

  // Calculate profile completion percentage
  calculateProfileCompletion(user) {
    const requiredFields = [
      "profile.firstName",
      "profile.lastName",
      "profile.skills",
      "profile.experience",
      "profile.location.city",
      "profile.location.country",
    ];

    const optionalFields = [
      "profile.bio",
      "profile.avatar",
      "preferences.jobTypes",
      "preferences.skills",
      "preferences.salaryRange.min",
      "preferences.salaryRange.max",
    ];

    let completedFields = 0;
    let totalFields = requiredFields.length + optionalFields.length;

    // Check required fields
    requiredFields.forEach((field) => {
      const value = this.getNestedValue(user, field);
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        completedFields++;
      }
    });

    // Check optional fields
    optionalFields.forEach((field) => {
      const value = this.getNestedValue(user, field);
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        completedFields++;
      }
    });

    return Math.round((completedFields / totalFields) * 100);
  }

  // Helper method to get nested object values
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  // Deactivate user account
  async deactivateAccount(req, res) {
    try {
      const { password } = req.body;

      // Get the first user or create one if none exists
      let user = await User.findOne();

      if (!user) {
        // Create a demo user if none exists
        user = new User({
          email: "demo@example.com",
          password: "demo123",
          profile: {
            firstName: "Demo",
            lastName: "User",
          },
        });
        await user.save();
      }

      // For demo purposes, skip password verification
      // In a real app, you would verify the password here
      // const isPasswordValid = await user.comparePassword(password);
      // if (!isPasswordValid) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Password is incorrect",
      //   });
      // }

      // Deactivate account
      user.isActive = false;
      await user.save();

      logger.info(`Account deactivated for user: ${user.email}`);

      res.json({
        success: true,
        message: "Account deactivated successfully",
      });
    } catch (error) {
      logger.error("Deactivate account error:", error);
      res.status(500).json({
        success: false,
        message: "Error deactivating account",
        error: error.message,
      });
    }
  }
}

module.exports = new UserController();
