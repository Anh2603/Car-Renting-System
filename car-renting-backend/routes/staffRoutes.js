const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getDashboard,
  getBookings,
  getBookingById,
  markPickedUp,
  completeBooking,
  cancelBooking,
  getCars,
  updateCarStatus,
} = require("../controllers/staffController");

router.use(authMiddleware, roleMiddleware("STAFF", "ADMIN"));

router.get("/dashboard", getDashboard);

router.get("/bookings", getBookings);
router.get("/bookings/:id", getBookingById);
router.patch("/bookings/:id/pickup", markPickedUp);
router.patch("/bookings/:id/complete", completeBooking);
router.patch("/bookings/:id/cancel", cancelBooking);

router.get("/cars", getCars);
router.patch("/cars/:id/status", updateCarStatus);

module.exports = router;
