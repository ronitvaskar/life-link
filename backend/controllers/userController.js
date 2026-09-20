const pool = require("../config/database");

// ======================================================
// ALLOWED BLOOD GROUPS
// ======================================================

const ALLOWED_BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

// ======================================================
// GET CURRENT USER
// ======================================================

// GET /api/users/me
// Get basic information about the logged-in user

const getCurrentUser = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT
        user_id,
        name,
        email,
        phone,
        role,
        status,
        created_at,
        updated_at
       FROM users
       WHERE user_id = ?`,
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error("Get current user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};

// ======================================================
// UPDATE CURRENT USER
// ======================================================

// PUT /api/users/me
// Update basic USER information

const updateCurrentUser = async (req, res) => {
  try {
    const {
      name,
      phone,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    await pool.query(
      `UPDATE users
       SET name = ?,
           phone = ?
       WHERE user_id = ?`,
      [
        name.trim(),
        phone ? phone.trim() : null,
        req.user.user_id,
      ]
    );

    const [users] = await pool.query(
      `SELECT
        user_id,
        name,
        email,
        phone,
        role,
        status,
        created_at,
        updated_at
       FROM users
       WHERE user_id = ?`,
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: users[0],
    });
  } catch (error) {
    console.error("Update current user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update user profile",
    });
  }
};

// ======================================================
// GET USER PROFILE
// ======================================================

// GET /api/users/profile
// Get USER's complete blood donation profile

const getUserProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT
        u.user_id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.status,
        u.blood_group,
        u.date_of_birth,
        u.gender,
        u.last_donation_date,
        u.availability_status,
        u.address,
        u.city,
        u.state,
        u.created_at,
        u.updated_at
       FROM users u
       WHERE u.user_id = ?
         AND u.role = 'USER'`,
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "USER profile not found",
      });
    }

    res.json({
      success: true,
      user: {
        ...users[0],
        is_available: users[0].availability_status === "AVAILABLE",
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch USER profile",
    });
  }
};

// ======================================================
// SAVE / CREATE USER PROFILE
// ======================================================

// POST /api/users/profile
// Save blood group, DOB, gender, address, city and state

const saveUserProfile = async (req, res) => {
  try {
    const {
      blood_group,
      date_of_birth,
      gender,
      address,
      city,
      state,
    } = req.body;

    // ------------------------------------------
    // Validate blood group
    // ------------------------------------------

    if (
      blood_group &&
      !ALLOWED_BLOOD_GROUPS.includes(blood_group)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood group",
      });
    }

    // ------------------------------------------
    // Make sure the account is a USER
    // ------------------------------------------

    const [existingUsers] = await pool.query(
      `SELECT user_id, role, status
       FROM users
       WHERE user_id = ?`,
      [req.user.user_id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (existingUsers[0].role !== "USER") {
      return res.status(403).json({
        success: false,
        message: "Only USER accounts can update this profile",
      });
    }

    if (existingUsers[0].status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "User account is not active",
      });
    }

    // ------------------------------------------
    // Validate date of birth
    // ------------------------------------------

    if (date_of_birth) {
      const date = new Date(date_of_birth);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date of birth",
        });
      }
    }

    // ------------------------------------------
    // Update USER profile
    // ------------------------------------------

    await pool.query(
      `UPDATE users
       SET
         blood_group = ?,
         date_of_birth = ?,
         gender = ?,
         address = ?,
         city = ?,
         state = ?
       WHERE user_id = ?`,
      [
        blood_group || null,
        date_of_birth || null,
        gender || null,
        address || null,
        city || null,
        state || null,
        req.user.user_id,
      ]
    );

    // ------------------------------------------
    // Return updated profile
    // ------------------------------------------

    const [users] = await pool.query(
      `SELECT
        user_id,
        name,
        email,
        phone,
        role,
        status,
        blood_group,
        date_of_birth,
        gender,
        last_donation_date,
        availability_status,
        address,
        city,
        state,
        created_at,
        updated_at
       FROM users
       WHERE user_id = ?`,
      [req.user.user_id]
    );

    res.json({
      success: true,
      message: "USER profile saved successfully",
      user: {
        ...users[0],
        is_available:
          users[0].availability_status === "AVAILABLE",
      },
    });
  } catch (error) {
    console.error("Save user profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save USER profile",
    });
  }
};

// ======================================================
// UPDATE DONATION AVAILABILITY
// ======================================================

// PUT /api/users/availability
// USER can become available/unavailable for donation

const updateUserAvailability = async (req, res) => {
  try {
    const { is_available } = req.body;

    // ------------------------------------------
    // Validate value
    // ------------------------------------------

    if (
      is_available !== true &&
      is_available !== false &&
      is_available !== 1 &&
      is_available !== 0
    ) {
      return res.status(400).json({
        success: false,
        message: "is_available must be true or false",
      });
    }

    const available =
      is_available === true || is_available === 1;

    // ------------------------------------------
    // Get current USER
    // ------------------------------------------

    const [users] = await pool.query(
      `SELECT
        user_id,
        role,
        status,
        blood_group
       FROM users
       WHERE user_id = ?`,
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    if (user.role !== "USER") {
      return res.status(403).json({
        success: false,
        message: "Only USER accounts can change donation availability",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "User account is not active",
      });
    }

    // ------------------------------------------
    // Blood group required for donation
    // ------------------------------------------

    if (available && !user.blood_group) {
      return res.status(400).json({
        success: false,
        message:
          "Please save your blood group before becoming available for donation",
      });
    }

    // ------------------------------------------
    // Update availability
    // ------------------------------------------

    await pool.query(
      `UPDATE users
       SET availability_status = ?
       WHERE user_id = ?`,
      [
        available ? "AVAILABLE" : "UNAVAILABLE",
        req.user.user_id,
      ]
    );

    res.json({
      success: true,
      message: available
        ? "You are now available for blood donation"
        : "You are now unavailable for blood donation",
      user_id: req.user.user_id,
      is_available: available,
    });
  } catch (error) {
    console.error("Update user availability error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update donation availability",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getCurrentUser,
  updateCurrentUser,
  getUserProfile,
  saveUserProfile,
  updateUserAvailability,
};