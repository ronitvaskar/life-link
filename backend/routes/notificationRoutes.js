const express = require("express");

const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} = require("../controllers/notificationController");

const {
  authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  getMyNotifications
);

router.put(
  "/:notification_id/read",
  authenticateToken,
  markNotificationAsRead
);

router.put(
  "/read-all",
  authenticateToken,
  markAllNotificationsAsRead
);

module.exports = router;