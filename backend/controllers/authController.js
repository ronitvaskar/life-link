const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { createAuditLog } = require("../services/auditService");

// ======================================================
// REGISTER
// ======================================================
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role
    } = req.body;

    // --------------------------------------------------
    // Basic validation
    // --------------------------------------------------
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    // --------------------------------------------------
    // Normalize role
    //
    // USER is the normal Life Link account.
    // A USER can both request and donate blood.
    // --------------------------------------------------
    const requestedRole = role
      ? String(role).trim().toUpperCase()
      : "USER";

    // --------------------------------------------------
    // Public registration roles
    //
    // ADMIN is intentionally NOT allowed here.
    // --------------------------------------------------
    const allowedRoles = [
      "USER",
      "BLOOD_BANK"
    ];

    if (!allowedRoles.includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration role"
      });
    }

    // --------------------------------------------------
    // Clean email
    // --------------------------------------------------
    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    // --------------------------------------------------
    // Check whether email already exists
    // --------------------------------------------------
    const [existingUsers] = await pool.query(
      `
      SELECT user_id
      FROM users
      WHERE email = ?
      `,
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    // --------------------------------------------------
    // Hash password
    // --------------------------------------------------
    const hashedPassword = await bcrypt.hash(password, 10);

    // --------------------------------------------------
    // Create user
    // --------------------------------------------------
    const [result] = await pool.query(
      `
      INSERT INTO users
      (
        name,
        email,
        password,
        phone,
        role,
        status
      )
      VALUES (?, ?, ?, ?, ?, 'ACTIVE')
      `,
      [
        String(name).trim(),
        normalizedEmail,
        hashedPassword,
        phone ? String(phone).trim() : null,
        requestedRole
      ]
    );

    // --------------------------------------------------
    // Audit log
    // --------------------------------------------------
    await createAuditLog({
      user_id: result.insertId,
      action: "REGISTER",
      description: `User registered with role ${requestedRole}`
    });

    // --------------------------------------------------
    // Response
    // --------------------------------------------------
    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        user_id: result.insertId,
        name: String(name).trim(),
        email: normalizedEmail,
        phone: phone ? String(phone).trim() : null,
        role: requestedRole
      }
    });

  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
};


// ======================================================
// LOGIN
// ======================================================
const login = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    // --------------------------------------------------
    // Validation
    // --------------------------------------------------
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // --------------------------------------------------
    // Normalize email
    // --------------------------------------------------
    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    // --------------------------------------------------
    // Find user
    // --------------------------------------------------
    const [users] = await pool.query(
      `
      SELECT
        user_id,
        name,
        email,
        password,
        phone,
        role,
        status
      FROM users
      WHERE email = ?
      `,
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = users[0];

    // --------------------------------------------------
    // Check account status
    // --------------------------------------------------
    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Account is not active"
      });
    }

    // --------------------------------------------------
    // Validate role from database
    //
    // Final valid application roles:
    // USER
    // BLOOD_BANK
    // ADMIN
    // --------------------------------------------------
    const validRoles = [
      "USER",
      "BLOOD_BANK",
      "ADMIN"
    ];

    if (!validRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Invalid account role"
      });
    }

    // --------------------------------------------------
    // Compare password
    // --------------------------------------------------
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // --------------------------------------------------
    // Create JWT
    // --------------------------------------------------
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d"
      }
    );

    // --------------------------------------------------
    // Audit login
    // --------------------------------------------------
    await createAuditLog({
      user_id: user.user_id,
      action: "LOGIN",
      description: "User logged in successfully"
    });

    // --------------------------------------------------
    // Never return password
    // --------------------------------------------------
    delete user.password;

    // --------------------------------------------------
    // Response
    // --------------------------------------------------
    res.json({
      success: true,
      message: "Login successful",
      token,
      user
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};


// ======================================================
// EXPORTS
// ======================================================
module.exports = {
  register,
  login
};