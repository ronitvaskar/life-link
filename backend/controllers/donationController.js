const pool = require("../config/database");

const {
  createNotification,
} = require("../services/notificationService");

const {
  createAuditLog,
} = require("../services/auditService");

// ======================================================
// CONSTANTS
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

const ALLOWED_DONATION_STATUSES = [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
];

// ======================================================
// CREATE DONATION
// ======================================================

// POST /api/donations
// USER schedules a blood donation at a blood bank

const createDonation = async (req, res) => {
  const connection = await pool.getConnection();

  let transactionStarted = false;

  try {
    const {
      bank_id,
      donation_date,
      units,
      notes,
    } = req.body;

    // --------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------

    if (!bank_id || !donation_date || !units) {
      return res.status(400).json({
        success: false,
        message: "Bank, donation date and units are required",
      });
    }

    if (
      !Number.isInteger(Number(units)) ||
      Number(units) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Units must be a positive whole number",
      });
    }

    // --------------------------------------------------
    // GET CURRENT USER
    // --------------------------------------------------

    const [users] = await connection.query(
      `SELECT
        user_id,
        name,
        email,
        phone,
        role,
        status,
        blood_group,
        date_of_birth,
        last_donation_date,
        availability_status
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

    // --------------------------------------------------
    // ROLE CHECK
    // --------------------------------------------------

    if (user.role !== "USER") {
      return res.status(403).json({
        success: false,
        message: "Only USER accounts can create donations",
      });
    }

    // --------------------------------------------------
    // ACCOUNT STATUS
    // --------------------------------------------------

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "User account is not active",
      });
    }

    // --------------------------------------------------
    // BLOOD GROUP CHECK
    // --------------------------------------------------

    if (!user.blood_group) {
      return res.status(400).json({
        success: false,
        message:
          "Please complete your profile and add your blood group before donating",
      });
    }

    if (!ALLOWED_BLOOD_GROUPS.includes(user.blood_group)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user blood group",
      });
    }

    // --------------------------------------------------
    // DONATION AVAILABILITY
    // --------------------------------------------------

    if (user.availability_status !== "AVAILABLE") {
      return res.status(400).json({
        success: false,
        message: "User is currently unavailable for donation",
      });
    }

    // --------------------------------------------------
    // CHECK BLOOD BANK
    // --------------------------------------------------

    const [banks] = await connection.query(
  `SELECT
    b.bank_id,
    b.user_id,
    b.bank_name,
    u.status AS user_status,
    u.role
   FROM blood_banks b
   INNER JOIN users u
     ON b.user_id = u.user_id
   WHERE b.bank_id = ?`,
  [bank_id]
);

if (banks.length === 0) {
  return res.status(404).json({
    success: false,
    message: "Blood bank not found",
  });
}

const bank = banks[0];

if (bank.role !== "BLOOD_BANK") {
  return res.status(400).json({
    success: false,
    message: "Invalid blood bank account",
  });
}

if (bank.user_status !== "ACTIVE") {
  return res.status(400).json({
    success: false,
    message: "Blood bank is not active",
  });
}

    // --------------------------------------------------
    // CHECK DONATION DATE
    // --------------------------------------------------

    const parsedDonationDate = new Date(donation_date);

    if (Number.isNaN(parsedDonationDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation date",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const requestedDate = new Date(donation_date);
    requestedDate.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Donation date cannot be in the past",
      });
    }

    // --------------------------------------------------
    // CHECK MINIMUM DONATION INTERVAL
    // --------------------------------------------------

    if (user.last_donation_date) {
      const [settings] = await connection.query(
        `SELECT setting_value
         FROM system_settings
         WHERE setting_key = 'minimum_donation_interval'
         LIMIT 1`
      );

      let minimumInterval = 90;

      if (settings.length > 0) {
        const configuredInterval = Number(
          settings[0].setting_value
        );

        if (
          Number.isFinite(configuredInterval) &&
          configuredInterval >= 0
        ) {
          minimumInterval = configuredInterval;
        }
      }

      const lastDonation = new Date(
        user.last_donation_date
      );

      const differenceInDays = Math.floor(
        (requestedDate - lastDonation) /
          (1000 * 60 * 60 * 24)
      );

      if (differenceInDays < minimumInterval) {
        return res.status(400).json({
          success: false,
          message: `Minimum donation interval is ${minimumInterval} days`,
        });
      }
    }

    // --------------------------------------------------
    // CHECK MAXIMUM UNITS
    // --------------------------------------------------

    const [maxUnitsSetting] = await connection.query(
      `SELECT setting_value
       FROM system_settings
       WHERE setting_key = 'maximum_blood_request_units'
       LIMIT 1`
    );

    if (maxUnitsSetting.length > 0) {
      const maximumUnits = Number(
        maxUnitsSetting[0].setting_value
      );

      if (
        Number.isFinite(maximumUnits) &&
        Number(units) > maximumUnits
      ) {
        return res.status(400).json({
          success: false,
          message: `Maximum allowed units is ${maximumUnits}`,
        });
      }
    }

    // --------------------------------------------------
    // START TRANSACTION
    // --------------------------------------------------

    await connection.beginTransaction();
    transactionStarted = true;

    // --------------------------------------------------
    // CREATE DONATION
    // --------------------------------------------------

    const [result] = await connection.query(
      `INSERT INTO donations
       (
         user_id,
         bank_id,
         blood_group,
         donation_date,
         units,
         status,
         notes
       )
       VALUES (?, ?, ?, ?, ?, 'SCHEDULED', ?)`,
      [
        req.user.user_id,
        Number(bank_id),
        user.blood_group,
        donation_date,
        Number(units),
        notes || null,
      ]
    );

    // --------------------------------------------------
    // AUDIT LOG
    // --------------------------------------------------

    await createAuditLog({
      user_id: req.user.user_id,
      action: "CREATE_DONATION",
      description: `Donation #${result.insertId} scheduled`,
    });

    // --------------------------------------------------
    // COMMIT
    // --------------------------------------------------

    await connection.commit();
    transactionStarted = false;

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    res.status(201).json({
      success: true,
      message: "Donation scheduled successfully",
      donation: {
        donation_id: result.insertId,
        user_id: req.user.user_id,
        bank_id: Number(bank_id),
        blood_group: user.blood_group,
        donation_date,
        units: Number(units),
        status: "SCHEDULED",
        notes: notes || null,
      },
    });
  } catch (error) {
    if (transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Donation rollback error:",
          rollbackError
        );
      }
    }

    console.error("Create donation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create donation",
    });
  } finally {
    connection.release();
  }
};

