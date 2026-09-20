const pool = require("../config/database");
const { createAuditLog } = require("../services/auditService");
const {
  createNotificationsForUsers
} = require("../services/notificationService");

// =====================================================
// CONSTANTS
// =====================================================

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

const ALLOWED_URGENCIES = [
  "NORMAL",
  "URGENT",
  "EMERGENCY"
];

const ALLOWED_RESPONSE_STATUSES = [
  "INTERESTED",
  "ACCEPTED",
  "REJECTED",
  "COMPLETED"
];


// =====================================================
// BLOOD COMPATIBILITY
//
// Recipient blood group -> compatible donor groups
// =====================================================

const donorCompatibility = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": [
    "O-",
    "O+",
    "A-",
    "A+",
    "B-",
    "B+",
    "AB-",
    "AB+"
  ]
};


// =====================================================
// DONOR BLOOD GROUP -> REQUEST BLOOD GROUPS
// =====================================================

const recipientCompatibility = {
  "O-": [
    "O-",
    "O+",
    "A-",
    "A+",
    "B-",
    "B+",
    "AB-",
    "AB+"
  ],

  "O+": [
    "O+",
    "A+",
    "B+",
    "AB+"
  ],

  "A-": [
    "A-",
    "A+",
    "AB-",
    "AB+"
  ],

  "A+": [
    "A+",
    "AB+"
  ],

  "B-": [
    "B-",
    "B+",
    "AB-",
    "AB+"
  ],

  "B+": [
    "B+",
    "AB+"
  ],

  "AB-": [
    "AB-",
    "AB+"
  ],

  "AB+": [
    "AB+"
  ]
};


// =====================================================
// CREATE BLOOD REQUEST
// =====================================================

