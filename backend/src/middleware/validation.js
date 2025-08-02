const { body, param, query, validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

// Validate MongoDB ObjectId
const validateObjectId = (paramName) => {
  return param(paramName)
    .isMongoId()
    .withMessage(`${paramName} must be a valid MongoDB ObjectId`);
};

// Validate job ID
const validateJobId = [validateObjectId("id"), handleValidationErrors];

// Validate user ID
const validateUserId = [validateObjectId("id"), handleValidationErrors];

// Validate alert ID
const validateAlertId = [validateObjectId("id"), handleValidationErrors];

// Job search validation
const validateJobSearch = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("keywords")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Keywords must be at least 2 characters long"),
  query("skills").optional().isArray().withMessage("Skills must be an array"),
  query("location")
    .optional()
    .isString()
    .trim()
    .withMessage("Location must be a string"),
  query("remote")
    .optional()
    .isBoolean()
    .withMessage("Remote must be a boolean"),
  query("jobType")
    .optional()
    .isIn(["full-time", "part-time", "contract", "freelance", "internship"])
    .withMessage("Invalid job type"),
  query("experience")
    .optional()
    .isIn(["entry", "mid", "senior", "lead", "executive"])
    .withMessage("Invalid experience level"),
  query("salaryMin")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Minimum salary must be a positive number"),
  query("salaryMax")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Maximum salary must be a positive number"),
  query("company")
    .optional()
    .isString()
    .trim()
    .withMessage("Company must be a string"),
  query("sourceSite")
    .optional()
    .isString()
    .trim()
    .withMessage("Source site must be a string"),
  query("postedAfter")
    .optional()
    .isISO8601()
    .withMessage("Posted after must be a valid date"),
  query("sortBy")
    .optional()
    .isIn([
      "postedDate",
      "title",
      "company.name",
      "location.city",
      "jobType.salary.min",
    ])
    .withMessage("Invalid sort field"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
  handleValidationErrors,
];

// User registration validation
const validateUserRegistration = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  body("profile.firstName")
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("profile.lastName")
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("profile.skills")
    .optional()
    .isArray()
    .withMessage("Skills must be an array"),
  body("profile.experience")
    .optional()
    .isIn(["entry", "mid", "senior", "lead", "executive"])
    .withMessage("Invalid experience level"),
  body("profile.location.city")
    .optional()
    .isString()
    .trim()
    .withMessage("City must be a string"),
  body("profile.location.state")
    .optional()
    .isString()
    .trim()
    .withMessage("State must be a string"),
  body("profile.location.country")
    .optional()
    .isString()
    .trim()
    .withMessage("Country must be a string"),
  body("profile.remotePreference")
    .optional()
    .isBoolean()
    .withMessage("Remote preference must be a boolean"),
  body("profile.bio")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio must not exceed 500 characters"),
  handleValidationErrors,
];

// User login validation
const validateUserLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Alert creation validation
const validateAlertCreation = [
  body("name")
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Alert name must be between 2 and 100 characters"),
  body("criteria.keywords")
    .optional()
    .isArray()
    .withMessage("Keywords must be an array"),
  body("criteria.skills")
    .optional()
    .isArray()
    .withMessage("Skills must be an array"),
  body("criteria.locations")
    .optional()
    .isArray()
    .withMessage("Locations must be an array"),
  body("criteria.remoteOnly")
    .optional()
    .isBoolean()
    .withMessage("Remote only must be a boolean"),
  body("criteria.jobTypes")
    .optional()
    .isArray()
    .withMessage("Job types must be an array"),
  body("criteria.experienceLevel")
    .optional()
    .isIn(["entry", "mid", "senior", "lead", "executive"])
    .withMessage("Invalid experience level"),
  body("criteria.salaryRange.min")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Minimum salary must be a positive number"),
  body("criteria.salaryRange.max")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Maximum salary must be a positive number"),
  body("criteria.companies")
    .optional()
    .isArray()
    .withMessage("Companies must be an array"),
  body("criteria.excludeKeywords")
    .optional()
    .isArray()
    .withMessage("Exclude keywords must be an array"),
  body("frequency")
    .isIn(["instant", "daily", "weekly"])
    .withMessage("Frequency must be instant, daily, or weekly"),
  body("notification.email")
    .optional()
    .isBoolean()
    .withMessage("Email notification must be a boolean"),
  body("notification.push")
    .optional()
    .isBoolean()
    .withMessage("Push notification must be a boolean"),
  body("notification.slack")
    .optional()
    .isBoolean()
    .withMessage("Slack notification must be a boolean"),
  body("notification.slackWebhook")
    .optional()
    .isURL()
    .withMessage("Slack webhook must be a valid URL"),
  handleValidationErrors,
];

// Job save/apply validation
const validateJobAction = [
  validateObjectId("id"),
  body("notes")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters"),
  handleValidationErrors,
];

// Application status update validation
const validateApplicationStatus = [
  validateObjectId("id"),
  body("status")
    .isIn(["applied", "interviewing", "offered", "rejected", "withdrawn"])
    .withMessage("Invalid application status"),
  body("notes")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters"),
  handleValidationErrors,
];

// Pagination validation
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  handleValidationErrors,
];

// Search query validation
const validateSearchQuery = [
  body("keywords")
    .optional()
    .isArray()
    .withMessage("Keywords must be an array"),
  body("skills").optional().isArray().withMessage("Skills must be an array"),
  body("locations")
    .optional()
    .isArray()
    .withMessage("Locations must be an array"),
  body("remote").optional().isBoolean().withMessage("Remote must be a boolean"),
  body("jobTypes")
    .optional()
    .isArray()
    .withMessage("Job types must be an array"),
  body("experience")
    .optional()
    .isIn(["entry", "mid", "senior", "lead", "executive"])
    .withMessage("Invalid experience level"),
  body("salaryRange.min")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Minimum salary must be a positive number"),
  body("salaryRange.max")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Maximum salary must be a positive number"),
  body("companies")
    .optional()
    .isArray()
    .withMessage("Companies must be an array"),
  body("excludeKeywords")
    .optional()
    .isArray()
    .withMessage("Exclude keywords must be an array"),
  body("postedAfter")
    .optional()
    .isISO8601()
    .withMessage("Posted after must be a valid date"),
  body("sortBy")
    .optional()
    .isIn([
      "postedDate",
      "title",
      "company.name",
      "location.city",
      "jobType.salary.min",
    ])
    .withMessage("Invalid sort field"),
  body("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateObjectId,
  validateJobId,
  validateUserId,
  validateAlertId,
  validateJobSearch,
  validateUserRegistration,
  validateUserLogin,
  validateAlertCreation,
  validateJobAction,
  validateApplicationStatus,
  validatePagination,
  validateSearchQuery,
};
