const express = require("express");

const {
  createBloodRequest,
  getMyBloodRequests,
  getCompatibleDonors,
  getBloodRequestById,
  cancelBloodRequest,
  getDonorMatchingRequests,
  respondToBloodRequest,
  getBloodRequestResponses,
  fulfillBloodRequest,
  getBloodBankRequests,
} = require("../controllers/bloodRequestController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// USER - CREATE BLOOD REQUEST
// ======================================================

// POST /api/blood-requests
// USER creates a blood request
router.post(
  "/",
  authenticateToken,
  authorizeRoles("USER"),
  createBloodRequest
);

// ======================================================
// USER - MY BLOOD REQUESTS
// ======================================================

// GET /api/blood-requests/my
// Get blood requests created by logged-in USER
router.get(
  "/my",
  authenticateToken,
  authorizeRoles("USER"),
  getMyBloodRequests
);

// ======================================================
// USER - MATCHING BLOOD REQUESTS
// ======================================================

// GET /api/blood-requests/donor/matches
// Find blood requests that the logged-in USER can donate to
router.get(
  "/donor/matches",
  authenticateToken,
  authorizeRoles("USER"),
  getDonorMatchingRequests
);

// ======================================================
// BLOOD BANK / ADMIN - BLOOD REQUESTS
// ======================================================

// GET /api/blood-requests/blood-bank
// Blood bank and admin can view blood requests
router.get(
  "/blood-bank",
  authenticateToken,
  authorizeRoles("BLOOD_BANK", "ADMIN"),
  getBloodBankRequests
);

// ======================================================
// BLOOD BANK / ADMIN - FULFILL REQUEST
// ======================================================

// PUT /api/blood-requests/:request_id/fulfill
// Fulfill a blood request from blood-bank inventory
router.put(
  "/:request_id/fulfill",
  authenticateToken,
  authorizeRoles("BLOOD_BANK", "ADMIN"),
  fulfillBloodRequest
);

// ======================================================
// USER - REQUEST RESPONSES
// ======================================================

// GET /api/blood-requests/:request_id/responses
// Request owner can view users who responded
router.get(
  "/:request_id/responses",
  authenticateToken,
  authorizeRoles("USER"),
  getBloodRequestResponses
);

// ======================================================
// USER - FIND COMPATIBLE USERS
// ======================================================

// GET /api/blood-requests/:request_id/matches
// Request owner can view compatible users
router.get(
  "/:request_id/matches",
  authenticateToken,
  authorizeRoles("USER"),
  getCompatibleDonors
);

// ======================================================
// USER - VIEW OWN BLOOD REQUEST
// ======================================================

// GET /api/blood-requests/:request_id
// View a blood request owned by logged-in USER
router.get(
  "/:request_id",
  authenticateToken,
  authorizeRoles("USER"),
  getBloodRequestById
);

// ======================================================
// USER - CANCEL BLOOD REQUEST
// ======================================================

// PUT /api/blood-requests/:request_id/cancel
// Cancel own pending blood request
router.put(
  "/:request_id/cancel",
  authenticateToken,
  authorizeRoles("USER"),
  cancelBloodRequest
);

// ======================================================
// USER - RESPOND TO BLOOD REQUEST
// ======================================================

// POST /api/blood-requests/:request_id/respond
// USER responds to another USER's blood request
router.post(
  "/:request_id/respond",
  authenticateToken,
  authorizeRoles("USER"),
  respondToBloodRequest
);

module.exports = router;