const createBloodRequest = async (req, res) => {
  try {
    const {
      blood_group,
      units_required,
      required_by_date,
      urgency,
      hospital_name,
      address,
      city,
      notes
    } = req.body;

    // -------------------------------------------------
    // VERIFY USER
    // -------------------------------------------------

    const [userRows] = await pool.query(
      `SELECT
        user_id,
        name,
        role,
        status,
        blood_group
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

    const user = userRows[0];

    if (user.role !== "USER") {
      return res.status(403).json({
        success: false,
        message: "Only USER accounts can create blood requests"
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active"
      });
    }

    // -------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------

    if (
      !blood_group ||
      !units_required ||
      !required_by_date ||
      !hospital_name
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Blood group, units required, required by date and hospital name are required"
      });
    }

    // -------------------------------------------------
    // BLOOD GROUP
    // -------------------------------------------------

    if (!ALLOWED_BLOOD_GROUPS.includes(blood_group)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood group"
      });
    }

    // -------------------------------------------------
    // UNITS
    // -------------------------------------------------

    const requestedUnits = Number(units_required);

    if (
      !Number.isInteger(requestedUnits) ||
      requestedUnits <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Units required must be a positive whole number"
      });
    }

    // -------------------------------------------------
    // MAXIMUM REQUEST SETTING
    // -------------------------------------------------

    const [settings] = await pool.query(
      `SELECT setting_value
       FROM system_settings
       WHERE setting_key = 'maximum_blood_request_units'`
    );

    let maximumUnits = 10;

    if (settings.length > 0) {
      maximumUnits = Number(settings[0].setting_value);
    }

    if (requestedUnits > maximumUnits) {
      return res.status(400).json({
        success: false,
        message: `Maximum blood request is ${maximumUnits} units`
      });
    }

    // -------------------------------------------------
    // URGENCY
    // -------------------------------------------------

    const requestUrgency = urgency || "NORMAL";

    if (!ALLOWED_URGENCIES.includes(requestUrgency)) {
      return res.status(400).json({
        success: false,
        message: "Invalid urgency"
      });
    }

    // -------------------------------------------------
    // EMERGENCY SETTING
    // -------------------------------------------------

    if (requestUrgency === "EMERGENCY") {
      const [emergencySetting] = await pool.query(
        `SELECT setting_value
         FROM system_settings
         WHERE setting_key = 'emergency_request_enabled'`
      );

      if (
        emergencySetting.length > 0 &&
        emergencySetting[0].setting_value !== "true"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Emergency blood requests are currently disabled"
        });
      }
    }

    // -------------------------------------------------
    // REQUIRED DATE
    // -------------------------------------------------

    const today = new Date()
      .toISOString()
      .split("T")[0];

    if (required_by_date < today) {
      return res.status(400).json({
        success: false,
        message: "Required by date cannot be in the past"
      });
    }

    // -------------------------------------------------
    // CREATE REQUEST
    // -------------------------------------------------

    const [result] = await pool.query(
      `INSERT INTO blood_requests
       (
         user_id,
         blood_group,
         units_required,
         units_fulfilled,
         required_by_date,
         urgency,
         hospital_name,
         address,
         city,
         status,
         notes
       )
       VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, 'PENDING', ?)`,
      [
        req.user.user_id,
        blood_group,
        requestedUnits,
        required_by_date,
        requestUrgency,
        hospital_name,
        address || null,
        city || null,
        notes || null
      ]
    );

    const requestId = result.insertId;

    // -------------------------------------------------
    // AUDIT LOG
    // -------------------------------------------------

    await createAuditLog({
      user_id: req.user.user_id,
      action: "CREATE_BLOOD_REQUEST",
      description:
        `Blood request #${requestId} created`
    });

    // -------------------------------------------------
    // FIND COMPATIBLE OTHER USERS
    //
    // IMPORTANT:
    // The requesting user is explicitly excluded.
    // -------------------------------------------------

    const compatibleGroups =
      donorCompatibility[blood_group] || [];

    let matchingUserIds = [];

    if (compatibleGroups.length > 0) {
      const placeholders = compatibleGroups
        .map(() => "?")
        .join(", ");

      const [matches] = await pool.query(
        `SELECT
          u.user_id,
          u.name,
          u.blood_group,
          u.city,
          u.state
         FROM users u
         WHERE u.role = 'USER'
           AND u.status = 'ACTIVE'
           AND u.availability_status = 'AVAILABLE'
           AND u.blood_group IN (${placeholders})
           AND u.user_id <> ?
         ORDER BY
           CASE
             WHEN u.blood_group = ? THEN 1
             ELSE 2
           END,
           u.city,
           u.name`,
        [
          ...compatibleGroups,
          req.user.user_id,
          blood_group
        ]
      );

      matchingUserIds = matches.map(
        (match) => match.user_id
      );
    }

    // -------------------------------------------------
    // NOTIFY COMPATIBLE USERS
    // -------------------------------------------------

    if (matchingUserIds.length > 0) {
      await createNotificationsForUsers({
        userIds: matchingUserIds,
        title: `${requestUrgency} Blood Request`,
        message:
          `A ${blood_group} blood request for ` +
          `${requestedUnits} unit(s) has been created at ` +
          `${hospital_name}. Please check your matching ` +
          `requests if you are available to donate.`,
        type: "BLOOD_REQUEST"
      });
    }

    // -------------------------------------------------
    // NOTIFY BLOOD BANKS
    // -------------------------------------------------

    const [bloodBankUsers] = await pool.query(
      `SELECT DISTINCT u.user_id
       FROM blood_banks b
       INNER JOIN users u
         ON b.user_id = u.user_id
       WHERE u.role = 'BLOOD_BANK'
         AND u.status = 'ACTIVE'
         AND b.user_id IS NOT NULL`
    );

    const bloodBankUserIds = bloodBankUsers.map(
      (bank) => bank.user_id
    );

    if (bloodBankUserIds.length > 0) {
      await createNotificationsForUsers({
        userIds: bloodBankUserIds,
        title: `New ${requestUrgency} Blood Request`,
        message:
          `A ${blood_group} blood request for ` +
          `${requestedUnits} unit(s) has been created at ` +
          `${hospital_name}. Please review the request ` +
          `in the Blood Bank dashboard.`,
        type: "BLOOD_REQUEST"
      });
    }

    // -------------------------------------------------
    // RETURN CREATED REQUEST
    // -------------------------------------------------

    const [requests] = await pool.query(
      `SELECT
        br.request_id,
        br.user_id,
        br.blood_group,
        br.units_required,
        br.units_fulfilled,
        br.request_date,
        br.required_by_date,
        br.urgency,
        br.hospital_name,
        br.address,
        br.city,
        br.status,
        br.notes,
        br.created_at,
        br.updated_at,
        u.name AS requester_name,
        u.phone AS requester_phone
       FROM blood_requests br
       INNER JOIN users u
         ON br.user_id = u.user_id
       WHERE br.request_id = ?`,
      [requestId]
    );

    res.status(201).json({
      success: true,
      message: "Blood request created successfully",
      request: requests[0],
      compatible_blood_groups: compatibleGroups,
      matching_users_count: matchingUserIds.length
    });

  } catch (error) {
    console.error(
      "Create blood request error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create blood request"
    });
  }
};


