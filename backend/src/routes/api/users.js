const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const validation = require("../../middleware/validation");

// All routes are now public (no authentication required)
router.post("/register", validation.validateRegistrationFlat, userController.register);
router.post("/login", validation.validateLogin, userController.login);

// Profile management
router.get("/profile", userController.getProfile);
router.put("/profile", validation.validateProfileUpdate, userController.updateProfile);
router.put("/password", validation.validatePasswordChange, userController.changePassword);

// Job management
router.post("/jobs/save", validation.validateJobAction, userController.saveJob);
router.delete("/jobs/save/:jobId", userController.removeSavedJob);
router.get("/jobs/saved", userController.getSavedJobs);
router.post("/jobs/apply", validation.validateJobAction, userController.applyForJob);
router.get("/jobs/applied", userController.getAppliedJobs);
router.put("/jobs/applied/:jobId/status", validation.validateApplicationStatus, userController.updateApplicationStatus);

// Preferences and settings
router.put("/preferences", validation.validatePreferences, userController.updatePreferences);
router.get("/stats", userController.getUserStats);

// Account management
router.post("/deactivate", validation.validatePassword, userController.deactivateAccount);

module.exports = router;