// ======================================================
// COMPLETE DONATION
// ======================================================

// PUT /api/donations/:donation_id/complete
// BLOOD_BANK / ADMIN completes a scheduled donation

const completeDonation = async (req, res) => {
  const connection = await pool.getConnection();

  let transactionStarted = false;

  try {
    const { donation_id } = req.params;

    if (!donation_id) {
      return res.status(400).json({
        success: false,
        message: "Donation ID is required",
      });
    }

    // --------------------------------------------------
    // START TRANSACTION
    // --------------------------------------------------

    await connection.beginTransaction();
    transactionStarted = true;

    // --------------------------------------------------
    // GET DONATION
    // --------------------------------------------------

    const [donations] = await connection.query(
      `SELECT
        donation_id,
        user_id,
        bank_id,
        blood_group,
        donation_date,
        units,
        status,
        notes
       FROM donations
       WHERE donation_id = ?
       FOR UPDATE`,
      [donation_id]
    );

    if (donations.length === 0) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    const donation = donations[0];

    // --------------------------------------------------
    // CHECK DONATION STATUS
    // --------------------------------------------------

    if (donation.status !== "SCHEDULED") {
      await connection.rollback();
      transactionStarted = false;

      return res.status(400).json({
        success: false,
        message: `Donation cannot be completed because its current status is ${donation.status}`,
      });
    }

    // --------------------------------------------------
    // CHECK BLOOD BANK ACCESS
    // --------------------------------------------------

    if (req.user.role === "BLOOD_BANK") {
      const [banks] = await connection.query(
        `SELECT bank_id
         FROM blood_banks
         WHERE bank_id = ?
           AND user_id = ?`,
        [
          donation.bank_id,
          req.user.user_id,
        ]
      );

      if (banks.length === 0) {
        await connection.rollback();
        transactionStarted = false;

        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to complete donations for this blood bank",
        });
      }
    }

    // --------------------------------------------------
    // GET USER
    // --------------------------------------------------

    const [users] = await connection.query(
      `SELECT
        user_id,
        name,
        blood_group,
        availability_status
       FROM users
       WHERE user_id = ?
       FOR UPDATE`,
      [donation.user_id]
    );

    if (users.length === 0) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Donating user not found",
      });
    }

    const user = users[0];

    // --------------------------------------------------
    // VERIFY BLOOD GROUP
    // --------------------------------------------------

    if (user.blood_group !== donation.blood_group) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(400).json({
        success: false,
        message:
          "User blood group does not match donation blood group",
      });
    }

    // --------------------------------------------------
    // UPDATE DONATION
    // --------------------------------------------------

    await connection.query(
      `UPDATE donations
       SET status = 'COMPLETED'
       WHERE donation_id = ?`,
      [donation_id]
    );

    // --------------------------------------------------
    // UPDATE USER DONATION INFORMATION
    // --------------------------------------------------

    await connection.query(
      `UPDATE users
       SET
         last_donation_date = ?,
         availability_status = 'UNAVAILABLE'
       WHERE user_id = ?`,
      [
        donation.donation_date,
        donation.user_id,
      ]
    );

    // --------------------------------------------------
    // CHECK INVENTORY
    // --------------------------------------------------

    const [inventoryRows] = await connection.query(
      `SELECT
        inventory_id,
        units_available
       FROM inventory
       WHERE bank_id = ?
         AND blood_group = ?
       FOR UPDATE`,
      [
        donation.bank_id,
        donation.blood_group,
      ]
    );

    // --------------------------------------------------
    // CREATE OR UPDATE INVENTORY
    // --------------------------------------------------

    if (inventoryRows.length === 0) {
      await connection.query(
        `INSERT INTO inventory
         (
           bank_id,
           blood_group,
           units_available
         )
         VALUES (?, ?, ?)`,
        [
          donation.bank_id,
          donation.blood_group,
          donation.units,
        ]
      );
    } else {
      await connection.query(
        `UPDATE inventory
         SET units_available = units_available + ?
         WHERE inventory_id = ?`,
        [
          donation.units,
          inventoryRows[0].inventory_id,
        ]
      );
    }

    // --------------------------------------------------
    // AUDIT LOGS
    // --------------------------------------------------

    await createAuditLog({
      user_id: req.user.user_id,
      action: "COMPLETE_DONATION",
      description: `Donation #${donation_id} completed`,
    });

    await createAuditLog({
      user_id: req.user.user_id,
      action: "INVENTORY_UPDATE",
      description:
        `Inventory increased by ${donation.units} unit(s) of ${donation.blood_group} at blood bank #${donation.bank_id} after donation #${donation.donation_id} completion`,
    });

    // --------------------------------------------------
    // COMMIT
    // --------------------------------------------------

    await connection.commit();
    transactionStarted = false;

    // --------------------------------------------------
    // NOTIFY USER
    // --------------------------------------------------

    try {
      await createNotification({
        userId: donation.user_id,
        title: "Donation Completed",
        message: `Your blood donation of ${donation.units} unit(s) of ${donation.blood_group} has been completed successfully.`,
        type: "DONATION_COMPLETED",
      });
    } catch (notificationError) {
      console.error(
        "Donation notification error:",
        notificationError
      );
    }

    // --------------------------------------------------
    // RETURN COMPLETED DONATION
    // --------------------------------------------------

    const [completedDonation] = await pool.query(
      `SELECT
        d.donation_id,
        d.user_id,
        u.name AS donor_name,
        u.phone AS donor_phone,
        d.bank_id,
        b.bank_name,
        d.blood_group,
        d.donation_date,
        d.units,
        d.status,
        d.notes,
        d.created_at
       FROM donations d
       INNER JOIN users u
         ON d.user_id = u.user_id
       INNER JOIN blood_banks b
         ON d.bank_id = b.bank_id
       WHERE d.donation_id = ?`,
      [donation_id]
    );

    res.json({
      success: true,
      message:
        "Donation completed and inventory updated successfully",
      donation: completedDonation[0],
    });
  } catch (error) {
    if (transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Donation rollback error:",
          rollbackError
        );
      }
    }

    console.error("Complete donation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to complete donation",
    });
  } finally {
    connection.release();
  }
};

