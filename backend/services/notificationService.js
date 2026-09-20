const pool = require("../config/database");

const createNotification = async ({
  userId,
  title,
  message,
  type = "GENERAL"
}) => {
  if (!userId || !title || !message) {
    throw new Error("userId, title and message are required");
  }

  const [result] = await pool.query(
    `INSERT INTO notifications
      (user_id, title, message, type)
     VALUES (?, ?, ?, ?)`,
    [userId, title, message, type]
  );

  return result.insertId;
};


const createNotificationsForUsers = async ({
  userIds,
  title,
  message,
  type = "GENERAL"
}) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return [];
  }

  const values = userIds.map((userId) => [
    userId,
    title,
    message,
    type
  ]);

  await pool.query(
    `INSERT INTO notifications
      (user_id, title, message, type)
     VALUES ?`,
    [values]
  );

  return userIds;
};


module.exports = {
  createNotification,
  createNotificationsForUsers
};