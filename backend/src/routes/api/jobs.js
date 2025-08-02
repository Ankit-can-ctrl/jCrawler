const express = require("express");
const router = express.Router();
const jobController = require("../../controllers/jobController");
const { auth } = require("../../middleware/auth");
const { validateJobId } = require("../../middleware/validation");
const User = require("../../models/User");
const Job = require("../../models/Job");
const logger = require("../../utils/logger");

// Public routes
router.get("/", jobController.getJobs);
router.get("/stats", jobController.getJobStats);
router.get("/suggestions", jobController.getJobSuggestions);
router.get("/skills/:skills", jobController.getJobsBySkills);
router.get("/remote", jobController.getRemoteJobs);
router.get("/:id", validateJobId, jobController.getJobById);
router.get("/:id/similar", validateJobId, jobController.getSimilarJobs);

// Protected routes (require authentication)
router.post("/search", auth, jobController.searchJobs);

// User-specific job actions
router.post("/:id/save", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    await user.saveJob(id, notes);

    res.json({
      success: true,
      message: "Job saved successfully",
    });
  } catch (error) {
    logger.error("Error saving job:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save job",
      message: error.message,
    });
  }
});

router.delete("/:id/save", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    await user.removeSavedJob(id);

    res.json({
      success: true,
      message: "Job removed from saved list",
    });
  } catch (error) {
    logger.error("Error removing saved job:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove saved job",
      message: error.message,
    });
  }
});

router.post("/:id/apply", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    await user.applyForJob(id, notes);

    // Increment application count on job
    const job = await Job.findById(id);
    if (job) {
      await job.incrementApplications();
    }

    res.json({
      success: true,
      message: "Job application recorded",
    });
  } catch (error) {
    logger.error("Error applying for job:", error);
    res.status(500).json({
      success: false,
      error: "Failed to apply for job",
      message: error.message,
    });
  }
});

router.put("/:id/application-status", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    await user.updateApplicationStatus(id, status, notes);

    res.json({
      success: true,
      message: "Application status updated",
    });
  } catch (error) {
    logger.error("Error updating application status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update application status",
      message: error.message,
    });
  }
});

// Get user's saved jobs
router.get("/user/saved", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(userId).populate({
      path: "savedJobs.job",
      populate: {
        path: "company",
        select: "name industry size rating",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const savedJobs = user.savedJobs
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
      .slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: savedJobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: user.savedJobs.length,
        pages: Math.ceil(user.savedJobs.length / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error("Error fetching saved jobs:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch saved jobs",
      message: error.message,
    });
  }
});

// Get user's applied jobs
router.get("/user/applied", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;

    const user = await User.findById(userId).populate({
      path: "appliedJobs.job",
      populate: {
        path: "company",
        select: "name industry size rating",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    let appliedJobs = user.appliedJobs;

    // Filter by status if provided
    if (status) {
      appliedJobs = appliedJobs.filter((app) => app.status === status);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedJobs = appliedJobs
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
      .slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginatedJobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: appliedJobs.length,
        pages: Math.ceil(appliedJobs.length / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error("Error fetching applied jobs:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch applied jobs",
      message: error.message,
    });
  }
});

// Check if job is saved/applied by current user
router.get("/:id/status", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const isSaved = user.isJobSaved(id);
    const isApplied = user.isJobApplied(id);

    res.json({
      success: true,
      data: {
        isSaved,
        isApplied,
      },
    });
  } catch (error) {
    logger.error("Error checking job status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check job status",
      message: error.message,
    });
  }
});

module.exports = router;
