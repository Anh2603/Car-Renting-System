const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const db = require("./config/db");
const carRoutes = require("./routes/carRoutes");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const staffRoutes = require("./routes/staffRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Car Renting Backend API is running",
    status: "OK",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend server is healthy",
  });
});

app.use("/api/cars", carRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/contact", contactRoutes);

if (process.env.NODE_ENV !== "production") {
  app.get("/api/db-test", async (req, res) => {
    try {
      const [rows] = await db.query("SELECT DATABASE() AS database_name");

      res.json({
        success: true,
        message: "MySQL connection successful",
        database: rows[0].database_name,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "MySQL connection failed",
        error: error.message,
      });
    }
  });
}

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
