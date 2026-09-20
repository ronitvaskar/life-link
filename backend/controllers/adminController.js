const pool = require("../config/database");
const { createAuditLog } = require("../services/auditService");

// ======================================================
// GET ALL USERS
// ======================================================

const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT
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
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// ======================================================
// GET ALL USERS WHO CAN DONATE
// ======================================================
// "Donor" is a USER capability, not an account role.
// A USER can request and donate blood.
// ======================================================

const getAllDonors = async (req, res) => {
  try {
    const [donors] = await pool.query(`
      SELECT
        user_id,
        name,
        email,
        phone,
        status,
        blood_group,
        date_of_birth,
        gender,
        last_donation_date,
        availability_status,
        address,
        city,
        state,
        created_at
      FROM users
      WHERE role = 'USER'
        AND blood_group IS NOT NULL
        AND availability_status = 'AVAILABLE'
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      donors,
    });
  } catch (error) {
    console.error("Get all donors error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch donor users",
    });
  }
};

// ======================================================
// GET ALL USERS WHO HAVE CREATED BLOOD REQUESTS
// ======================================================
// "Recipient" is no longer an account role.
// A USER becomes a requester by creating a blood request.
// ======================================================

const getAllRecipients = async (req, res) => {
  try {
    const [recipients] = await pool.query(`
      SELECT DISTINCT
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
        u.created_at
      FROM users u
      INNER JOIN blood_requests br
        ON br.user_id = u.user_id
      WHERE u.role = 'USER'
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      recipients,
    });
  } catch (error) {
    console.error("Get all recipient users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch recipient users",
    });
  }
};

// ======================================================
// GET ALL BLOOD BANKS
// ======================================================

const getAllBloodBanks = async (req, res) => {
  try {
    const [banks] = await pool.query(`
      SELECT
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
        u.status AS user_status
      FROM blood_banks b
      LEFT JOIN users u
        ON b.user_id = u.user_id
      ORDER BY b.created_at DESC
    `);

    res.json({
      success: true,
      blood_banks: banks,
    });
  } catch (error) {
    console.error("Get all blood banks error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch blood banks",
    });
  }
};

// ======================================================
// UPDATE USER STATUS
// ======================================================

