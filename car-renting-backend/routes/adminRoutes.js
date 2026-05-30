const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getDashboard,
  getCars,
  createCar,
  updateCar,
  updateCarStatus,
  getBookings,
  getBookingById,
  updateBookingStatus,
  getUsers,
  updateUserStatus,
  getStaff,
  createStaff,
  getPayments,
  updatePaymentStatus,
} = require("../controllers/adminController");

router.use(authMiddleware, roleMiddleware("ADMIN"));

router.get("/dashboard", getDashboard);

router.get("/cars", getCars);
router.post("/cars", createCar);
router.put("/cars/:id", updateCar);
router.patch("/cars/:id/status", updateCarStatus);

router.get("/bookings", getBookings);
router.get("/bookings/:id", getBookingById);
router.patch("/bookings/:id/status", updateBookingStatus);

router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatus);

router.get("/staff", getStaff);
router.post("/staff", createStaff);
router.patch("/staff/:id/status", updateUserStatus);

router.get("/payments", getPayments);
router.patch("/payments/:id/status", updatePaymentStatus);

module.exports = router;
