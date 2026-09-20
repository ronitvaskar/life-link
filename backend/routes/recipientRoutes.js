const express = require("express");

const {
  getUserProfile,
  saveUserProfile,
} = require("../controllers/userController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get USER profile
router.get(
  "/profile",
  authenticateToken,
  authorizeRoles("USER"),
  getUserProfile
);

// Create / update USER profile
router.post(
  "/profile",
  authenticateToken,
  authorizeRoles("USER"),
  saveUserProfile
);

module.exports = router;