// =====================================================
// GET MY BLOOD REQUESTS
// =====================================================

const getMyBloodRequests = async (req, res) => {
  try {
    const [requests] = await pool.query(
      `SELECT
        br.request_id,
        br.user_id,
        br.blood_group,
        br.units_required,
        br.units_fulfilled,
        (
          br.units_required - br.units_fulfilled
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
       WHERE br.user_id = ?
       ORDER BY br.created_at DESC`,
      [req.user.user_id]
    );

    res.json({
      success: true,
      requests
    });

  } catch (error) {
    console.error(
      "Get my blood requests error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch blood requests"
    });
  }
};


// =====================================================
// GET COMPATIBLE USERS FOR A BLOOD REQUEST
// =====================================================

const getCompatibleDonors = async (req, res) => {
  try {
    const { request_id } = req.params;

    // -------------------------------------------------
    // GET REQUEST
    // -------------------------------------------------

    const [requests] = await pool.query(
      `SELECT
        br.request_id,
        br.user_id,
        br.blood_group,
        br.units_required,
        br.units_fulfilled,
        br.required_by_date,
        br.urgency,
        br.hospital_name,
        br.status
       FROM blood_requests br
       WHERE br.request_id = ?
         AND br.user_id = ?`,
      [
        request_id,
        req.user.user_id
      ]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found"
      });
    }

    const request = requests[0];

    // -------------------------------------------------
    // COMPATIBILITY
    // -------------------------------------------------

    const compatibleGroups =
      donorCompatibility[request.blood_group];

    if (!compatibleGroups) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood group in blood request"
      });
    }

    const placeholders = compatibleGroups
      .map(() => "?")
      .join(", ");

    // -------------------------------------------------
    // FIND OTHER USERS
    // -------------------------------------------------

    const [users] = await pool.query(
      `SELECT
        u.user_id,
        u.name,
        u.phone,
        u.blood_group,
        u.date_of_birth,
        u.gender,
        u.last_donation_date,
        u.availability_status,
        u.address,
        u.city,
        u.state,
        u.status
       FROM users u
       WHERE u.role = 'USER'
         AND u.status = 'ACTIVE'
         AND u.availability_status = 'AVAILABLE'
         AND u.blood_group IN (${placeholders})
         AND u.user_id <> ?
       ORDER BY
         CASE
           WHEN u.blood_group = ? THEN 1
           ELSE 2
         END,
         u.city,
         u.name`,
      [
        ...compatibleGroups,
        req.user.user_id,
        request.blood_group
      ]
    );

    res.json({
      success: true,
      request,
      compatible_blood_groups: compatibleGroups,
      users
    });

  } catch (error) {
    console.error(
      "Get compatible users error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to find compatible users"
    });
  }
};


// =====================================================
// GET SINGLE BLOOD REQUEST
// =====================================================

const getBloodRequestById = async (req, res) => {
  try {
    const { request_id } = req.params;

    const [requests] = await pool.query(
      `SELECT
        br.request_id,
        br.user_id,
        br.blood_group,
        br.units_required,
        br.units_fulfilled,
        (
          br.units_required - br.units_fulfilled
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
        br.updated_at,
        u.name AS requester_name,
        u.phone AS requester_phone
       FROM blood_requests br
       INNER JOIN users u
         ON br.user_id = u.user_id
       WHERE br.request_id = ?
         AND br.user_id = ?`,
      [
        request_id,
        req.user.user_id
      ]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found"
      });
    }

    res.json({
      success: true,
      request: requests[0]
    });

  } catch (error) {
    console.error(
      "Get blood request error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch blood request"
    });
  }
};


// =====================================================
// CANCEL BLOOD REQUEST
// =====================================================

