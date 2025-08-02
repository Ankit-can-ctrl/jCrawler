const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid token. User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: "Account is deactivated.",
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    logger.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired.",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error in authentication.",
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Don't fail the request, just continue without user
    next();
  }
};

// Admin auth middleware
const adminAuth = async (req, res, next) => {
  try {
    // First check if user is authenticated
    await auth(req, res, (err) => {
      if (err) return next(err);
    });

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin privileges required.",
      });
    }

    next();
  } catch (error) {
    logger.error("Admin auth middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Server error in admin authentication.",
    });
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Verify token without database lookup
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  auth,
  optionalAuth,
  adminAuth,
  generateToken,
  verifyToken,
};
