const express = require("express");
const router = express.Router();

// Placeholder user routes
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Users endpoint - to be implemented",
  });
});

module.exports = router;
