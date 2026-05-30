const db = require("../config/db");

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "PICKED_UP", "COMPLETED", "CANCELLED"];
const CAR_STATUSES = ["AVAILABLE", "RENTED", "MAINTENANCE"];

const toNumber = (value) => Number(value || 0);

const normalizeEnum = (value, allowedValues, fallback = null) => {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toUpperCase();
  return allowedValues.includes(normalized) ? normalized : null;
};

const mapBooking = (booking) => ({
  ...booking,
  total_price: toNumber(booking.total_price),
  price_per_day: toNumber(booking.price_per_day),
  payment_amount:
    booking.payment_amount === null || booking.payment_amount === undefined
      ? null
      : toNumber(booking.payment_amount),
});

const getBookingRows = async ({ status = null, search = null, limit = null } = {}) => {
  const params = [];
  const whereParts = [];

  if (status) {
    whereParts.push("b.status = ?");
    params.push(status);
  } else {
    whereParts.push("b.status IN ('PENDING', 'CONFIRMED', 'PICKED_UP', 'COMPLETED', 'CANCELLED')");
  }

  if (search) {
    whereParts.push(`(
      b.id LIKE ?
      OR u.full_name LIKE ?
      OR u.email LIKE ?
      OR b.renter_name LIKE ?
      OR b.renter_phone LIKE ?
      OR c.name LIKE ?
    )`);
    const like = `%${search}%`;
    params.push(like, like, like, like, like, like);
  }

  const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
  const limitSql = limit ? "LIMIT ?" : "";
  const queryParams = limit ? [...params, Number(limit)] : params;

  const [rows] = await db.query(
    `
    SELECT
      b.id,
      b.user_id,
      b.car_id,
      b.renter_name,
      b.renter_phone,
      b.driver_license_number,
      b.pickup_address,
      b.customer_note,
      b.pickup_location,
      b.return_location,
      DATE_FORMAT(b.pickup_date, '%Y-%m-%d') AS pickup_date,
      DATE_FORMAT(b.return_date, '%Y-%m-%d') AS return_date,
      b.pickup_time,
      b.return_time,
      b.total_price,
      b.status,
      b.created_at,
      u.full_name AS customer_name,
      u.email AS customer_email,
      u.phone AS customer_phone,
      c.name AS car_name,
      c.brand AS car_brand,
      c.model AS car_model,
      c.category AS car_category,
      c.price_per_day,
      c.image_url,
      c.status AS car_status,
      p.id AS payment_id,
      p.method AS payment_method,
      p.status AS payment_status,
      p.amount AS payment_amount,
      p.paid_at
    FROM bookings b
    JOIN users u ON u.id = b.user_id
    JOIN cars c ON c.id = b.car_id
    LEFT JOIN payments p ON p.booking_id = b.id
    ${whereSql}
    ORDER BY
      CASE b.status
        WHEN 'CONFIRMED' THEN 1
        WHEN 'PICKED_UP' THEN 2
        WHEN 'PENDING' THEN 3
        WHEN 'COMPLETED' THEN 4
        WHEN 'CANCELLED' THEN 5
        ELSE 6
      END,
      b.pickup_date ASC,
      b.pickup_time ASC,
      b.id DESC
    ${limitSql}
    `,
    queryParams
  );

  return rows.map(mapBooking);
};

