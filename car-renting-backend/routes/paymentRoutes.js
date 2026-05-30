const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createPayment,
  getPaymentByBookingId,
} = require("../controllers/paymentController");

// User checkout payment
router.post("/", authMiddleware, createPayment);

// User/Admin/Staff can read a payment linked to a booking
router.get("/booking/:bookingId", authMiddleware, getPaymentByBookingId);

module.exports = router;