const updateUserStatus = async (req, res) => {
  try {
    const userId = Number(req.params.user_id);
    const { status } = req.body;

    const allowedStatuses = [
      "ACTIVE",
      "INACTIVE",
      "BLOCKED",
    ];

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Prevent admin from changing their own status.
    if (userId === req.user.user_id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status",
      });
    }

    const [users] = await pool.query(
      `SELECT
        user_id,
        name,
        email,
        role,
        status
       FROM users
       WHERE user_id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await pool.query(
      `UPDATE users
       SET status = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [status, userId]
    );

    await createAuditLog({
      user_id: req.user.user_id,
      action: "UPDATE_USER_STATUS",
      description: `User #${userId} status changed to ${status}`,
    });

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      user: {
        user_id: users[0].user_id,
        name: users[0].name,
        email: users[0].email,
        role: users[0].role,
        status,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

// ======================================================
// GET ADMIN DASHBOARD STATISTICS
// ======================================================

const getAdminDashboard = async (req, res) => {
  try {
    // --------------------------------------------------
    // USER STATISTICS
    // --------------------------------------------------

    const [[userStats]] = await pool.query(`
      SELECT
        COUNT(*) AS total_users,

        SUM(status = 'ACTIVE') AS active_users,

        SUM(status = 'BLOCKED') AS blocked_users,

        SUM(role = 'USER') AS regular_users,

        SUM(role = 'BLOOD_BANK') AS blood_bank_users,

        SUM(role = 'ADMIN') AS admin_users,

        SUM(
          role = 'USER'
          AND blood_group IS NOT NULL
        ) AS users_with_blood_group,

        SUM(
          role = 'USER'
          AND blood_group IS NOT NULL
          AND availability_status = 'AVAILABLE'
        ) AS available_donors
      FROM users
    `);

    // --------------------------------------------------
    // BLOOD REQUEST STATISTICS
    // --------------------------------------------------

    const [[requestStats]] = await pool.query(`
      SELECT
        COUNT(*) AS total_requests,

        SUM(status = 'PENDING') AS pending_requests,

        SUM(status = 'ACCEPTED') AS accepted_requests,

        SUM(status = 'PARTIALLY_FULFILLED')
          AS partially_fulfilled_requests,

        SUM(status = 'FULFILLED') AS fulfilled_requests,

        SUM(status = 'CANCELLED') AS cancelled_requests,

        SUM(status = 'REJECTED') AS rejected_requests,

        SUM(
          urgency = 'EMERGENCY'
          AND status IN (
            'PENDING',
            'ACCEPTED',
            'PARTIALLY_FULFILLED'
          )
        ) AS emergency_requests
      FROM blood_requests
    `);

    // --------------------------------------------------
    // DONATION STATISTICS
    // --------------------------------------------------

    const [[donationStats]] = await pool.query(`
      SELECT
        COUNT(*) AS total_donations,

        COALESCE(
          SUM(units),
          0
        ) AS total_units,

        SUM(status = 'COMPLETED')
          AS completed_donations,

        SUM(status = 'SCHEDULED')
          AS scheduled_donations,

        SUM(status = 'CANCELLED')
          AS cancelled_donations
      FROM donations
    `);

    // --------------------------------------------------
    // INVENTORY STATISTICS
    // --------------------------------------------------

    const [[inventoryStats]] = await pool.query(`
      SELECT
        COALESCE(
          SUM(i.units_available),
          0
        ) AS total_inventory_units,

        COUNT(*) AS inventory_records,

        COALESCE(
          SUM(
            i.units_available <= CAST(
              (
                SELECT setting_value
                FROM system_settings
                WHERE setting_key = 'low_inventory_threshold'
                LIMIT 1
              ) AS UNSIGNED
            )
          ),
          0
        ) AS low_inventory_records,

        COALESCE(
          SUM(i.units_available = 0),
          0
        ) AS empty_inventory_records
      FROM inventory i
    `);

    res.json({
      success: true,

      statistics: {
        users: {
          total: Number(userStats.total_users || 0),
          active: Number(userStats.active_users || 0),
          blocked: Number(userStats.blocked_users || 0),

          regular_users: Number(
            userStats.regular_users || 0
          ),

          blood_bank_users: Number(
            userStats.blood_bank_users || 0
          ),

          admin_users: Number(
            userStats.admin_users || 0
          ),

          users_with_blood_group: Number(
            userStats.users_with_blood_group || 0
          ),

          available_donors: Number(
            userStats.available_donors || 0
          ),
        },

        requests: {
          total: Number(
            requestStats.total_requests || 0
          ),

          pending: Number(
            requestStats.pending_requests || 0
          ),

          accepted: Number(
            requestStats.accepted_requests || 0
          ),

          partially_fulfilled: Number(
            requestStats.partially_fulfilled_requests || 0
          ),

          fulfilled: Number(
            requestStats.fulfilled_requests || 0
          ),

          cancelled: Number(
            requestStats.cancelled_requests || 0
          ),

          rejected: Number(
            requestStats.rejected_requests || 0
          ),

          emergency: Number(
            requestStats.emergency_requests || 0
          ),
        },

        donations: {
          total: Number(
            donationStats.total_donations || 0
          ),

          total_units: Number(
            donationStats.total_units || 0
          ),

          completed: Number(
            donationStats.completed_donations || 0
          ),

          scheduled: Number(
            donationStats.scheduled_donations || 0
          ),

          cancelled: Number(
            donationStats.cancelled_donations || 0
          ),
        },

        inventory: {
          total_units: Number(
            inventoryStats.total_inventory_units || 0
          ),

          records: Number(
            inventoryStats.inventory_records || 0
          ),

          low_inventory: Number(
            inventoryStats.low_inventory_records || 0
          ),

          empty_inventory: Number(
            inventoryStats.empty_inventory_records || 0
          ),
        },
      },
    });
  } catch (error) {
    console.error(
      "Get admin dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch admin dashboard statistics",
    });
  }
};