const cancelBloodRequest = async (req, res) => {
  try {
    const { request_id } = req.params;

    const [requests] = await pool.query(
      `SELECT
        request_id,
        status
       FROM blood_requests
       WHERE request_id = ?
         AND user_id = ?`,
      [
        request_id,
        req.user.user_id
      ]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found"
      });
    }

    if (requests[0].status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending requests can be cancelled"
      });
    }

    await pool.query(
      `UPDATE blood_requests
       SET status = 'CANCELLED'
       WHERE request_id = ?
         AND user_id = ?`,
      [
        request_id,
        req.user.user_id
      ]
    );

    await createAuditLog({
      user_id: req.user.user_id,
      action: "CANCEL_BLOOD_REQUEST",
      description:
        `Blood request #${request_id} cancelled`
    });

    res.json({
      success: true,
      message:
        "Blood request cancelled successfully"
    });

  } catch (error) {
    console.error(
      "Cancel blood request error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to cancel blood request"
    });
  }
};


// =====================================================
// GET BLOOD REQUESTS MATCHING CURRENT USER
//
// A USER can be both:
// - requester
// - donor
//
// This endpoint shows requests this USER can donate to.
// =====================================================

const getDonorMatchingRequests = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT
        user_id,
        blood_group,
        availability_status
       FROM users
       WHERE user_id = ?
         AND role = 'USER'`,
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User profile not found"
      });
    }

    const user = users[0];

    if (!user.blood_group) {
      return res.json({
        success: true,
        user_blood_group: null,
        requests: []
      });
    }

    if (user.availability_status !== "AVAILABLE") {
      return res.json({
        success: true,
        user_blood_group: user.blood_group,
        requests: []
      });
    }

    const compatibleRecipientGroups =
      recipientCompatibility[user.blood_group];

    if (!compatibleRecipientGroups) {
      return res.status(400).json({
        success: false,
        message: "Invalid user blood group"
      });
    }

    const placeholders = compatibleRecipientGroups
      .map(() => "?")
      .join(", ");

    const [requests] = await pool.query(
      `SELECT
        br.request_id,
        br.user_id,
        br.blood_group,
        br.units_required,
        br.units_fulfilled,
        (
          br.units_required - br.units_fulfilled
        ) AS units_remaining,
        br.request_date,
        br.required_by_date,
        br.urgency,
        br.hospital_name,
        br.address,
        br.city,
        br.status,
        br.notes,
        u.name AS requester_name,
        u.phone AS requester_phone
       FROM blood_requests br
       INNER JOIN users u
         ON br.user_id = u.user_id
       WHERE br.blood_group IN (${placeholders})
         AND br.status IN (
           'PENDING',
           'ACCEPTED',
           'PARTIALLY_FULFILLED'
         )

         -- Never show the user's own requests
         AND br.user_id <> ?

         -- Do not show requests already responded to
         AND NOT EXISTS (
           SELECT 1
           FROM request_responses rr
           WHERE rr.request_id = br.request_id
             AND rr.user_id = ?
         )

       ORDER BY
         CASE br.urgency
           WHEN 'EMERGENCY' THEN 1
           WHEN 'URGENT' THEN 2
           ELSE 3
         END,
         br.required_by_date ASC,
         br.created_at DESC`,
      [
        ...compatibleRecipientGroups,
        req.user.user_id,
        req.user.user_id
      ]
    );

    res.json({
      success: true,
      user_blood_group: user.blood_group,
      compatible_recipient_groups:
        compatibleRecipientGroups,
      requests
    });

  } catch (error) {
    console.error(
      "Get matching blood requests error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch matching blood requests"
    });
  }
};


// =====================================================
// USER RESPONDS TO A BLOOD REQUEST
// =====================================================

const respondToBloodRequest = async (req, res) => {
  try {
    const { request_id } = req.params;
    const {
      response_status,
      notes
    } = req.body;

    // -------------------------------------------------
    // VALIDATE RESPONSE
    // -------------------------------------------------

    if (
      !ALLOWED_RESPONSE_STATUSES.includes(
        response_status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "response_status must be INTERESTED, ACCEPTED, REJECTED, or COMPLETED"
      });
    }

    // -------------------------------------------------
    // GET USER
    // -------------------------------------------------

    const [users] = await pool.query(
      `SELECT
        user_id,
        name,
        blood_group,
        availability_status,
        role,
        status
       FROM users
       WHERE user_id = ?
         AND role = 'USER'`,
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User profile not found"
      });
    }

    const user = users[0];

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active"
      });
    }

    if (!user.blood_group) {
      return res.status(400).json({
        success: false,
        message:
          "Please set your blood group before responding"
      });
    }

    if (
      user.availability_status !== "AVAILABLE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You must be available to donate blood"
      });
    }

    // -------------------------------------------------
    // GET REQUEST
    // -------------------------------------------------

    const [requests] = await pool.query(
      `SELECT
        request_id,
        user_id,
        blood_group,
        units_required,
        units_fulfilled,
        status
       FROM blood_requests
       WHERE request_id = ?`,
      [request_id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found"
      });
    }

    const request = requests[0];

    // -------------------------------------------------
    // PREVENT SELF RESPONSE
    // -------------------------------------------------

    if (
      Number(request.user_id) ===
      Number(req.user.user_id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot respond to your own blood request"
      });
    }

    // -------------------------------------------------
    // REQUEST STATUS
    // -------------------------------------------------

    if (
      ![
        "PENDING",
        "ACCEPTED",
        "PARTIALLY_FULFILLED"
      ].includes(request.status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This blood request is no longer accepting responses"
      });
    }

    // -------------------------------------------------
    // BLOOD COMPATIBILITY
    // -------------------------------------------------

    const compatibleRecipientGroups =
      recipientCompatibility[user.blood_group];

    if (
      !compatibleRecipientGroups ||
      !compatibleRecipientGroups.includes(
        request.blood_group
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your blood group is not compatible with this request"
      });
    }

    // -------------------------------------------------
    // CHECK EXISTING RESPONSE
    // -------------------------------------------------

    const [existingResponses] = await pool.query(
      `SELECT response_id
       FROM request_responses
       WHERE request_id = ?
         AND user_id = ?`,
      [
        request_id,
        req.user.user_id
      ]
    );

    if (existingResponses.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "You have already responded to this request"
      });
    }

    // -------------------------------------------------
    // INSERT RESPONSE
    // -------------------------------------------------

    const [result] = await pool.query(
      `INSERT INTO request_responses
       (
         request_id,
         user_id,
         response_status,
         notes
       )
       VALUES (?, ?, ?, ?)`,
      [
        request_id,
        req.user.user_id,
        response_status,
        notes || null
      ]
    );

    // -------------------------------------------------
    // RETURN RESPONSE
    // -------------------------------------------------

    const [savedResponse] = await pool.query(
      `SELECT
        rr.response_id,
        rr.request_id,
        rr.user_id,
        rr.response_status,
        rr.response_date,
        rr.notes,
        u.name,
        u.phone,
        u.blood_group,
        u.city,
        u.state
       FROM request_responses rr
       INNER JOIN users u
         ON rr.user_id = u.user_id
       WHERE rr.response_id = ?`,
      [result.insertId]
    );

    // -------------------------------------------------
    // NOTIFY REQUESTER
    // -------------------------------------------------

    if (
      response_status === "ACCEPTED" ||
      response_status === "INTERESTED"
    ) {
      await createNotificationsForUsers({
        userIds: [request.user_id],
        title:
          response_status === "ACCEPTED"
            ? "User Accepted Your Request"
            : "User Is Interested In Your Request",
        message:
          `A compatible user has ${response_status.toLowerCase()} ` +
          `your ${request.blood_group} blood request for ` +
          `${request.units_required} unit(s).`,
        type: "DONOR_RESPONSE"
      });
    }

    await createAuditLog({
      user_id: req.user.user_id,
      action: "RESPOND_TO_BLOOD_REQUEST",
      description:
        `User responded ${response_status} to blood request #${request_id}`
    });

    res.status(201).json({
      success: true,
      message: "Response submitted successfully",
      response: savedResponse[0]
    });

  } catch (error) {
    console.error(
      "Respond to blood request error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to submit response"
    });
  }
};