const getDashboard = async (req, res) => {
  try {
    const [[bookingStats]] = await db.query(`
      SELECT
        SUM(status = 'CONFIRMED') AS confirmed_waiting_pickup,
        SUM(status = 'PICKED_UP') AS currently_picked_up,
        SUM(status = 'COMPLETED' AND DATE(created_at) = CURDATE()) AS completed_today,
        SUM(status = 'CANCELLED' AND DATE(created_at) = CURDATE()) AS cancelled_today
      FROM bookings
    `);

    const [[dueStats]] = await db.query(`
      SELECT
        COUNT(*) AS due_returns_today
      FROM bookings
      WHERE status = 'PICKED_UP'
        AND return_date <= CURDATE()
    `);

    const [[carStats]] = await db.query(`
      SELECT
        SUM(status = 'AVAILABLE') AS available_cars,
        SUM(status = 'RENTED') AS rented_cars,
        SUM(status = 'MAINTENANCE') AS maintenance_cars
      FROM cars
    `);

    const [[cashStats]] = await db.query(`
      SELECT COUNT(*) AS pending_cash_payments
      FROM payments p
      JOIN bookings b ON b.id = p.booking_id
      WHERE p.method = 'CASH'
        AND p.status = 'PENDING'
        AND b.status IN ('CONFIRMED', 'PICKED_UP')
    `);

    const todayQueue = await getBookingRows({ status: "CONFIRMED", limit: 6 });
    const returnQueue = await getBookingRows({ status: "PICKED_UP", limit: 6 });

    return res.json({
      success: true,
      message: "Staff dashboard retrieved successfully",
      data: {
        bookings: {
          confirmedWaitingPickup: toNumber(bookingStats.confirmed_waiting_pickup),
          currentlyPickedUp: toNumber(bookingStats.currently_picked_up),
          dueReturnsToday: toNumber(dueStats.due_returns_today),
          completedToday: toNumber(bookingStats.completed_today),
          cancelledToday: toNumber(bookingStats.cancelled_today),
        },
        cars: {
          available: toNumber(carStats.available_cars),
          rented: toNumber(carStats.rented_cars),
          maintenance: toNumber(carStats.maintenance_cars),
        },
        payments: {
          pendingCash: toNumber(cashStats.pending_cash_payments),
        },
        pickupQueue: todayQueue,
        returnQueue,
      },
    });
  } catch (error) {
    console.error("Staff dashboard error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const status = normalizeEnum(req.query.status, BOOKING_STATUSES, null);
    const search = req.query.search ? String(req.query.search).trim() : null;

    if (req.query.status && req.query.status !== "ALL" && !status) {
      return res.status(400).json({ success: false, message: "Invalid booking status" });
    }

    const rows = await getBookingRows({
      status: req.query.status === "ALL" ? null : status,
      search,
    });

    return res.json({ success: true, message: "Staff bookings retrieved successfully", data: rows });
  } catch (error) {
    console.error("Staff get bookings error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);

    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Valid booking ID is required" });
    }

    const rows = await getBookingRows({ search: String(bookingId) });
    const booking = rows.find((item) => Number(item.id) === bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    return res.json({ success: true, message: "Staff booking detail retrieved successfully", data: booking });
  } catch (error) {
    console.error("Staff get booking detail error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const markPickedUp = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const bookingId = Number(req.params.id);

    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Valid booking ID is required" });
    }

    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT b.id, b.car_id, b.status, p.id AS payment_id, p.method AS payment_method, p.status AS payment_status
      FROM bookings b
      LEFT JOIN payments p ON p.booking_id = b.id
      WHERE b.id = ?
      FOR UPDATE
      `,
      [bookingId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const booking = rows[0];

    if (booking.status !== "CONFIRMED") {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Only CONFIRMED bookings can be marked as picked up" });
    }

    await connection.query("UPDATE bookings SET status = 'PICKED_UP' WHERE id = ?", [bookingId]);
    await connection.query("UPDATE cars SET status = 'RENTED' WHERE id = ?", [booking.car_id]);

    if (booking.payment_id && booking.payment_method === "CASH" && booking.payment_status === "PENDING") {
      await connection.query(
        "UPDATE payments SET status = 'SUCCESS', paid_at = COALESCE(paid_at, NOW()) WHERE id = ?",
        [booking.payment_id]
      );
    }

    await connection.commit();

    return res.json({
      success: true,
      message: "Booking marked as picked up successfully",
      data: { id: bookingId, status: "PICKED_UP", car_status: "RENTED" },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Staff pickup error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  } finally {
    connection.release();
  }
};

const completeBooking = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const bookingId = Number(req.params.id);
    const carStatus = normalizeEnum(req.body.carStatus || req.body.car_status || "AVAILABLE", ["AVAILABLE", "MAINTENANCE"], "AVAILABLE");

    if (!bookingId || !carStatus) {
      return res.status(400).json({ success: false, message: "Valid booking ID and car status are required" });
    }

    await connection.beginTransaction();

    const [rows] = await connection.query(
      "SELECT id, car_id, status FROM bookings WHERE id = ? FOR UPDATE",
      [bookingId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const booking = rows[0];

    if (booking.status !== "PICKED_UP") {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Only PICKED_UP bookings can be completed" });
    }

    await connection.query("UPDATE bookings SET status = 'COMPLETED' WHERE id = ?", [bookingId]);
    await connection.query("UPDATE cars SET status = ? WHERE id = ?", [carStatus, booking.car_id]);

    await connection.commit();

    return res.json({
      success: true,
      message: "Booking completed successfully",
      data: { id: bookingId, status: "COMPLETED", car_status: carStatus },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Staff complete error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  } finally {
    connection.release();
  }
};

const cancelBooking = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const bookingId = Number(req.params.id);

    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Valid booking ID is required" });
    }

    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT b.id, b.car_id, b.status, p.id AS payment_id, p.method AS payment_method, p.status AS payment_status
      FROM bookings b
      LEFT JOIN payments p ON p.booking_id = b.id
      WHERE b.id = ?
      FOR UPDATE
      `,
      [bookingId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const booking = rows[0];

    if (["COMPLETED", "CANCELLED", "PICKED_UP"].includes(booking.status)) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Only PENDING or CONFIRMED bookings can be cancelled" });
    }

    await connection.query("UPDATE bookings SET status = 'CANCELLED' WHERE id = ?", [bookingId]);
    await connection.query("UPDATE cars SET status = 'AVAILABLE' WHERE id = ? AND status <> 'MAINTENANCE'", [booking.car_id]);

    if (booking.payment_id) {
      if (booking.payment_method === "CASH" && booking.payment_status === "PENDING") {
        await connection.query("UPDATE payments SET status = 'FAILED' WHERE id = ?", [booking.payment_id]);
      }

      if (booking.payment_method !== "CASH" && booking.payment_status === "SUCCESS") {
        await connection.query("UPDATE payments SET status = 'REFUNDED' WHERE id = ?", [booking.payment_id]);
      }
    }

    await connection.commit();

    return res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: { id: bookingId, status: "CANCELLED" },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Staff cancel error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  } finally {
    connection.release();
  }
};

const getCars = async (req, res) => {
  try {
    const status = normalizeEnum(req.query.status, CAR_STATUSES, null);
    const search = req.query.search ? String(req.query.search).trim() : null;
    const params = [];
    const whereParts = ["status <> 'INACTIVE'"];

    if (req.query.status && req.query.status !== "ALL" && !status) {
      return res.status(400).json({ success: false, message: "Invalid car status" });
    }

    if (status) {
      whereParts.push("status = ?");
      params.push(status);
    }

    if (search) {
      whereParts.push("(name LIKE ? OR brand LIKE ? OR model LIKE ?)");
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const [cars] = await db.query(
      `
      SELECT id, name, brand, model, year, category, price_per_day, image_url,
             transmission, fuel_type, seats, status, description, updated_at
      FROM cars
      WHERE ${whereParts.join(" AND ")}
      ORDER BY
        CASE status
          WHEN 'RENTED' THEN 1
          WHEN 'MAINTENANCE' THEN 2
          WHEN 'AVAILABLE' THEN 3
          ELSE 4
        END,
        id DESC
      `,
      params
    );

    return res.json({
      success: true,
      message: "Staff cars retrieved successfully",
      data: cars.map((car) => ({ ...car, price_per_day: toNumber(car.price_per_day) })),
    });
  } catch (error) {
    console.error("Staff get cars error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const updateCarStatus = async (req, res) => {
  try {
    const carId = Number(req.params.id);
    const status = normalizeEnum(req.body.status, CAR_STATUSES, null);

    if (!carId || !status) {
      return res.status(400).json({ success: false, message: "Valid car ID and status are required" });
    }

    const [[car]] = await db.query("SELECT id, status FROM cars WHERE id = ?", [carId]);

    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    if (status === "RENTED") {
      return res.status(400).json({ success: false, message: "Use booking pickup flow to mark a car as RENTED" });
    }

    const [activeBookings] = await db.query(
      "SELECT id FROM bookings WHERE car_id = ? AND status = 'PICKED_UP' LIMIT 1",
      [carId]
    );

    if (activeBookings.length > 0 && status !== "RENTED") {
      return res.status(400).json({ success: false, message: "This car has an active picked-up booking. Complete the booking first." });
    }

    await db.query("UPDATE cars SET status = ? WHERE id = ?", [status, carId]);

    return res.json({
      success: true,
      message: "Car status updated successfully",
      data: { id: carId, status },
    });
  } catch (error) {
    console.error("Staff update car status error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  getDashboard,
  getBookings,
  getBookingById,
  markPickedUp,
  completeBooking,
  cancelBooking,
  getCars,
  updateCarStatus,
};