// ======================================================
// GET ALL BLOOD REQUESTS FOR ADMIN
// ======================================================

const getAllBloodRequests = async (req, res) => {
  try {
    const [requests] = await pool.query(`
      SELECT
        br.request_id,

        br.user_id,

        u.name AS requester_name,

        u.email AS requester_email,

        u.phone AS requester_phone,

        br.blood_group,

        br.units_required,

        br.units_fulfilled,

        (
          br.units_required -
          br.units_fulfilled
        ) AS units_remaining,

        br.request_date,

        br.required_by_date,

        br.urgency,

        br.hospital_name,

        br.address,

        br.city,

        br.status,

        br.notes,

        br.created_at,

        br.updated_at

      FROM blood_requests br

      INNER JOIN users u
        ON br.user_id = u.user_id

      ORDER BY
        CASE br.urgency
          WHEN 'EMERGENCY' THEN 1
          WHEN 'URGENT' THEN 2
          ELSE 3
        END,

        br.required_by_date ASC,

        br.created_at DESC
    `);

    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(
      "Get all blood requests error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch blood requests",
    });
  }
};

// ======================================================
// GET ALL DONATIONS FOR ADMIN
// ======================================================

const getAllDonations = async (req, res) => {
  try {
    const [donations] = await pool.query(`
      SELECT
        d.donation_id,

        d.user_id,

        u.name AS donor_name,

        u.email AS donor_email,

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

      ORDER BY
        d.donation_date DESC,
        d.created_at DESC
    `);

    res.json({
      success: true,
      donations,
    });
  } catch (error) {
    console.error(
      "Get all donations error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch donations",
    });
  }
};

// ======================================================
// GET COMPLETE BLOOD INVENTORY FOR ADMIN
// ======================================================

const getAllInventory = async (req, res) => {
  try {
    const [inventory] = await pool.query(`
      SELECT
        i.inventory_id,

        i.bank_id,

        b.bank_name,

        b.city,

        b.state,

        i.blood_group,

        i.units_available,

        i.last_updated

      FROM inventory i

      INNER JOIN blood_banks b
        ON i.bank_id = b.bank_id

      ORDER BY
        b.bank_name ASC,

        CASE i.blood_group
          WHEN 'O-' THEN 1
          WHEN 'O+' THEN 2
          WHEN 'A-' THEN 3
          WHEN 'A+' THEN 4
          WHEN 'B-' THEN 5
          WHEN 'B+' THEN 6
          WHEN 'AB-' THEN 7
          WHEN 'AB+' THEN 8
        END
    `);

    const lowInventoryThreshold = 5;

    const summary = {
      total_units: inventory.reduce(
        (total, item) =>
          total + Number(item.units_available || 0),
        0
      ),

      total_records: inventory.length,

      low_inventory: inventory.filter(
        (item) =>
          Number(item.units_available || 0) <=
          lowInventoryThreshold
      ).length,

      empty_inventory: inventory.filter(
        (item) =>
          Number(item.units_available || 0) === 0
      ).length,
    };

    res.json({
      success: true,
      summary,
      inventory,
    });
  } catch (error) {
    console.error(
      "Get all inventory error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    });
  }
};

// ======================================================
// GET AUDIT LOGS FOR ADMIN
// ======================================================

const getAuditLogs = async (req, res) => {
  try {
    const [logs] = await pool.query(`
      SELECT
        a.audit_id,

        a.user_id,

        u.name AS user_name,

        u.email AS user_email,

        u.role AS user_role,

        a.action,

        a.description,

        a.created_at

      FROM audit_logs a

      LEFT JOIN users u
        ON a.user_id = u.user_id

      ORDER BY
        a.created_at DESC,
        a.audit_id DESC
    `);

    res.json({
      success: true,
      audit_logs: logs,
    });
  } catch (error) {
    console.error(
      "Get audit logs error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getAllUsers,
  getAllDonors,
  getAllRecipients,
  getAllBloodBanks,
  updateUserStatus,
  getAdminDashboard,
  getAllBloodRequests,
  getAllDonations,
  getAllInventory,
  getAuditLogs,
};