// =====================================================
// GET RESPONSES FOR MY BLOOD REQUEST
// =====================================================

const getBloodRequestResponses = async (req, res) => {
  try {
    const { request_id } = req.params;

    // -------------------------------------------------
    // VERIFY OWN REQUEST
    // -------------------------------------------------

    const [requests] = await pool.query(
      `SELECT
        request_id,
        user_id,
        blood_group,
        units_required,
        units_fulfilled,
        status
       FROM blood_requests
       WHERE request_id = ?
         AND user_id = ?`,
      [
        request_id,
        req.user.user_id
      ]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found"
      });
    }

    const [responses] = await pool.query(
      `SELECT
        rr.response_id,
        rr.request_id,
        rr.user_id,
        rr.response_status,
        rr.response_date,
        rr.notes,
        u.name,
        u.phone,
        u.blood_group,
        u.city,
        u.state,
        u.availability_status
       FROM request_responses rr
       INNER JOIN users u
         ON rr.user_id = u.user_id
       WHERE rr.request_id = ?
       ORDER BY
         CASE rr.response_status
           WHEN 'ACCEPTED' THEN 1
           WHEN 'INTERESTED' THEN 2
           WHEN 'COMPLETED' THEN 3
           WHEN 'REJECTED' THEN 4
           ELSE 5
         END,
         rr.response_date DESC`,
      [request_id]
    );

    res.json({
      success: true,
      request: requests[0],
      responses
    });

  } catch (error) {
    console.error(
      "Get blood request responses error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch request responses"
    });
  }
};


