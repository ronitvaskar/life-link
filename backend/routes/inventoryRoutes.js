const express = require("express");

const {
  getInventory,
   getBloodBankDashboard
} = require("../controllers/inventoryController");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();
router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("BLOOD_BANK", "ADMIN"),
  getBloodBankDashboard
);
router.get(
  "/",
  authenticateToken,
  authorizeRoles("BLOOD_BANK", "ADMIN"),
  getInventory
);

module.exports = router;