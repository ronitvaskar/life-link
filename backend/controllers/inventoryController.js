const pool = require("../config/database");

// GET ALL INVENTORY
const getInventory = async (req, res) => {
  try {
    let inventory;

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
          message: "Blood bank profile not found"
        });
      }

      const bankId = banks[0].bank_id;

      [inventory] = await pool.query(
        `SELECT
          i.inventory_id,
          i.bank_id,
          b.bank_name,
          i.blood_group,
          i.units_available,
          i.last_updated
         FROM inventory i
         INNER JOIN blood_banks b
           ON i.bank_id = b.bank_id
         WHERE i.bank_id = ?
         ORDER BY
           FIELD(
             i.blood_group,
             'O-', 'O+',
             'A-', 'A+',
             'B-', 'B+',
             'AB-', 'AB+'
           )`,
        [bankId]
      );

    } else {
      // ADMIN can see inventory for all blood banks
      [inventory] = await pool.query(
        `SELECT
          i.inventory_id,
          i.bank_id,
          b.bank_name,
          i.blood_group,
          i.units_available,
          i.last_updated
         FROM inventory i
         INNER JOIN blood_banks b
           ON i.bank_id = b.bank_id
         ORDER BY
           i.bank_id,
           FIELD(
             i.blood_group,
             'O-', 'O+',
             'A-', 'A+',
             'B-', 'B+',
             'AB-', 'AB+'
           )`
      );
    }

    res.json({
      success: true,
      inventory
    });

  } catch (error) {
    console.error("Get inventory error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory"
    });
  }
};

const getBloodBankDashboard = async (req, res) => {
  try {
    let bankId;

    if (req.user.role === "BLOOD_BANK") {
      const [banks] = await pool.query(
        `SELECT bank_id, bank_name
         FROM blood_banks
         WHERE user_id = ?`,
        [req.user.user_id]
      );

      if (banks.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Blood bank profile not found"
        });
      }

      bankId = banks[0].bank_id;
    }

    if (req.user.role === "ADMIN") {
      bankId = req.query.bank_id
        ? Number(req.query.bank_id)
        : null;
    }

    /*
     * Get actual inventory records
     */
    const inventoryParams = bankId ? [bankId] : [];

    const inventoryWhere = bankId
      ? "WHERE i.bank_id = ?"
      : "";

    const [inventory] = await pool.query(
      `SELECT
        i.inventory_id,
        i.bank_id,
        b.bank_name,
        i.blood_group,
        i.units_available,
        i.last_updated
       FROM inventory i
       INNER JOIN blood_banks b
         ON i.bank_id = b.bank_id
       ${inventoryWhere}
       ORDER BY
         FIELD(
           i.blood_group,
           'O-', 'O+',
           'A-', 'A+',
           'B-', 'B+',
           'AB-', 'AB+'
         )`,
      inventoryParams
    );

    /*
     * Inventory summary
     */
    const [inventorySummary] = await pool.query(
      `SELECT
        COALESCE(SUM(i.units_available), 0) AS total_units,
        COUNT(*) AS blood_group_count,
        COALESCE(
          SUM(
            CASE
              WHEN i.units_available <= CAST(
                (
                  SELECT setting_value
                  FROM system_settings
                  WHERE setting_key = 'low_inventory_threshold'
                  LIMIT 1
                ) AS UNSIGNED
              )
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS low_stock_groups
       FROM inventory i
       ${inventoryWhere}`,
      inventoryParams
    );

    /*
     * Pending / active requests
     */
    const [pendingRequests] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM blood_requests br
       WHERE br.status IN (
         'PENDING',
         'ACCEPTED',
         'PARTIALLY_FULFILLED'
       )`
    );

    /*
     * Donation summary
     */
    const donationParams = bankId ? [bankId] : [];

    const [donationSummary] = await pool.query(
      `SELECT
        COUNT(*) AS total_donations,
        COALESCE(
          SUM(
            CASE
              WHEN status = 'COMPLETED'
              THEN units
              ELSE 0
            END
          ),
          0
        ) AS donated_units
       FROM donations
       ${bankId ? "WHERE bank_id = ?" : ""}`,
      donationParams
    );

    res.json({
      success: true,

      bank_id: bankId,

      inventory,

      summary: inventorySummary[0],

      pending_requests: pendingRequests[0].count,

      donations: donationSummary[0]
    });

  } catch (error) {
    console.error(
      "Get blood bank dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch blood bank dashboard"
    });
  }
};

module.exports = {
  getInventory,
  getBloodBankDashboard
};