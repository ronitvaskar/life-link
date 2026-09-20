const express = require("express");

const {
  getActiveBloodBanks,
  getBloodBankProfile,
  updateBloodBankProfile,
} = require("../controllers/bloodBankController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// USER - VIEW ACTIVE BLOOD BANKS
// ======================================================

// GET /api/blood-banks
// USER can view active blood banks when scheduling a donation

router.get(
  "/",
  authenticateToken,
  authorizeRoles("USER"),
  getActiveBloodBanks
);

// ======================================================
// BLOOD BANK - PROFILE
// ======================================================

// GET /api/blood-banks/profile
// Logged-in blood bank views its own profile

router.get(
  "/profile",
  authenticateToken,
  authorizeRoles("BLOOD_BANK"),
  getBloodBankProfile
);

// ======================================================
// BLOOD BANK - UPDATE PROFILE
// ======================================================

// PUT /api/blood-banks/profile
// Logged-in blood bank updates its own profile

router.put(
  "/profile",
  authenticateToken,
  authorizeRoles("BLOOD_BANK"),
  updateBloodBankProfile
);

module.exports = router;