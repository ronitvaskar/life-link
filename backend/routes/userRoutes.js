const express = require("express");

const {
  getCurrentUser,
  updateCurrentUser,
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
// CURRENT USER
// ======================================================

// GET /api/users/me
// Get logged-in USER details
router.get(
  "/me",
  authenticateToken,
  getCurrentUser
);

// ======================================================
// UPDATE CURRENT USER
// ======================================================

// PUT /api/users/me
// Update logged-in USER details
router.put(
  "/me",
  authenticateToken,
  updateCurrentUser
);

// ======================================================
// USER PROFILE
// ======================================================

// GET /api/users/profile
// Get logged-in USER's blood donation profile
router.get(
  "/profile",
  authenticateToken,
  authorizeRoles("USER"),
  getUserProfile
);

// ======================================================
// SAVE USER PROFILE
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
// Make the USER available/unavailable for donation
router.put(
  "/availability",
  authenticateToken,
  authorizeRoles("USER"),
  updateUserAvailability
);

module.exports = router;