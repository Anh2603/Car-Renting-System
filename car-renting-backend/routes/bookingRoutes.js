const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createBooking,
  getMyBookings,
  cancelMyBooking,
} = require("../controllers/bookingController");

// POST /api/bookings
router.post("/", authMiddleware, createBooking);

// GET /api/bookings/my-bookings
router.get("/my-bookings", authMiddleware, getMyBookings);

// PUT /api/bookings/:id/cancel
router.put("/:id/cancel", authMiddleware, cancelMyBooking);

module.exports = router;