// =====================================================
// FULFILL BLOOD REQUEST
//
// BLOOD_BANK -> only its own bank
// ADMIN      -> any blood bank
// =====================================================

const fulfillBloodRequest = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const requestId = Number(
      req.params.request_id
    );

    const bankId = Number(
      req.body.bank_id
    );

    const units = Number(
      req.body.units
    );

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (
      !Number.isInteger(requestId) ||
      requestId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID"
      });
    }

    if (
      !Number.isInteger(bankId) ||
      bankId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid bank_id is required"
      });
    }

    if (
      !Number.isInteger(units) ||
      units <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Units must be a positive integer"
      });
    }

    await connection.beginTransaction();

    // -------------------------------------------------
    // LOCK REQUEST
    // -------------------------------------------------

    const [requests] = await connection.query(
      `SELECT
        request_id,
        user_id,
        blood_group,
        units_required,
        units_fulfilled,
        status,
        hospital_name,
        urgency,
        required_by_date
       FROM blood_requests
       WHERE request_id = ?
       FOR UPDATE`,
      [requestId]
    );

    if (requests.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Blood request not found"
      });
    }

    const request = requests[0];

    // -------------------------------------------------
    // STATUS
    // -------------------------------------------------

    if (
      ![
        "PENDING",
        "ACCEPTED",
        "PARTIALLY_FULFILLED"
      ].includes(request.status)
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          `Request cannot be fulfilled because its status is ${request.status}`
      });
    }

    // -------------------------------------------------
    // REMAINING UNITS
    // -------------------------------------------------

    const remainingUnits =
      request.units_required -
      request.units_fulfilled;

    if (remainingUnits <= 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "This request has already been fully fulfilled"
      });
    }

    if (units > remainingUnits) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          `Cannot fulfill ${units} units. ` +
          `Only ${remainingUnits} units remain`
      });
    }

    // -------------------------------------------------
    // VERIFY BLOOD BANK
    // -------------------------------------------------

    let bankQuery;
    let bankParams;

    if (req.user.role === "BLOOD_BANK") {
      bankQuery = `
        SELECT
          bank_id,
          bank_name
        FROM blood_banks
        WHERE bank_id = ?
          AND user_id = ?
        FOR UPDATE
      `;

      bankParams = [
        bankId,
        req.user.user_id
      ];

    } else if (req.user.role === "ADMIN") {
      bankQuery = `
        SELECT
          bank_id,
          bank_name
        FROM blood_banks
        WHERE bank_id = ?
        FOR UPDATE
      `;

      bankParams = [bankId];

    } else {
      await connection.rollback();

      return res.status(403).json({
        success: false,
        message:
          "Only BLOOD_BANK or ADMIN can fulfill blood requests"
      });
    }

    const [banks] = await connection.query(
      bankQuery,
      bankParams
    );

    if (banks.length === 0) {
      await connection.rollback();

      return res.status(403).json({
        success: false,
        message:
          req.user.role === "BLOOD_BANK"
            ? "You do not have access to this blood bank"
            : "Blood bank not found"
      });
    }

    // -------------------------------------------------
    // LOCK INVENTORY
    // -------------------------------------------------

    const [inventoryRows] =
      await connection.query(
        `SELECT
          inventory_id,
          bank_id,
          blood_group,
          units_available
         FROM inventory
         WHERE bank_id = ?
           AND blood_group = ?
         FOR UPDATE`,
        [
          bankId,
          request.blood_group
        ]
      );

    if (inventoryRows.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          `No ${request.blood_group} inventory found for this blood bank`
      });
    }

    const inventory =
      inventoryRows[0];

    if (
      inventory.units_available < units
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          `Insufficient ${request.blood_group} inventory. ` +
          `Available: ${inventory.units_available}, ` +
          `required: ${units}`
      });
    }

    const newInventoryUnits =
      inventory.units_available - units;

    // -------------------------------------------------
    // UPDATE INVENTORY
    // -------------------------------------------------

    await connection.query(
      `UPDATE inventory
       SET units_available = ?
       WHERE inventory_id = ?`,
      [
        newInventoryUnits,
        inventory.inventory_id
      ]
    );

    // -------------------------------------------------
    // UPDATE REQUEST
    // -------------------------------------------------

    const newFulfilledUnits =
      request.units_fulfilled + units;

    const newStatus =
      newFulfilledUnits >=
      request.units_required
        ? "FULFILLED"
        : "PARTIALLY_FULFILLED";

    await connection.query(
      `UPDATE blood_requests
       SET
         units_fulfilled = ?,
         status = ?
       WHERE request_id = ?`,
      [
        newFulfilledUnits,
        newStatus,
        requestId
      ]
    );

    await connection.commit();

    // -------------------------------------------------
    // AUDIT
    // -------------------------------------------------

    await createAuditLog({
      user_id: req.user.user_id,
      action: "FULFILL_BLOOD_REQUEST",
      description:
        `Blood request #${requestId} ` +
        `${newStatus === "FULFILLED"
          ? "fulfilled"
          : "partially fulfilled"} ` +
        `with ${units} unit(s) of ` +
        `${request.blood_group} from blood bank #${bankId}`
    });

    await createAuditLog({
      user_id: req.user.user_id,
      action: "INVENTORY_UPDATE",
      description:
        `Inventory decreased by ${units} unit(s) ` +
        `of ${request.blood_group} at blood bank ` +
        `#${bankId} for blood request #${requestId}`
    });

    // -------------------------------------------------
    // NOTIFY REQUESTER
    // -------------------------------------------------

    await createNotificationsForUsers({
      userIds: [request.user_id],
      title:
        newStatus === "FULFILLED"
          ? "Blood Request Fulfilled"
          : "Blood Request Partially Fulfilled",
      message:
        `${units} unit(s) of ${request.blood_group} ` +
        `have been ${newStatus === "FULFILLED"
          ? "provided"
          : "fulfilled"} for your blood request.`,
      type: "BLOOD_REQUEST"
    });

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.json({
      success: true,
      message:
        newStatus === "FULFILLED"
          ? "Blood request fulfilled successfully"
          : "Blood request partially fulfilled successfully",

      fulfillment: {
        request_id: requestId,
        blood_group:
          request.blood_group,
        units_fulfilled_now: units,
        units_fulfilled_total:
          newFulfilledUnits,
        units_required:
          request.units_required,
        remaining_units:
          request.units_required -
          newFulfilledUnits,
        status: newStatus,
        bank_id: bankId,
        bank_name:
          banks[0].bank_name,
        inventory_remaining:
          newInventoryUnits
      }
    });

  } catch (error) {
    await connection.rollback();

    console.error(
      "Fulfill blood request error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fulfill blood request"
    });

  } finally {
    connection.release();
  }
};


// =====================================================
// GET BLOOD BANK REQUESTS
// =====================================================

const getBloodBankRequests = async (req, res) => {
  try {
    const [requests] = await pool.query(
      `SELECT
        br.request_id,
        br.user_id,
        u.name AS requester_name,
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
        br.notes
       FROM blood_requests br
       INNER JOIN users u
         ON br.user_id = u.user_id
       WHERE br.status IN (
         'PENDING',
         'ACCEPTED',
         'PARTIALLY_FULFILLED'
       )
       ORDER BY
         FIELD(
           br.urgency,
           'EMERGENCY',
           'URGENT',
           'NORMAL'
         ),
         br.required_by_date ASC,
         br.request_date ASC`
    );

    res.json({
      success: true,
      requests
    });

  } catch (error) {
    console.error(
      "Get blood bank requests error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch blood bank requests"
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createBloodRequest,
  getMyBloodRequests,
  getCompatibleDonors,
  getBloodRequestById,
  cancelBloodRequest,
  getDonorMatchingRequests,
  respondToBloodRequest,
  getBloodRequestResponses,
  fulfillBloodRequest,
  getBloodBankRequests
};