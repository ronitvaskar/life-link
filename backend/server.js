const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const donationRoutes = require("./routes/donationRoutes");
const bloodRequestRoutes = require("./routes/bloodRequestRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const bloodBankRoutes = require("./routes/bloodBankRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const {
  authenticateToken,
  authorizeRoles,
} = require("./middleware/authMiddleware");

const app = express();

// ======================================================
// APPLICATION SETTINGS
// ======================================================

app.disable("x-powered-by");

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Life Link API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

// ======================================================
// API HEALTH CHECK
// ======================================================

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      success: true,
      message: "Life Link API and database are healthy",
      database: "connected",
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    console.error("Health check database error:", error);

    res.status(503).json({
      success: false,
      message: "Life Link API is running but database is unavailable",
      database: "disconnected",
    });
  }
});

// ======================================================
// DATABASE TEST
// ======================================================

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS test");

    res.status(200).json({
      success: true,
      message: "MySQL database connection successful",
      result: rows,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "MySQL database connection failed",
    });
  }
});

// ======================================================
// AUTHENTICATION ROUTES
// ======================================================

app.use("/api/auth", authRoutes);

// ======================================================
// USER ROUTES
// ======================================================
//
// USER includes:
// - Blood donor functionality
// - Blood recipient functionality
//

app.use("/api/users", userRoutes);

// ======================================================
// DONATION ROUTES
// ======================================================

app.use("/api/donations", donationRoutes);

// ======================================================
// BLOOD REQUEST ROUTES
// ======================================================

app.use("/api/blood-requests", bloodRequestRoutes);

// ======================================================
// INVENTORY ROUTES
// ======================================================

app.use("/api/inventory", inventoryRoutes);

// ======================================================
// BLOOD BANK ROUTES
// ======================================================

app.use("/api/blood-banks", bloodBankRoutes);

// ======================================================
// NOTIFICATION ROUTES
// ======================================================

app.use("/api/notifications", notificationRoutes);

// ======================================================
// ADMIN ROUTES
// ======================================================

app.use("/api/admin", adminRoutes);

// ======================================================
// ADMIN SETTINGS ROUTES
// ======================================================

app.use("/api/admin/settings", settingsRoutes);

// ======================================================
// PROTECTED TEST ROUTE
// ======================================================

app.get(
  "/api/test-protected",
  authenticateToken,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "You accessed a protected route",
      user: req.user,
    });
  }
);

// ======================================================
// USER AUTHORIZATION TEST ROUTE
// ======================================================

app.get(
  "/api/test-user",
  authenticateToken,
  authorizeRoles("USER"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "USER authorization successful",
      user: req.user,
    });
  }
);

// ======================================================
// BLOOD BANK AUTHORIZATION TEST ROUTE
// ======================================================

app.get(
  "/api/test-blood-bank",
  authenticateToken,
  authorizeRoles("BLOOD_BANK"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "BLOOD_BANK authorization successful",
      user: req.user,
    });
  }
);

// ======================================================
// ADMIN AUTHORIZATION TEST ROUTE
// ======================================================

app.get(
  "/api/test-admin",
  authenticateToken,
  authorizeRoles("ADMIN"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "ADMIN authorization successful",
      user: req.user,
    });
  }
);

// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error",
  });
});

// ======================================================
// START SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log("==============================================");
  console.log("           LIFE LINK API SERVER");
  console.log("==============================================");
  console.log(`Environment : ${process.env.NODE_ENV || "development"}`);
  console.log(`Port        : ${PORT}`);
  console.log(`Host        : ${HOST}`);
  console.log("API Status  : Running");
  console.log("==============================================");
});