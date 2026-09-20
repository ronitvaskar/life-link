const express = require("express");

const {
  getUserProfile,
  saveUserProfile,
  updateUserAvailability,
} = require("../controllers/userController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// USER PROFILE
// ======================================================

// GET /api/users/profile
// Get logged-in USER's profile
router.get(
  "/profile",
  authenticateToken,
  authorizeRoles("USER"),
  getUserProfile
);

// ======================================================
// SAVE / CREATE USER PROFILE
// ======================================================

// POST /api/users/profile
// Save blood group, DOB, gender, address, etc.
router.post(
  "/profile",
  authenticateToken,
  authorizeRoles("USER"),
  saveUserProfile
);

// ======================================================
// DONATION AVAILABILITY
// ======================================================

// PUT /api/users/availability
// User can make themselves available/unavailable
// for blood donation.
router.put(
  "/availability",
  authenticateToken,
  authorizeRoles("USER"),
  updateUserAvailability
);

module.exports = router;