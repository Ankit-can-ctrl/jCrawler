const express = require("express");
const router = express.Router();

// Placeholder alert routes
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Alerts endpoint - to be implemented",
  });
});

module.exports = router;
