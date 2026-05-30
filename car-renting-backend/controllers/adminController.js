const bcrypt = require("bcryptjs");
const db = require("../config/db");

const CAR_CATEGORIES = ["ECONOMY", "SUV", "PREMIUM"];
const CAR_STATUSES = ["AVAILABLE", "RENTED", "MAINTENANCE", "INACTIVE"];
const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "PICKED_UP", "COMPLETED", "CANCELLED"];
const USER_STATUSES = ["ACTIVE", "INACTIVE", "LOCKED"];
const PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED", "REFUNDED"];

const ALLOWED_BOOKING_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

const isAllowedBookingTransition = (currentStatus, nextStatus) => {
  if (currentStatus === nextStatus) return true;
  return (ALLOWED_BOOKING_TRANSITIONS[currentStatus] || []).includes(nextStatus);
};


const toNumber = (value) => Number(value || 0);
const toNullableString = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
};

const normalizeEnum = (value, allowedValues, fallback = null) => {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toUpperCase();
  return allowedValues.includes(normalized) ? normalized : null;
};

const mapCar = (car) => ({
  ...car,
  price_per_day: toNumber(car.price_per_day),
});

const mapAdminBooking = (booking) => ({
  ...booking,
  total_price: toNumber(booking.total_price),
  price_per_day: toNumber(booking.price_per_day),
  payment_amount:
    booking.payment_amount === null || booking.payment_amount === undefined
      ? null
      : toNumber(booking.payment_amount),
});

