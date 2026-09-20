const pool = require("../config/database");

// Get complete reports/statistics for Admin
const getReports = async (req, res) => {
  try {
    // 1. Monthly donations
    const [monthlyDonations] = await pool.query(`
      SELECT
        DATE_FORMAT(donation_date, '%Y-%m') AS month,
        COUNT(*) AS donation_count,
        COALESCE(SUM(units), 0) AS total_units
      FROM donations
      WHERE status = 'COMPLETED'
      GROUP BY DATE_FORMAT(donation_date, '%Y-%m')
      ORDER BY month ASC
    `);

    // 2. Monthly blood requests
    const [monthlyRequests] = await pool.query(`
      SELECT
        DATE_FORMAT(request_date, '%Y-%m') AS month,
        COUNT(*) AS request_count,
        COALESCE(SUM(units_required), 0) AS units_requested,
        COALESCE(SUM(units_fulfilled), 0) AS units_fulfilled
      FROM blood_requests
      GROUP BY DATE_FORMAT(request_date, '%Y-%m')
      ORDER BY month ASC
    `);

    // 3. Current inventory by blood group
    const [inventoryByGroup] = await pool.query(`
      SELECT
        blood_group,
        COALESCE(SUM(units_available), 0) AS units_available
      FROM inventory
      GROUP BY blood_group
      ORDER BY
        CASE blood_group
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

    // 4. Most requested blood groups
    const [mostRequestedGroups] = await pool.query(`
      SELECT
        blood_group,
        COUNT(*) AS request_count,
        COALESCE(SUM(units_required), 0) AS units_requested
      FROM blood_requests
      GROUP BY blood_group
      ORDER BY units_requested DESC, request_count DESC
    `);

    // 5. Most donated blood groups
    const [mostDonatedGroups] = await pool.query(`
      SELECT
        blood_group,
        COUNT(*) AS donation_count,
        COALESCE(SUM(units), 0) AS units_donated
      FROM donations
      WHERE status = 'COMPLETED'
      GROUP BY blood_group
      ORDER BY units_donated DESC, donation_count DESC
    `);

    // 6. Request status statistics
    const [requestStatuses] = await pool.query(`
      SELECT
        status,
        COUNT(*) AS request_count
      FROM blood_requests
      GROUP BY status
      ORDER BY request_count DESC
    `);

    // 7. Active donors
    // In the new architecture, donors are USER accounts
    // with a blood group and AVAILABLE donation status.
    const [[activeDonors]] = await pool.query(`
      SELECT
        COUNT(*) AS active_donors
      FROM users
      WHERE role = 'USER'
        AND status = 'ACTIVE'
        AND blood_group IS NOT NULL
        AND availability_status = 'AVAILABLE'
    `);

    // 8. Blood bank performance
    const [bloodBankPerformance] = await pool.query(`
      SELECT
        b.bank_id,
        b.bank_name,
        b.city,

        COALESCE(d.completed_donations, 0) AS completed_donations,
        COALESCE(d.donated_units, 0) AS donated_units,
        COALESCE(i.current_inventory, 0) AS current_inventory

      FROM blood_banks b

      LEFT JOIN (
        SELECT
          bank_id,
          COUNT(*) AS completed_donations,
          COALESCE(SUM(units), 0) AS donated_units
        FROM donations
        WHERE status = 'COMPLETED'
        GROUP BY bank_id
      ) d
        ON b.bank_id = d.bank_id

      LEFT JOIN (
        SELECT
          bank_id,
          COALESCE(SUM(units_available), 0) AS current_inventory
        FROM inventory
        GROUP BY bank_id
      ) i
        ON b.bank_id = i.bank_id

      ORDER BY donated_units DESC
    `);

    // 9. Overall summary
    const [[summary]] = await pool.query(`
      SELECT
        (
          SELECT COUNT(*)
          FROM users
          WHERE role = 'USER'
        ) AS total_users,

        (
          SELECT COUNT(*)
          FROM users
          WHERE role = 'USER'
            AND status = 'ACTIVE'
            AND blood_group IS NOT NULL
            AND availability_status = 'AVAILABLE'
        ) AS active_donors,

        (
          SELECT COUNT(DISTINCT user_id)
          FROM blood_requests
        ) AS total_recipients,

        (
          SELECT COUNT(*)
          FROM blood_banks
        ) AS total_blood_banks,

        (
          SELECT COUNT(*)
          FROM blood_requests
        ) AS total_requests,

        (
          SELECT COUNT(*)
          FROM blood_requests
          WHERE status = 'FULFILLED'
        ) AS fulfilled_requests,

        (
          SELECT COUNT(*)
          FROM donations
          WHERE status = 'COMPLETED'
        ) AS completed_donations,

        (
          SELECT COALESCE(SUM(units), 0)
          FROM donations
          WHERE status = 'COMPLETED'
        ) AS donated_units,

        (
          SELECT COALESCE(SUM(units_available), 0)
          FROM inventory
        ) AS current_inventory
    `);

    res.json({
      success: true,

      summary: {
        total_users: Number(summary.total_users || 0),
        active_donors: Number(summary.active_donors || 0),
        total_recipients: Number(summary.total_recipients || 0),
        total_blood_banks: Number(summary.total_blood_banks || 0),
        total_requests: Number(summary.total_requests || 0),
        fulfilled_requests: Number(summary.fulfilled_requests || 0),
        completed_donations: Number(summary.completed_donations || 0),
        donated_units: Number(summary.donated_units || 0),
        current_inventory: Number(summary.current_inventory || 0),
      },

      monthly_donations: monthlyDonations.map((row) => ({
        month: row.month,
        donation_count: Number(row.donation_count || 0),
        total_units: Number(row.total_units || 0),
      })),

      monthly_requests: monthlyRequests.map((row) => ({
        month: row.month,
        request_count: Number(row.request_count || 0),
        units_requested: Number(row.units_requested || 0),
        units_fulfilled: Number(row.units_fulfilled || 0),
      })),

      inventory_by_group: inventoryByGroup.map((row) => ({
        blood_group: row.blood_group,
        units_available: Number(row.units_available || 0),
      })),

      most_requested_groups: mostRequestedGroups.map((row) => ({
        blood_group: row.blood_group,
        request_count: Number(row.request_count || 0),
        units_requested: Number(row.units_requested || 0),
      })),

      most_donated_groups: mostDonatedGroups.map((row) => ({
        blood_group: row.blood_group,
        donation_count: Number(row.donation_count || 0),
        units_donated: Number(row.units_donated || 0),
      })),

      request_statuses: requestStatuses.map((row) => ({
        status: row.status,
        request_count: Number(row.request_count || 0),
      })),

      active_donors: Number(activeDonors.active_donors || 0),

      blood_bank_performance: bloodBankPerformance.map((row) => ({
        bank_id: row.bank_id,
        bank_name: row.bank_name,
        city: row.city,
        completed_donations: Number(row.completed_donations || 0),
        donated_units: Number(row.donated_units || 0),
        current_inventory: Number(row.current_inventory || 0),
      })),
    });
  } catch (error) {
    console.error("Get reports error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate reports",
    });
  }
};

module.exports = {
  getReports,
};