const pool = require("../config/database");
const { createAuditLog } = require("../services/auditService");

// Get all system settings
const getSettings = async (req, res) => {
  try {
    const [settings] = await pool.query(`
      SELECT
        setting_id,
        setting_key,
        setting_value,
        description,
        updated_at
      FROM system_settings
      ORDER BY setting_id ASC
    `);

    res.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error("Get settings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch system settings"
    });
  }
};


// Update a system setting
const updateSetting = async (req, res) => {
  try {
    const settingId = Number(req.params.setting_id);
    const { setting_value } = req.body;

    if (!Number.isInteger(settingId) || settingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid setting ID"
      });
    }

    if (
      setting_value === undefined ||
      setting_value === null ||
      String(setting_value).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "setting_value is required"
      });
    }

    const [settings] = await pool.query(
      `SELECT
        setting_id,
        setting_key,
        setting_value
       FROM system_settings
       WHERE setting_id = ?`,
      [settingId]
    );

    if (settings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Setting not found"
      });
    }

    const oldValue = settings[0].setting_value;
    const settingKey = settings[0].setting_key;

    await pool.query(
      `UPDATE system_settings
       SET setting_value = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE setting_id = ?`,
      [String(setting_value), settingId]
    );

    await createAuditLog({
      user_id: req.user.user_id,
      action: "UPDATE_SYSTEM_SETTING",
      description:
        `System setting '${settingKey}' changed from '${oldValue}' to '${setting_value}'`
    });

    res.json({
      success: true,
      message: "System setting updated successfully",
      setting: {
        setting_id: settingId,
        setting_key: settingKey,
        old_value: oldValue,
        new_value: String(setting_value)
      }
    });

  } catch (error) {
    console.error("Update setting error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update system setting"
    });
  }
};


module.exports = {
  getSettings,
  updateSetting
};