const getDashboard = async (req, res) => {
  try {
    const [[carStats]] = await db.query(`
      SELECT
        COUNT(*) AS total_cars,
        SUM(status = 'AVAILABLE') AS available_cars,
        SUM(status = 'RENTED') AS rented_cars,
        SUM(status = 'MAINTENANCE') AS maintenance_cars,
        SUM(status = 'INACTIVE') AS inactive_cars
      FROM cars
    `);

    const [[userStats]] = await db.query(`
      SELECT
        SUM(role = 'USER') AS total_users,
        SUM(role = 'STAFF') AS total_staff,
        SUM(role = 'ADMIN') AS total_admins
      FROM users
    `);

    const [[bookingStats]] = await db.query(`
      SELECT
        COUNT(*) AS total_bookings,
        SUM(status = 'PENDING') AS pending_bookings,
        SUM(status = 'CONFIRMED') AS confirmed_bookings,
        SUM(status = 'PICKED_UP') AS picked_up_bookings,
        SUM(status = 'COMPLETED') AS completed_bookings,
        SUM(status = 'CANCELLED') AS cancelled_bookings
      FROM bookings
    `);

    const [[paymentStats]] = await db.query(`
      SELECT
        COUNT(*) AS total_payments,
        SUM(status = 'PENDING') AS pending_payments,
        SUM(status = 'SUCCESS') AS success_payments,
        COALESCE(SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END), 0) AS total_revenue
      FROM payments
    `);

    const [recentBookings] = await db.query(`
      SELECT
        b.id,
        b.status,
        DATE_FORMAT(b.pickup_date, '%Y-%m-%d') AS pickup_date,
        DATE_FORMAT(b.return_date, '%Y-%m-%d') AS return_date,
        b.total_price,
        b.created_at,
        u.full_name AS customer_name,
        u.email AS customer_email,
        c.name AS car_name,
        p.status AS payment_status,
        p.method AS payment_method
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN cars c ON c.id = b.car_id
      LEFT JOIN payments p ON p.booking_id = b.id
      ORDER BY b.id DESC
      LIMIT 6
    `);

    return res.json({
      success: true,
      message: "Admin dashboard retrieved successfully",
      data: {
        cars: {
          total: toNumber(carStats.total_cars),
          available: toNumber(carStats.available_cars),
          rented: toNumber(carStats.rented_cars),
          maintenance: toNumber(carStats.maintenance_cars),
          inactive: toNumber(carStats.inactive_cars),
        },
        users: {
          totalUsers: toNumber(userStats.total_users),
          totalStaff: toNumber(userStats.total_staff),
          totalAdmins: toNumber(userStats.total_admins),
        },
        bookings: {
          total: toNumber(bookingStats.total_bookings),
          pending: toNumber(bookingStats.pending_bookings),
          confirmed: toNumber(bookingStats.confirmed_bookings),
          pickedUp: toNumber(bookingStats.picked_up_bookings),
          completed: toNumber(bookingStats.completed_bookings),
          cancelled: toNumber(bookingStats.cancelled_bookings),
        },
        payments: {
          total: toNumber(paymentStats.total_payments),
          pending: toNumber(paymentStats.pending_payments),
          success: toNumber(paymentStats.success_payments),
          revenue: toNumber(paymentStats.total_revenue),
        },
        recentBookings: recentBookings.map(mapAdminBooking),
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getCars = async (req, res) => {
  try {
    const params = [];
    const whereParts = [];

    const status = normalizeEnum(req.query.status, CAR_STATUSES, null);
    const category = normalizeEnum(req.query.category, CAR_CATEGORIES, null);
    const search = toNullableString(req.query.search || req.query.q);

    if (req.query.status && !status) {
      return res.status(400).json({ success: false, message: "Invalid car status" });
    }

    if (req.query.category && !category) {
      return res.status(400).json({ success: false, message: "Invalid car category" });
    }

    if (status) {
      whereParts.push("status = ?");
      params.push(status);
    }

    if (category) {
      whereParts.push("category = ?");
      params.push(category);
    }

    if (search) {
      whereParts.push("(name LIKE ? OR brand LIKE ? OR model LIKE ?)");
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

    const [cars] = await db.query(
      `
      SELECT id, name, brand, model, year, category, price_per_day, image_url,
             transmission, fuel_type, seats, status, description, created_at
      FROM cars
      ${whereSql}
      ORDER BY id DESC
      `,
      params
    );

    return res.json({
      success: true,
      message: "Cars retrieved successfully",
      data: cars.map(mapCar),
    });
  } catch (error) {
    console.error("Admin get cars error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const createCar = async (req, res) => {
  try {
    const name = toNullableString(req.body.name);
    const brand = toNullableString(req.body.brand);
    const model = toNullableString(req.body.model);
    const year = req.body.year ? Number(req.body.year) : null;
    const category = normalizeEnum(req.body.category, CAR_CATEGORIES, "ECONOMY");
    const pricePerDay = Number(req.body.price_per_day || req.body.pricePerDay || req.body.price);
    const imageUrl = toNullableString(req.body.image_url || req.body.imageUrl);
    const transmission = toNullableString(req.body.transmission) || "Automatic";
    const fuelType = toNullableString(req.body.fuel_type || req.body.fuelType) || "Gasoline";
    const seats = req.body.seats ? Number(req.body.seats) : 5;
    const status = normalizeEnum(req.body.status, CAR_STATUSES, "AVAILABLE");
    const description = toNullableString(req.body.description);

    if (!name || !pricePerDay || pricePerDay <= 0) {
      return res.status(400).json({ success: false, message: "Car name and valid price are required" });
    }

    if (!category || !status) {
      return res.status(400).json({ success: false, message: "Invalid category or status" });
    }

    const [result] = await db.query(
      `
      INSERT INTO cars
        (name, brand, model, year, category, price_per_day, image_url,
         transmission, fuel_type, seats, status, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [name, brand, model, year, category, pricePerDay, imageUrl, transmission, fuelType, seats, status, description]
    );

    return res.status(201).json({
      success: true,
      message: "Car created successfully",
      data: {
        id: result.insertId,
        name,
        brand,
        model,
        year,
        category,
        price_per_day: pricePerDay,
        image_url: imageUrl,
        transmission,
        fuel_type: fuelType,
        seats,
        status,
        description,
      },
    });
  } catch (error) {
    console.error("Admin create car error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const updateCar = async (req, res) => {
  try {
    const carId = Number(req.params.id);

    if (!carId) {
      return res.status(400).json({ success: false, message: "Valid car ID is required" });
    }

    const name = toNullableString(req.body.name);
    const brand = toNullableString(req.body.brand);
    const model = toNullableString(req.body.model);
    const year = req.body.year ? Number(req.body.year) : null;
    const category = normalizeEnum(req.body.category, CAR_CATEGORIES, "ECONOMY");
    const pricePerDay = Number(req.body.price_per_day || req.body.pricePerDay || req.body.price);
    const imageUrl = toNullableString(req.body.image_url || req.body.imageUrl);
    const transmission = toNullableString(req.body.transmission) || "Automatic";
    const fuelType = toNullableString(req.body.fuel_type || req.body.fuelType) || "Gasoline";
    const seats = req.body.seats ? Number(req.body.seats) : 5;
    const status = normalizeEnum(req.body.status, CAR_STATUSES, "AVAILABLE");
    const description = toNullableString(req.body.description);

    if (!name || !pricePerDay || pricePerDay <= 0) {
      return res.status(400).json({ success: false, message: "Car name and valid price are required" });
    }

    if (!category || !status) {
      return res.status(400).json({ success: false, message: "Invalid category or status" });
    }

    const [result] = await db.query(
      `
      UPDATE cars
      SET name = ?, brand = ?, model = ?, year = ?, category = ?, price_per_day = ?,
          image_url = ?, transmission = ?, fuel_type = ?, seats = ?, status = ?, description = ?
      WHERE id = ?
      `,
      [name, brand, model, year, category, pricePerDay, imageUrl, transmission, fuelType, seats, status, description, carId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    return res.json({ success: true, message: "Car updated successfully" });
  } catch (error) {
    console.error("Admin update car error:", error);
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

    const [result] = await db.query("UPDATE cars SET status = ? WHERE id = ?", [status, carId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    return res.json({ success: true, message: "Car status updated successfully", data: { id: carId, status } });
  } catch (error) {
    console.error("Admin update car status error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const params = [];
    const whereParts = [];
    const status = normalizeEnum(req.query.status, BOOKING_STATUSES, null);
    const search = toNullableString(req.query.search || req.query.q);

    if (req.query.status && !status) {
      return res.status(400).json({ success: false, message: "Invalid booking status" });
    }

    if (status) {
      whereParts.push("b.status = ?");
      params.push(status);
    }

    if (search) {
      whereParts.push("(u.full_name LIKE ? OR u.email LIKE ? OR c.name LIKE ? OR b.renter_name LIKE ?)");
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }

    const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

    const [bookings] = await db.query(
      `
      SELECT
        b.id, b.user_id, b.car_id, b.renter_name, b.renter_phone,
        b.driver_license_number, b.pickup_address, b.customer_note,
        b.pickup_location, b.return_location,
        DATE_FORMAT(b.pickup_date, '%Y-%m-%d') AS pickup_date,
        DATE_FORMAT(b.return_date, '%Y-%m-%d') AS return_date,
        TIME_FORMAT(b.pickup_time, '%H:%i') AS pickup_time,
        TIME_FORMAT(b.return_time, '%H:%i') AS return_time,
        DATEDIFF(b.return_date, b.pickup_date) AS rental_days,
        b.total_price, b.status, b.created_at,
        u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
        c.name AS car_name, c.brand, c.model, c.year, c.price_per_day, c.status AS car_status,
        p.id AS payment_id, p.amount AS payment_amount, p.status AS payment_status,
        p.method AS payment_method, p.paid_at
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN cars c ON c.id = b.car_id
      LEFT JOIN payments p ON p.booking_id = b.id
      ${whereSql}
      ORDER BY b.id DESC
      `,
      params
    );

    return res.json({
      success: true,
      message: "Bookings retrieved successfully",
      data: bookings.map(mapAdminBooking),
    });
  } catch (error) {
    console.error("Admin get bookings error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);

    const [bookings] = await db.query(
      `
      SELECT
        b.*, DATE_FORMAT(b.pickup_date, '%Y-%m-%d') AS pickup_date,
        DATE_FORMAT(b.return_date, '%Y-%m-%d') AS return_date,
        TIME_FORMAT(b.pickup_time, '%H:%i') AS pickup_time,
        TIME_FORMAT(b.return_time, '%H:%i') AS return_time,
        DATEDIFF(b.return_date, b.pickup_date) AS rental_days,
        u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
        c.name AS car_name, c.brand, c.model, c.year, c.price_per_day, c.status AS car_status,
        p.id AS payment_id, p.amount AS payment_amount, p.status AS payment_status,
        p.method AS payment_method, p.paid_at
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN cars c ON c.id = b.car_id
      LEFT JOIN payments p ON p.booking_id = b.id
      WHERE b.id = ?
      LIMIT 1
      `,
      [bookingId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    return res.json({ success: true, message: "Booking retrieved successfully", data: mapAdminBooking(bookings[0]) });
  } catch (error) {
    console.error("Admin get booking detail error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const bookingId = Number(req.params.id);
    const status = normalizeEnum(req.body.status, BOOKING_STATUSES, null);

    if (!bookingId || !status) {
      return res.status(400).json({ success: false, message: "Valid booking ID and status are required" });
    }

    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT
        b.id,
        b.car_id,
        b.status,
        p.id AS payment_id,
        p.method AS payment_method,
        p.status AS payment_status
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

    if (!isAllowedBookingTransition(booking.status, status)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Invalid booking transition: ${booking.status} cannot be changed to ${status}`,
      });
    }

    await connection.query("UPDATE bookings SET status = ? WHERE id = ?", [status, bookingId]);

    let nextPaymentStatus = booking.payment_status || null;

    if (status === "PICKED_UP") {
      await connection.query("UPDATE cars SET status = 'RENTED' WHERE id = ?", [booking.car_id]);

      if (booking.payment_id && booking.payment_method === "CASH" && booking.payment_status === "PENDING") {
        nextPaymentStatus = "SUCCESS";
        await connection.query(
          "UPDATE payments SET status = 'SUCCESS', paid_at = COALESCE(paid_at, NOW()) WHERE id = ?",
          [booking.payment_id]
        );
      }
    }

    if (status === "COMPLETED") {
      await connection.query(
        "UPDATE cars SET status = 'AVAILABLE' WHERE id = ? AND status <> 'MAINTENANCE'",
        [booking.car_id]
      );
    }

    if (status === "CANCELLED") {
      await connection.query(
        "UPDATE cars SET status = 'AVAILABLE' WHERE id = ? AND status <> 'MAINTENANCE'",
        [booking.car_id]
      );

      if (booking.payment_id) {
        if (booking.payment_method === "CASH" && booking.payment_status === "PENDING") {
          nextPaymentStatus = "FAILED";
          await connection.query("UPDATE payments SET status = 'FAILED' WHERE id = ?", [booking.payment_id]);
        }

        if (booking.payment_method !== "CASH" && booking.payment_status === "SUCCESS") {
          nextPaymentStatus = "REFUNDED";
          await connection.query("UPDATE payments SET status = 'REFUNDED' WHERE id = ?", [booking.payment_id]);
        }
      }
    }

    await connection.commit();

    return res.json({
      success: true,
      message: "Booking status updated successfully",
      data: {
        id: bookingId,
        status,
        payment_id: booking.payment_id || null,
        payment_status: nextPaymentStatus,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Admin update booking status error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  } finally {
    connection.release();
  }
};

const getUsers = async (req, res) => {
  try {
    const search = toNullableString(req.query.search || req.query.q);
    const role = normalizeEnum(req.query.role, ["USER", "ADMIN", "STAFF"], "USER");
    const params = [];
    const whereParts = [];

    if (!role) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    whereParts.push("role = ?");
    params.push(role);

    if (search) {
      whereParts.push("(full_name LIKE ? OR email LIKE ? OR phone LIKE ?)");
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const [users] = await db.query(
      `
      SELECT id, full_name, email, phone, role, status, created_at
      FROM users
      WHERE ${whereParts.join(" AND ")}
      ORDER BY id DESC
      `,
      params
    );

    return res.json({ success: true, message: "Users retrieved successfully", data: users });
  } catch (error) {
    console.error("Admin get users error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const status = normalizeEnum(req.body.status, USER_STATUSES, null);

    if (!userId || !status) {
      return res.status(400).json({ success: false, message: "Valid user ID and status are required" });
    }

    const [result] = await db.query(
      "UPDATE users SET status = ? WHERE id = ? AND role IN ('USER', 'STAFF')",
      [status, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User or staff account not found" });
    }

    return res.json({ success: true, message: "Account status updated successfully", data: { id: userId, status } });
  } catch (error) {
    console.error("Admin update user status error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getStaff = async (req, res) => {
  try {
    const search = toNullableString(req.query.search || req.query.q);
    const params = [];
    const whereParts = ["role = 'STAFF'"];

    if (search) {
      whereParts.push("(full_name LIKE ? OR email LIKE ? OR phone LIKE ?)");
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const [staff] = await db.query(
      `
      SELECT id, full_name, email, phone, role, status, created_at
      FROM users
      WHERE ${whereParts.join(" AND ")}
      ORDER BY id DESC
      `,
      params
    );

    return res.json({
      success: true,
      message: "Staff accounts retrieved successfully",
      data: staff,
    });
  } catch (error) {
    console.error("Admin get staff error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while loading staff accounts",
      error: error.message,
    });
  }
};

const createStaff = async (req, res) => {
  try {
    const fullName = toNullableString(req.body.full_name || req.body.fullName || req.body.name);
    const email = toNullableString(req.body.email)?.toLowerCase();
    const password = String(req.body.password || "").trim();
    const phone = toNullableString(req.body.phone);

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, password and phone are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const [existingUsers] = await db.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (full_name, email, password, phone, role, status) VALUES (?, ?, ?, ?, 'STAFF', 'ACTIVE')",
      [fullName, email, hashedPassword, phone]
    );

    return res.status(201).json({
      success: true,
      message: "Staff account created successfully",
      data: {
        id: result.insertId,
        full_name: fullName,
        email,
        phone,
        role: "STAFF",
        status: "ACTIVE",
      },
    });
  } catch (error) {
    console.error("Admin create staff error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const params = [];
    const whereParts = [];
    const status = normalizeEnum(req.query.status, PAYMENT_STATUSES, null);
    const method = toNullableString(req.query.method);

    if (req.query.status && !status) {
      return res.status(400).json({ success: false, message: "Invalid payment status" });
    }

    if (status) {
      whereParts.push("p.status = ?");
      params.push(status);
    }

    if (method) {
      whereParts.push("p.method = ?");
      params.push(method.toUpperCase());
    }

    const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

    const [payments] = await db.query(
      `
      SELECT
        p.id, p.booking_id, p.amount, p.method, p.status, p.paid_at,
        b.status AS booking_status,
        u.full_name AS customer_name,
        u.email AS customer_email,
        c.name AS car_name
      FROM payments p
      JOIN bookings b ON b.id = p.booking_id
      JOIN users u ON u.id = b.user_id
      JOIN cars c ON c.id = b.car_id
      ${whereSql}
      ORDER BY p.id DESC
      `,
      params
    );

    return res.json({
      success: true,
      message: "Payments retrieved successfully",
      data: payments.map((payment) => ({
        ...payment,
        amount: toNumber(payment.amount),
      })),
    });
  } catch (error) {
    console.error("Admin get payments error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const paymentId = Number(req.params.id);
    const status = normalizeEnum(req.body.status, PAYMENT_STATUSES, null);

    if (!paymentId || !status) {
      return res.status(400).json({ success: false, message: "Valid payment ID and status are required" });
    }

    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT
        p.id,
        p.booking_id,
        p.method,
        p.status AS current_payment_status,
        b.id AS booking_id,
        b.car_id,
        b.status AS booking_status
      FROM payments p
      JOIN bookings b ON b.id = p.booking_id
      WHERE p.id = ?
      FOR UPDATE
      `,
      [paymentId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    const payment = rows[0];
    const paidAtSql = status === "SUCCESS" ? ", paid_at = COALESCE(paid_at, NOW())" : "";

    await connection.query(
      `UPDATE payments SET status = ? ${paidAtSql} WHERE id = ?`,
      [status, paymentId]
    );

    let nextBookingStatus = payment.booking_status;

    // Keep payment and booking state aligned for admin corrections.
    if (status === "SUCCESS" && payment.booking_status === "PENDING") {
      nextBookingStatus = "CONFIRMED";
      await connection.query("UPDATE bookings SET status = 'CONFIRMED' WHERE id = ?", [payment.booking_id]);
    }

    if (["FAILED", "REFUNDED"].includes(status) && ["PENDING", "CONFIRMED"].includes(payment.booking_status)) {
      nextBookingStatus = "CANCELLED";
      await connection.query("UPDATE bookings SET status = 'CANCELLED' WHERE id = ?", [payment.booking_id]);
      await connection.query(
        "UPDATE cars SET status = 'AVAILABLE' WHERE id = ? AND status <> 'MAINTENANCE'",
        [payment.car_id]
      );
    }

    await connection.commit();

    return res.json({
      success: true,
      message: "Payment status updated successfully",
      data: {
        id: paymentId,
        status,
        booking_id: payment.booking_id,
        booking_status: nextBookingStatus,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Admin update payment status error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  } finally {
    connection.release();
  }
};

module.exports = {
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
};
