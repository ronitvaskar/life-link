const pool = require("../config/database");

const ALLOWED_BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-"
];


// =====================================================
// GET USER BLOOD REQUEST PROFILE
// =====================================================

const getRecipientProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        u.user_id,
        u.name,
        u.email,
        u.phone,
        u.status,
        u.blood_group,
        u.date_of_birth,
        u.gender,
        u.address,
        u.city,
        u.state,
        u.availability_status,
        u.last_donation_date,
        u.created_at,
        (
          SELECT MAX(d.donation_date)
          FROM donations d
          WHERE d.user_id = u.user_id
            AND d.status = 'COMPLETED'
        ) AS latest_donation_date
       FROM users u
       WHERE u.user_id = ?
         AND u.role = 'USER'`,
      [req.user.user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User profile not found"
      });
    }

    res.json({
      success: true,
      user: rows[0]
    });

  } catch (error) {
    console.error("Get user profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile"
    });
  }
};


// =====================================================
// CREATE / UPDATE USER PROFILE
// =====================================================

const saveRecipientProfile = async (req, res) => {
  try {
    const {
      patient_name,
      age,
      gender,
      blood_group,
      hospital_name,
      address,
      city,
      state,
      emergency_contact
    } = req.body;

    // -------------------------------------------------
    // CHECK USER ROLE
    // -------------------------------------------------

    const [userRows] = await pool.query(
      `SELECT user_id, role
       FROM users
       WHERE user_id = ?`,
      [req.user.user_id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (userRows[0].role !== "USER") {
      return res.status(403).json({
        success: false,
        message: "Only USER accounts can update this profile"
      });
    }

    // -------------------------------------------------
    // REQUIRED FIELDS
    // -------------------------------------------------

    if (
      !patient_name ||
      age === undefined ||
      !blood_group ||
      !hospital_name
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Patient name, age, blood group and hospital name are required"
      });
    }

    // -------------------------------------------------
    // AGE VALIDATION
    // -------------------------------------------------

    const numericAge = Number(age);

    if (
      !Number.isInteger(numericAge) ||
      numericAge <= 0 ||
      numericAge > 120
    ) {
      return res.status(400).json({
        success: false,
        message: "Age must be a valid number between 1 and 120"
      });
    }

    // -------------------------------------------------
    // BLOOD GROUP VALIDATION
    // -------------------------------------------------

    if (!ALLOWED_BLOOD_GROUPS.includes(blood_group)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood group"
      });
    }

    // -------------------------------------------------
    // UPDATE USER PROFILE
    //
    // Recipient information is stored directly in users.
    // A USER can request blood AND donate blood.
    // -------------------------------------------------

    await pool.query(
      `UPDATE users
       SET blood_group = ?,
           gender = ?,
           address = ?,
           city = ?,
           state = ?
       WHERE user_id = ?
         AND role = 'USER'`,
      [
        blood_group,
        gender || null,
        address || null,
        city || null,
        state || null,
        req.user.user_id
      ]
    );

    // -------------------------------------------------
    // RETURN UPDATED PROFILE
    // -------------------------------------------------

    const [rows] = await pool.query(
      `SELECT
        u.user_id,
        u.name,
        u.email,
        u.phone,
        u.status,
        u.blood_group,
        u.date_of_birth,
        u.gender,
        u.address,
        u.city,
        u.state,
        u.availability_status,
        u.last_donation_date,
        u.created_at,
        ? AS patient_name,
        ? AS age,
        ? AS hospital_name,
        ? AS emergency_contact
       FROM users u
       WHERE u.user_id = ?
         AND u.role = 'USER'`,
      [
        patient_name,
        numericAge,
        hospital_name,
        emergency_contact || null,
        req.user.user_id
      ]
    );

    res.json({
      success: true,
      message: "User profile saved successfully",
      user: rows[0]
    });

  } catch (error) {
    console.error("Save user profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save user profile"
    });
  }
};


module.exports = {
  getRecipientProfile,
  saveRecipientProfile
};