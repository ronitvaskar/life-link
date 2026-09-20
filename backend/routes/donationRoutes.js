const express = require("express");

const {
  createDonation,
  completeDonation,
  getBloodBankDonations,
  getMyDonations,
} = require("../controllers/donationController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// USER - CREATE DONATION
// ======================================================

// POST /api/donations
// USER creates a blood donation record
router.post(
  "/",
  authenticateToken,
  authorizeRoles("USER"),
  createDonation
);

// ======================================================
// USER - MY DONATIONS
// ======================================================

// GET /api/donations/my
// Get donations made by logged-in USER
router.get(
  "/my",
  authenticateToken,
  authorizeRoles("USER"),
  getMyDonations
);

// ======================================================
// BLOOD BANK / ADMIN - VIEW DONATIONS
// ======================================================

// GET /api/donations/blood-bank
// Blood bank and admin can view donations
router.get(
  "/blood-bank",
  authenticateToken,
  authorizeRoles("BLOOD_BANK", "ADMIN"),
  getBloodBankDonations
);

// ======================================================
// BLOOD BANK / ADMIN - COMPLETE DONATION
// ======================================================

// PUT /api/donations/:donation_id/complete
// Blood bank or admin completes a donation
router.put(
  "/:donation_id/complete",
  authenticateToken,
  authorizeRoles("BLOOD_BANK", "ADMIN"),
  completeDonation
);

module.exports = router;