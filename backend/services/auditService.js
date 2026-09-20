const pool = require("../config/database");

const createAuditLog = async ({
  user_id,
  action,
  description
}) => {
  try {
    await pool.query(
      `
      INSERT INTO audit_logs
      (user_id, action, description)
      VALUES (?, ?, ?)
      `,
      [
        user_id,
        action,
        description
      ]
    );
  } catch (error) {
    // Audit logging should not break the main application.
    console.error("Audit log error:", error.message);
  }
};

module.exports = {
  createAuditLog
};