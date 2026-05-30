const db = require("../config/db");

const CARD_METHOD = "BANK_CARD";
const CASH_METHOD = "CASH";

const ALLOWED_PAYMENT_METHODS = [CARD_METHOD, CASH_METHOD, "DEMO_CARD", "CARD"];

const normalizePaymentMethod = (methodValue) => {
  const method = String(methodValue || CARD_METHOD).trim().toUpperCase();

  // Keep old frontend aliases working, but store new payments as BANK_CARD.
  if (method === "DEMO_CARD" || method === "CARD") {
    return CARD_METHOD;
  }

  if (!ALLOWED_PAYMENT_METHODS.includes(method)) {
    return null;
  }

  return method;
};

const canViewPayment = (payment, user) => {
  if (!user) return false;
  if (["ADMIN", "STAFF"].includes(user.role)) return true;
  return Number(payment.user_id) === Number(user.id);
};

const canCreatePayment = (booking, user) => {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  return Number(booking.user_id) === Number(user.id);
};

const getRuntimePaymentFields = (method) => {
  if (method === CASH_METHOD) {
    return {
      status: "PENDING",
      paidAtSql: null,
      paidAtValue: null,
      message: "Booking confirmed. Cash payment is pending until pickup.",
    };
  }

  return {
    status: "SUCCESS",
    paidAtSql: "NOW()",
    paidAtValue: new Date().toISOString(),
    message: "Demo bank card payment completed successfully.",
  };
};

const buildPaymentResponse = (payment, booking = {}) => ({
  id: payment.id,
  payment_id: payment.id,
  booking_id: payment.booking_id || booking.id,
  bookingId: payment.booking_id || booking.id,
  amount: Number(payment.amount || 0),
  method: payment.method,
  payment_method: payment.method,
  status: payment.status,
  payment_status: payment.status,
  booking_status: booking.status || payment.booking_status || null,
  paid_at: payment.paid_at || null,
  created_at: payment.created_at || null,
});

// POST /api/payments
const createPayment = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const bookingId = Number(req.body.bookingId || req.body.booking_id);
    const method = normalizePaymentMethod(
      req.body.method || req.body.paymentMethod || req.body.payment_method
    );

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    if (!method) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method. Allowed methods: BANK_CARD, CASH",
      });
    }

    await connection.beginTransaction();

    const [bookings] = await connection.query(
      `
      SELECT
        b.*,
        c.name AS car_name
      FROM bookings b
      JOIN cars c ON c.id = b.car_id
      WHERE b.id = ?
      FOR UPDATE
      `,
      [bookingId]
    );

    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    if (!canCreatePayment(booking, req.user)) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: "You can only pay for your own bookings",
      });
    }

    if (["CANCELLED", "COMPLETED", "PICKED_UP"].includes(booking.status)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Booking with status ${booking.status} cannot be paid from checkout`,
      });
    }

    const amount = Number(
      req.body.amount ||
        req.body.totalPrice ||
        req.body.total_price ||
        booking.total_price
    );

    const expectedAmount = Number(booking.total_price);

    if (!amount || amount <= 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than 0",
      });
    }

    if (Math.abs(amount - expectedAmount) > 1) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Payment amount must match booking total: ${expectedAmount}`,
      });
    }

    const [existingPayments] = await connection.query(
      `SELECT * FROM payments WHERE booking_id = ? LIMIT 1`,
      [bookingId]
    );

    if (existingPayments.length > 0) {
      const existingPayment = existingPayments[0];
      const runtime = getRuntimePaymentFields(method);

      // Allow a customer to upgrade a Cash/PENDING payment to Bank Card/SUCCESS.
      // This keeps the booking record, avoids duplicate payments, and makes checkout retry usable.
      const canUpgradeCashToCard =
        existingPayment.method === CASH_METHOD &&
        existingPayment.status === "PENDING" &&
        method === CARD_METHOD;

      const canRetryFailedPayment =
        ["FAILED", "REFUNDED"].includes(existingPayment.status) &&
        ["PENDING", "CONFIRMED"].includes(booking.status);

      if (canUpgradeCashToCard || canRetryFailedPayment) {
        await connection.query(
          `
          UPDATE payments
          SET method = ?, amount = ?, status = ?, paid_at = ${runtime.paidAtSql === "NOW()" ? "NOW()" : "NULL"}
          WHERE id = ?
          `,
          [method, expectedAmount, runtime.status, existingPayment.id]
        );

        await connection.query(
          "UPDATE bookings SET status = 'CONFIRMED' WHERE id = ?",
          [bookingId]
        );

        await connection.commit();

        return res.json({
          success: true,
          message: runtime.message,
          data: buildPaymentResponse(
            {
              ...existingPayment,
              amount: expectedAmount,
              method,
              status: runtime.status,
              paid_at: runtime.paidAtValue,
            },
            { ...booking, status: "CONFIRMED" }
          ),
        });
      }

      if (booking.status === "PENDING") {
        await connection.query(
          "UPDATE bookings SET status = ? WHERE id = ?",
          ["CONFIRMED", bookingId]
        );
        booking.status = "CONFIRMED";
      }

      await connection.commit();

      return res.json({
        success: true,
        message: "Payment already exists for this booking",
        data: buildPaymentResponse(existingPayment, booking),
      });
    }

    const runtime = getRuntimePaymentFields(method);

    let paymentResult;

    if (runtime.paidAtSql === "NOW()") {
      [paymentResult] = await connection.query(
        `
        INSERT INTO payments
          (booking_id, amount, method, status, paid_at)
        VALUES (?, ?, ?, ?, NOW())
        `,
        [bookingId, expectedAmount, method, runtime.status]
      );
    } else {
      [paymentResult] = await connection.query(
        `
        INSERT INTO payments
          (booking_id, amount, method, status, paid_at)
        VALUES (?, ?, ?, ?, NULL)
        `,
        [bookingId, expectedAmount, method, runtime.status]
      );
    }

    await connection.query(
      "UPDATE bookings SET status = ? WHERE id = ?",
      ["CONFIRMED", bookingId]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: runtime.message,
      data: buildPaymentResponse(
        {
          id: paymentResult.insertId,
          booking_id: bookingId,
          amount: expectedAmount,
          method,
          status: runtime.status,
          paid_at: runtime.paidAtValue,
        },
        {
          ...booking,
          status: "CONFIRMED",
        }
      ),
    });
  } catch (error) {
    await connection.rollback();
    console.error("Create payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating payment",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// GET /api/payments/booking/:bookingId
const getPaymentByBookingId = async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Valid booking ID is required",
      });
    }

    const [rows] = await db.query(
      `
      SELECT
        p.*,
        b.user_id,
        b.status AS booking_status
      FROM payments p
      JOIN bookings b ON b.id = p.booking_id
      WHERE p.booking_id = ?
      LIMIT 1
      `,
      [bookingId]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        message: "Payment retrieved successfully",
        data: null,
      });
    }

    const payment = rows[0];

    if (!canViewPayment(payment, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You can only view payments for your own bookings",
      });
    }

    return res.json({
      success: true,
      message: "Payment retrieved successfully",
      data: buildPaymentResponse(payment, {
        id: bookingId,
        status: payment.booking_status,
      }),
    });
  } catch (error) {
    console.error("Get payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while retrieving payment",
      error: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getPaymentByBookingId,
};