// ======================================================
// GET BLOOD BANK DONATIONS
// ======================================================

// GET /api/donations/blood-bank
// BLOOD_BANK sees its own donations
// ADMIN can optionally filter by bank_id

const getBloodBankDonations = async (req, res) => {
  try {
    let bankId = null;

    // --------------------------------------------------
    // BLOOD BANK
    // --------------------------------------------------

    if (req.user.role === "BLOOD_BANK") {
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

      bankId = banks[0].bank_id;
    }

    // --------------------------------------------------
    // ADMIN
    // --------------------------------------------------

    if (req.user.role === "ADMIN") {
      if (req.query.bank_id) {
        bankId = Number(req.query.bank_id);

        if (
          !Number.isInteger(bankId) ||
          bankId <= 0
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid bank_id",
          });
        }
      }
    }

    // --------------------------------------------------
    // QUERY
    // --------------------------------------------------

    const [donations] = await pool.query(
      `SELECT
        d.donation_id,
        d.user_id,
        u.name AS donor_name,
        u.phone AS donor_phone,
        d.bank_id,
        b.bank_name,
        d.blood_group,
        d.donation_date,
        d.units,
        d.status,
        d.notes,
        d.created_at
       FROM donations d
       INNER JOIN users u
         ON d.user_id = u.user_id
       INNER JOIN blood_banks b
         ON d.bank_id = b.bank_id
       ${bankId ? "WHERE d.bank_id = ?" : ""}
       ORDER BY d.donation_date DESC, d.created_at DESC`,
      bankId ? [bankId] : []
    );

    res.json({
      success: true,
      donations,
    });
  } catch (error) {
    console.error(
      "Get blood bank donations error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch blood bank donations",
    });
  }
};

// ======================================================
// GET MY DONATIONS
// ======================================================

// GET /api/donations/my
// Get donations made by logged-in USER

const getMyDonations = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT
        user_id,
        role,
        status
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

    if (users[0].role !== "USER") {
      return res.status(403).json({
        success: false,
        message:
          "Only USER accounts can view personal donations",
      });
    }

    const [donations] = await pool.query(
      `SELECT
        d.donation_id,
        d.user_id,
        d.bank_id,
        b.bank_name,
        d.blood_group,
        d.donation_date,
        d.units,
        d.status,
        d.notes,
        d.created_at
       FROM donations d
       INNER JOIN blood_banks b
         ON d.bank_id = b.bank_id
       WHERE d.user_id = ?
       ORDER BY d.donation_date DESC, d.created_at DESC`,
      [req.user.user_id]
    );

    res.json({
      success: true,
      donations,
    });
  } catch (error) {
    console.error("Get my donations error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your donations",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createDonation,
  completeDonation,
  getBloodBankDonations,
  getMyDonations,
};