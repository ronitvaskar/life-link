const pool = require("../config/database");

// GET DONOR PROFILE
const getDonorProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        d.donor_id,
        d.user_id,
        d.blood_group,
        d.date_of_birth,
        d.gender,

        COALESCE(
          (
            SELECT MAX(dn.donation_date)
            FROM donations dn
            WHERE dn.donor_id = d.donor_id
              AND dn.status = 'COMPLETED'
          ),
          d.last_donation_date
        ) AS last_donation_date,

        CASE
          WHEN d.availability_status = 'AVAILABLE' THEN true
          ELSE false
        END AS is_available,

        d.address,
        d.city,
        d.state,
        u.name,
        u.email,
        u.phone,
        u.status

       FROM donors d
       INNER JOIN users u ON d.user_id = u.user_id
       WHERE d.user_id = ?`,
      [req.user.user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Donor profile not found"
      });
    }

    res.json({
      success: true,
      donor: rows[0]
    });

  } catch (error) {
    console.error("Get donor profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch donor profile"
    });
  }
};


// CREATE / UPDATE DONOR PROFILE
const saveDonorProfile = async (req, res) => {
  try {
    const {
  blood_group,
  date_of_birth,
  gender,
  address,
  city,
  state
} = req.body;

    if (!blood_group || !date_of_birth) {
      return res.status(400).json({
        success: false,
        message: "Blood group and date of birth are required"
      });
    }

    const allowedBloodGroups = [
      "A+",
      "A-",
      "B+",
      "B-",
      "AB+",
      "AB-",
      "O+",
      "O-"
    ];

    if (!allowedBloodGroups.includes(blood_group)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood group"
      });
    }

    // Convert API boolean to database ENUM value
   const availabilityStatus = "AVAILABLE";

    // Check whether donor profile already exists
    const [existing] = await pool.query(
      "SELECT donor_id FROM donors WHERE user_id = ?",
      [req.user.user_id]
    );

    if (existing.length > 0) {
      // UPDATE
      await pool.query(
  `UPDATE donors
   SET blood_group = ?,
       date_of_birth = ?,
       gender = ?,
       address = ?,
       city = ?,
       state = ?
   WHERE user_id = ?`,
  [
    blood_group,
    date_of_birth,
    gender || null,
    address || null,
    city || null,
    state || null,
    req.user.user_id
  ]
);

    } else {
      // CREATE
      await pool.query(
        `INSERT INTO donors
         (
           user_id,
           blood_group,
           date_of_birth,
           gender,
           last_donation_date,
           availability_status,
           address,
           city,
           state
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            req.user.user_id,
  blood_group,
  date_of_birth,
  gender || null,
  null,
  availabilityStatus,
  address || null,
  city || null,
  state || null
        ]
      );
    }

    // Return updated profile
    const [rows] = await pool.query(
      `SELECT
        d.donor_id,
        d.user_id,
        d.blood_group,
        d.date_of_birth,
        d.gender,
        d.last_donation_date,
        CASE
          WHEN d.availability_status = 'AVAILABLE' THEN true
          ELSE false
        END AS is_available,
        d.address,
        d.city,
        d.state,
        u.name,
        u.email,
        u.phone
       FROM donors d
       INNER JOIN users u ON d.user_id = u.user_id
       WHERE d.user_id = ?`,
      [req.user.user_id]
    );

    res.json({
      success: true,
      message: "Donor profile saved successfully",
      donor: rows[0]
    });

  } catch (error) {
    console.error("Save donor profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save donor profile"
    });
  }
};

const updateDonorAvailability = async (req, res) => {
  try {
    const { is_available } = req.body;

    if (typeof is_available !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_available must be true or false"
      });
    }

    const availabilityStatus = is_available
      ? "AVAILABLE"
      : "UNAVAILABLE";

    const [donors] = await pool.query(
      `SELECT donor_id
       FROM donors
       WHERE user_id = ?`,
      [req.user.user_id]
    );

    if (donors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Donor profile not found"
      });
    }

    await pool.query(
      `UPDATE donors
       SET availability_status = ?
       WHERE user_id = ?`,
      [availabilityStatus, req.user.user_id]
    );

    const [updatedDonor] = await pool.query(
      `SELECT
        d.donor_id,
        d.user_id,
        d.blood_group,
        d.date_of_birth,
        d.gender,
        d.last_donation_date,
        CASE
          WHEN d.availability_status = 'AVAILABLE' THEN true
          ELSE false
        END AS is_available,
        d.address,
        d.city,
        d.state
       FROM donors d
       WHERE d.user_id = ?`,
      [req.user.user_id]
    );

    res.json({
      success: true,
      message: "Donor availability updated successfully",
      donor: updatedDonor[0]
    });

  } catch (error) {
    console.error("Update donor availability error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update donor availability"
    });
  }
};




module.exports = {
  getDonorProfile,
  saveDonorProfile,
  updateDonorAvailability,
  
};