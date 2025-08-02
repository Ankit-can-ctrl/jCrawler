const express = require("express");
const router = express.Router();

// Placeholder search routes
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Search endpoint - to be implemented",
  });
});

module.exports = router;
