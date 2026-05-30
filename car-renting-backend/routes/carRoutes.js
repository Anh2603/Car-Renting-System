const express = require("express");
const router = express.Router();

const {
  getCars,
  getCarById,
} = require("../controllers/carController");

// GET /api/cars
router.get("/", getCars);

// GET /api/cars/:id
router.get("/:id", getCarById);

module.exports = router;
