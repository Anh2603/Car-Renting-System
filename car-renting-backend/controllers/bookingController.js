const db = require("../config/db");

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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

const normalizeTime = (timeValue) => {
  if (!timeValue) return null;

  const time = String(timeValue).trim();

  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    return time;
  }

  if (/^\d{2}:\d{2}$/.test(time)) {
    return `${time}:00`;
  }

  const match = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${minutes}:00`;
};

const calculateRentalDays = (pickupDate, returnDate) => {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(returnDate);

  if (Number.isNaN(pickup.getTime()) || Number.isNaN(dropoff.getTime())) {
    return null;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.ceil((dropoff.getTime() - pickup.getTime()) / msPerDay);

  return days > 0 ? days : null;
};

const buildBookingResponse = (booking) => ({
  id: booking.id,
  booking_id: booking.id,
  user_id: booking.user_id,
  car_id: booking.car_id,
  carId: booking.car_id,

  renter_name: booking.renter_name,
  renterName: booking.renter_name,
  renter_phone: booking.renter_phone,
  renterPhone: booking.renter_phone,
  driver_license_number: booking.driver_license_number,
  driverLicenseNumber: booking.driver_license_number,
  pickup_address: booking.pickup_address,
  pickupAddress: booking.pickup_address,
  customer_note: booking.customer_note,
  customerNote: booking.customer_note,

  pickup_location: booking.pickup_location,
  pickupLocation: booking.pickup_location,
  return_location: booking.return_location,
  returnLocation: booking.return_location,

  pickup_date: booking.pickup_date,
  pickupDate: booking.pickup_date,
  return_date: booking.return_date,
  returnDate: booking.return_date,
  pickup_time: booking.pickup_time,
  pickupTime: booking.pickup_time,
  return_time: booking.return_time,
  returnTime: booking.return_time,

  rental_days: booking.rental_days,
  rentalDays: booking.rental_days,
  total_price: Number(booking.total_price),
  totalPrice: Number(booking.total_price),
  status: booking.status,
  created_at: booking.created_at,
});

const getBookingInput = (body) => {
  const pickupLocation = body.pickupLocation || body.location || body.pickup_area;
  const returnLocation = body.returnLocation || body.return_location || pickupLocation;

  return {
    carId: body.carId || body.car_id,
    pickupLocation,
    returnLocation,
    pickupDate: body.pickupDate || body.pickup_date,
    returnDate: body.returnDate || body.return_date,
    pickupTime: body.pickupTime || body.pickup_time,
    returnTime: body.returnTime || body.return_time,

    renterName:
      body.renterName ||
      body.customerFullName ||
      body.customerName ||
      body.renter_name,

    renterPhone:
      body.renterPhone ||
      body.customerPhone ||
      body.phone ||
      body.renter_phone,

    driverLicenseNumber:
      body.driverLicenseNumber ||
      body.driver_license_number ||
      body.driverLicense ||
      body.licenseNumber,

    pickupAddress:
      body.pickupAddress ||
      body.pickup_address ||
      body.address,

    customerNote:
      body.customerNote ||
      body.customer_note ||
      body.note ||
      null,
  };
};

const isCarAvailableForDateRange = async (
  connection,
  carId,
  pickupDate,
  returnDate,
  excludeBookingId = null
) => {
  const params = [carId, returnDate, pickupDate];

  let excludeSql = "";

  if (excludeBookingId) {
    excludeSql = "AND id <> ?";
    params.push(excludeBookingId);
  }

  const [overlaps] = await connection.query(
    `
    SELECT id, status, pickup_date, return_date
    FROM bookings
    WHERE car_id = ?
      AND status IN ('PENDING', 'CONFIRMED', 'PICKED_UP')
      AND pickup_date < ?
      AND return_date > ?
      ${excludeSql}
    LIMIT 1
    `,
    params
  );

  return overlaps.length === 0;
};

// POST /api/bookings
const createBooking = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const userId = req.user.id;

    const {
      carId,
      pickupLocation,
      returnLocation,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,
      renterName,
      renterPhone,
      driverLicenseNumber,
      pickupAddress,
      customerNote,
    } = getBookingInput(req.body);

    if (!carId || !pickupLocation || !pickupDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: "carId, pickupLocation, pickupDate and returnDate are required",
      });
    }

    if (!renterName || !renterPhone || !driverLicenseNumber || !pickupAddress) {
      return res.status(400).json({
        success: false,
        message:
          "Renter name, phone, driver's license number and pickup address are required",
      });
    }

    const formattedPickupDate = normalizeDate(pickupDate);
    const formattedReturnDate = normalizeDate(returnDate);
    const formattedPickupTime = normalizeTime(pickupTime) || "09:00:00";
    const formattedReturnTime = normalizeTime(returnTime) || "18:00:00";

    if (!formattedPickupDate || !formattedReturnDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickupDate or returnDate. Expected format: YYYY-MM-DD",
      });
    }

    const rentalDays = calculateRentalDays(formattedPickupDate, formattedReturnDate);

    if (!rentalDays) {
      return res.status(400).json({
        success: false,
        message: "Return date must be after pickup date",
      });
    }

    await connection.beginTransaction();

    const [cars] = await connection.query(
      "SELECT * FROM cars WHERE id = ? FOR UPDATE",
      [carId]
    );

    if (cars.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    const car = cars[0];

    if (car.status !== "AVAILABLE") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Car is not available",
      });
    }

    const isAvailable = await isCarAvailableForDateRange(
      connection,
      carId,
      formattedPickupDate,
      formattedReturnDate
    );

    if (!isAvailable) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: "This car is already booked for the selected date range",
      });
    }

    const totalPrice = Number(car.price_per_day) * rentalDays;

    const [result] = await connection.query(
      `
      INSERT INTO bookings
        (
          user_id,
          car_id,
          renter_name,
          renter_phone,
          driver_license_number,
          pickup_address,
          customer_note,
          pickup_location,
          return_location,
          pickup_date,
          return_date,
          pickup_time,
          return_time,
          total_price,
          status
        )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        carId,
        renterName,
        renterPhone,
        driverLicenseNumber,
        pickupAddress,
        customerNote || null,
        pickupLocation,
        returnLocation || pickupLocation,
        formattedPickupDate,
        formattedReturnDate,
        formattedPickupTime,
        formattedReturnTime,
        totalPrice,
        "PENDING",
      ]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: buildBookingResponse({
        id: result.insertId,
        user_id: userId,
        car_id: Number(carId),
        renter_name: renterName,
        renter_phone: renterPhone,
        driver_license_number: driverLicenseNumber,
        pickup_address: pickupAddress,
        customer_note: customerNote || null,
        pickup_location: pickupLocation,
        return_location: returnLocation || pickupLocation,
        pickup_date: formattedPickupDate,
        return_date: formattedReturnDate,
        pickup_time: formattedPickupTime,
        return_time: formattedReturnTime,
        rental_days: rentalDays,
        total_price: totalPrice,
        status: "PENDING",
        created_at: new Date().toISOString(),
      }),
    });
  } catch (error) {
    await connection.rollback();

    console.error("Create booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// GET /api/bookings/my-bookings
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const [bookings] = await db.query(
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
        TIME_FORMAT(b.pickup_time, '%H:%i') AS pickup_time,
        TIME_FORMAT(b.return_time, '%H:%i') AS return_time,
        DATEDIFF(b.return_date, b.pickup_date) AS rental_days,
        b.total_price,
        b.status,
        b.created_at,

        c.name AS car_name,
        c.brand,
        c.model,
        c.year,
        c.image_url,
        c.price_per_day,
        c.transmission,
        c.fuel_type,
        c.seats,

        p.id AS payment_id,
        p.amount AS payment_amount,
        p.status AS payment_status,
        p.method AS payment_method,
        p.paid_at
      FROM bookings b
      JOIN cars c ON b.car_id = c.id
      LEFT JOIN payments p ON p.booking_id = b.id
      WHERE b.user_id = ?
      ORDER BY b.id DESC
      `,
      [userId]
    );

    const data = bookings.map((booking) => ({
      ...booking,
      total_price: Number(booking.total_price),
      price_per_day: Number(booking.price_per_day),
      payment_amount:
        booking.payment_amount === null ? null : Number(booking.payment_amount),
      car: {
        id: booking.car_id,
        name: booking.car_name,
        brand: booking.brand,
        model: booking.model,
        year: booking.year,
        image_url: booking.image_url,
        price_per_day: Number(booking.price_per_day),
        transmission: booking.transmission,
        fuel_type: booking.fuel_type,
        seats: booking.seats,
      },
      payment: booking.payment_id
        ? {
            id: booking.payment_id,
            amount: Number(booking.payment_amount),
            status: booking.payment_status,
            method: booking.payment_method,
            paid_at: booking.paid_at,
          }
        : null,
    }));

    return res.json({
      success: true,
      message: "My bookings retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Get my bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// PUT /api/bookings/:id/cancel
const cancelMyBooking = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const bookingId = Number(req.params.id);
    const userId = req.user.id;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Valid booking ID is required",
      });
    }

    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT
        b.id,
        b.user_id,
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

    if (Number(booking.user_id) !== Number(userId)) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own bookings",
      });
    }

    if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Only PENDING or CONFIRMED bookings can be cancelled",
      });
    }

    await connection.query("UPDATE bookings SET status = 'CANCELLED' WHERE id = ?", [bookingId]);
    await connection.query(
      "UPDATE cars SET status = 'AVAILABLE' WHERE id = ? AND status <> 'MAINTENANCE'",
      [booking.car_id]
    );

    let nextPaymentStatus = booking.payment_status || null;

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

    await connection.commit();

    return res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: {
        id: bookingId,
        booking_id: bookingId,
        status: "CANCELLED",
        payment_id: booking.payment_id || null,
        payment_status: nextPaymentStatus,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Cancel my booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while cancelling booking",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelMyBooking,
};