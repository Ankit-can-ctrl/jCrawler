require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Import configurations and utilities
const connectDB = require("./src/config/database");
const redisClient = require("./src/config/redis");
const logger = require("./src/utils/logger");

// Import routes
const jobRoutes = require("./src/routes/api/jobs");
const searchRoutes = require("./src/routes/api/search");
const userRoutes = require("./src/routes/api/users");
const alertRoutes = require("./src/routes/api/alerts");
const analyticsRoutes = require("./src/routes/api/analytics");

// Import middleware
const errorHandler = require("./src/middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Rate limiting - DISABLED for development
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
//   message: {
//     success: false,
//     error: "Too many requests from this IP, please try again later.",
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use("/api/", limiter);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
app.use(morgan("combined", { stream: logger.stream }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Job Scraper API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use("/api/jobs", jobRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/users", userRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info("MongoDB connected successfully");

    // Connect to Redis
    await redisClient.connect();
    logger.info("Redis connected successfully");

    // Start the server
    app.listen(PORT, () => {
      logger.info(
        `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
      );
      logger.info(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

startServer();
