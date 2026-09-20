const express = require("express");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  getAllUsers,
  getAllDonors,
  getAllRecipients,
  getAllBloodBanks,
  updateUserStatus,
  getAdminDashboard,
  getAllBloodRequests,
  getAllDonations,
  getAllInventory,
  getAuditLogs
} = require("../controllers/adminController");

const { getReports } = require("../controllers/reportController");

const router = express.Router();

// All admin routes require authentication + ADMIN role
router.use(authenticateToken, authorizeRoles("ADMIN"));

router.get("/dashboard", getAdminDashboard);

// Users
router.get("/users", getAllUsers);

// Donors
router.get("/donors", getAllDonors);

// Recipients
router.get("/recipients", getAllRecipients);

// Blood banks
router.get("/blood-banks", getAllBloodBanks);

router.put("/users/:user_id/status", updateUserStatus);

router.get("/blood-requests", getAllBloodRequests);

router.get("/donations", getAllDonations);

router.get("/inventory", getAllInventory);

router.get("/reports", getReports);

router.get("/audit-logs", getAuditLogs);

module.exports = router;