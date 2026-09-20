const express = require("express");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  getSettings,
  updateSetting,
} = require("../controllers/settingsController");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getSettings
);

router.put(
  "/:setting_id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  updateSetting
);

module.exports = router;