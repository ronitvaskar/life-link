const pool = require("../config/database");

// ======================================================
// GET ACTIVE BLOOD BANKS
// ======================================================

// GET /api/blood-banks
// USER can view active blood banks when scheduling a donation

const getActiveBloodBanks = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        b.bank_id,
        b.user_id,
        b.bank_name,
        b.phone,
        b.email,
        b.address,
        b.city,
        b.state,
        b.created_at
       FROM blood_banks b
       INNER JOIN users u
         ON b.user_id = u.user_id
       WHERE u.status = 'ACTIVE'
         AND u.role = 'BLOOD_BANK'
       ORDER BY b.bank_name ASC`
    );

    res.json({
      success: true,
      bloodBanks: rows,
    });
  } catch (error) {
    console.error("Get active blood banks error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch blood banks",
    });
  }
};

// ======================================================
// GET LOGGED-IN BLOOD BANK PROFILE
// ======================================================

const getBloodBankProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        b.bank_id,
        b.user_id,
        b.bank_name,
        b.phone,
        b.email,
        b.address,
        b.city,
        b.state,
        b.created_at,
        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        u.status
       FROM blood_banks b
       LEFT JOIN users u
         ON b.user_id = u.user_id
       WHERE b.user_id = ?`,
      [req.user.user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blood bank profile not found",
      });
    }

    res.json({
      success: true,
      profile: rows[0],
    });
  } catch (error) {
    console.error("Get blood bank profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch blood bank profile",
    });
  }
};

// ======================================================
// UPDATE LOGGED-IN BLOOD BANK PROFILE
// ======================================================

const updateBloodBankProfile = async (req, res) => {
  try {
    const {
      bank_name,
      phone,
      email,
      address,
      city,
      state,
    } = req.body;

    if (!bank_name || !email) {
      return res.status(400).json({
        success: false,
        message: "Bank name and email are required",
      });
    }

    const [banks] = await pool.query(
      `SELECT bank_id
       FROM blood_banks
       WHERE user_id = ?`,
      [req.user.user_id]
    );

    if (banks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blood bank profile not found",
      });
    }

    const bankId = banks[0].bank_id;

    // Check whether email belongs to another user
    const [existingUsers] = await pool.query(
      `SELECT user_id
       FROM users
       WHERE email = ?
       AND user_id != ?`,
      [email, req.user.user_id]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email is already in use",
      });
    }

    await pool.query(
      `UPDATE blood_banks
       SET bank_name = ?,
           phone = ?,
           email = ?,
           address = ?,
           city = ?,
           state = ?
       WHERE bank_id = ?`,
      [
        bank_name,
        phone || null,
        email,
        address || null,
        city || null,
        state || null,
        bankId,
      ]
    );

    await pool.query(
      `UPDATE users
       SET name = ?,
           phone = ?,
           email = ?
       WHERE user_id = ?`,
      [
        bank_name,
        phone || null,
        email,
        req.user.user_id,
      ]
    );

    const [updated] = await pool.query(
      `SELECT
        b.bank_id,
        b.user_id,
        b.bank_name,
        b.phone,
        b.email,
        b.address,
        b.city,
        b.state,
        b.created_at
       FROM blood_banks b
       WHERE b.bank_id = ?`,
      [bankId]
    );

    res.json({
      success: true,
      message: "Blood bank profile updated successfully",
      profile: updated[0],
    });
  } catch (error) {
    console.error("Update blood bank profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update blood bank profile",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getActiveBloodBanks,
  getBloodBankProfile,
  updateBloodBankProfile,
};