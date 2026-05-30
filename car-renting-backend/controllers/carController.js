const db = require("../config/db");

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VALID_CATEGORIES = new Set(["ECONOMY", "SUV", "PREMIUM"]);

const normalizeDate = (dateValue) => {
  if (!dateValue) return null;

  if (typeof dateValue === "string") {
    const trimmed = dateValue.trim();

    if (DATE_ONLY_REGEX.test(trimmed)) {
      return trimmed;
    }

    if (trimmed.includes("T")) {
      const dateOnly = trimmed.split("T")[0];
      return DATE_ONLY_REGEX.test(dateOnly) ? dateOnly : null;
    }
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString().split("T")[0];
};

const formatCar = (car) => ({
  id: car.id,
  name: car.name,
  brand: car.brand,
  model: car.model,
  year: car.year,
  category: car.category,
  price_per_day: Number(car.price_per_day),
  pricePerDay: Number(car.price_per_day),
  image_url: car.image_url,
  imageUrl: car.image_url,
  transmission: car.transmission,
  fuel_type: car.fuel_type,
  fuelType: car.fuel_type,
  seats: car.seats,
  status: car.status,
  description: car.description,
  created_at: car.created_at,
  updated_at: car.updated_at,
});

const getCars = async (req, res) => {
  try {
    const category = req.query.category
      ? String(req.query.category).trim().toUpperCase()
      : null;
    const pickupDate = normalizeDate(req.query.pickupDate || req.query.pickup_date);
    const returnDate = normalizeDate(req.query.returnDate || req.query.return_date);
    const search = req.query.search ? String(req.query.search).trim() : null;

    if (category && !VALID_CATEGORIES.has(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category. Expected ECONOMY, SUV, or PREMIUM.",
      });
    }

    if ((req.query.pickupDate || req.query.pickup_date) && !pickupDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickupDate. Expected format: YYYY-MM-DD.",
      });
    }

    if ((req.query.returnDate || req.query.return_date) && !returnDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid returnDate. Expected format: YYYY-MM-DD.",
      });
    }

    if ((pickupDate && !returnDate) || (!pickupDate && returnDate)) {
      return res.status(400).json({
        success: false,
        message: "Both pickupDate and returnDate are required for availability filtering.",
      });
    }

    if (pickupDate && returnDate && new Date(returnDate) <= new Date(pickupDate)) {
      return res.status(400).json({
        success: false,
        message: "returnDate must be after pickupDate.",
      });
    }

    const where = ["c.status = 'AVAILABLE'"];
    const params = [];

    if (category) {
      where.push("c.category = ?");
      params.push(category);
    }

    if (search) {
      where.push("(c.name LIKE ? OR c.brand LIKE ? OR c.model LIKE ? OR c.category LIKE ?)");
      const keyword = `%${search}%`;
      params.push(keyword, keyword, keyword, keyword);
    }

    if (pickupDate && returnDate) {
      where.push(`
        NOT EXISTS (
          SELECT 1
          FROM bookings b
          WHERE b.car_id = c.id
            AND b.status IN ('PENDING', 'CONFIRMED', 'PICKED_UP')
            AND b.pickup_date < ?
            AND b.return_date > ?
        )
      `);
      params.push(returnDate, pickupDate);
    }

    const [cars] = await db.query(
      `
      SELECT
        c.id,
        c.name,
        c.brand,
        c.model,
        c.year,
        c.category,
        c.price_per_day,
        c.image_url,
        c.transmission,
        c.fuel_type,
        c.seats,
        c.status,
        c.description,
        c.created_at,
        c.updated_at
      FROM cars c
      WHERE ${where.join(" AND ")}
      ORDER BY
        FIELD(c.category, 'ECONOMY', 'SUV', 'PREMIUM'),
        c.price_per_day ASC,
        c.id ASC
      `,
      params
    );

    return res.json({
      success: true,
      message: "Cars retrieved successfully",
      data: cars.map(formatCar),
    });
  } catch (error) {
    console.error("Get cars error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while retrieving cars",
      error: error.message,
    });
  }
};

const getCarById = async (req, res) => {
  try {
    const carId = Number(req.params.id);

    if (!carId) {
      return res.status(400).json({
        success: false,
        message: "Valid car ID is required",
      });
    }

    const [cars] = await db.query(
      `
      SELECT
        id,
        name,
        brand,
        model,
        year,
        category,
        price_per_day,
        image_url,
        transmission,
        fuel_type,
        seats,
        status,
        description,
        created_at,
        updated_at
      FROM cars
      WHERE id = ?
      LIMIT 1
      `,
      [carId]
    );

    if (cars.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    return res.json({
      success: true,
      message: "Car retrieved successfully",
      data: formatCar(cars[0]),
    });
  } catch (error) {
    console.error("Get car by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while retrieving car",
      error: error.message,
    });
  }
};

module.exports = {
  getCars,
  getAllCars: getCars,
  getCarById,
};
