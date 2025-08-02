const express = require("express");
const router = express.Router();

// Placeholder analytics routes
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Analytics endpoint - to be implemented",
  });
});

module.exports = router;
