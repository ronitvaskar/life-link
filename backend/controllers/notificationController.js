const pool = require("../config/database");

// Get notifications for logged-in user
const getMyNotifications = async (req, res) => {
  try {
    const [notifications] = await pool.query(
      `SELECT
        notification_id,
        user_id,
        title,
        message,
        type,
        is_read,
        created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.user_id]
    );

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications"
    });
  }
};


// Mark one notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = Number(req.params.notification_id);

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID"
      });
    }

    const [result] = await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE notification_id = ?
       AND user_id = ?`,
      [notificationId, req.user.user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    console.error("Mark notification read error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update notification"
    });
  }
};


// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE user_id = ?
       AND is_read = FALSE`,
      [req.user.user_id]
    );

    res.json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update notifications"
    });
  }
};


module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};