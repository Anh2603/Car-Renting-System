const db = require("../config/db");

const MESSAGE_STATUSES = ["NEW", "READ", "REPLIED", "ARCHIVED"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toNullableString = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
};

const normalizeStatus = (value) => {
  const status = String(value || "").trim().toUpperCase();
  return MESSAGE_STATUSES.includes(status) ? status : null;
};

const mapMessage = (message) => ({
  ...message,
  booking_id: message.booking_id === null || message.booking_id === undefined ? null : Number(message.booking_id),
});

const createContactMessage = async (req, res) => {
  try {
    const fullName = toNullableString(req.body.fullName || req.body.full_name);
    const email = toNullableString(req.body.email);
    const contactReason = toNullableString(req.body.contactReason || req.body.contact_reason);
    const topic = toNullableString(req.body.topic);
    const message = toNullableString(req.body.details || req.body.message);
    const phone = toNullableString(req.body.phone);
    const bookingId = req.body.bookingId || req.body.booking_id ? Number(req.body.bookingId || req.body.booking_id) : null;
    const userId = req.user?.id || null;

    const uploadedAttachmentName = req.file?.originalname || null;
    const uploadedAttachmentUrl = req.file ? `/uploads/contact/${req.file.filename}` : null;
    const attachmentName = uploadedAttachmentName || toNullableString(req.body.attachmentName || req.body.attachment_name);
    const attachmentUrl = uploadedAttachmentUrl || toNullableString(req.body.attachmentUrl || req.body.attachment_url);

    if (!fullName || !email || !contactReason || !topic || !message) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, contact reason, topic, and details are required.",
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (bookingId) {
      const [[booking]] = await db.query("SELECT id FROM bookings WHERE id = ?", [bookingId]);
      if (!booking) {
        return res.status(400).json({ success: false, message: "Booking ID does not exist." });
      }
    }

    const [result] = await db.query(
      `
      INSERT INTO contact_messages
        (user_id, booking_id, full_name, email, phone, contact_reason, topic, message, attachment_name, attachment_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW')
      `,
      [userId, bookingId, fullName, email, phone, contactReason, topic, message, attachmentName, attachmentUrl]
    );

    return res.status(201).json({
      success: true,
      message: "Your support request has been submitted successfully.",
      data: {
        id: result.insertId,
        status: "NEW",
        attachment_name: attachmentName,
        attachment_url: attachmentUrl,
      },
    });
  } catch (error) {
    console.error("Create contact message error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getContactMessages = async (req, res) => {
  try {
    const params = [];
    const whereParts = [];

    const status = req.query.status && req.query.status !== "ALL" ? normalizeStatus(req.query.status) : null;
    const search = toNullableString(req.query.search || req.query.q);

    if (req.query.status && req.query.status !== "ALL" && !status) {
      return res.status(400).json({ success: false, message: "Invalid message status." });
    }

    if (status) {
      whereParts.push("cm.status = ?");
      params.push(status);
    }

    if (search) {
      whereParts.push("(cm.full_name LIKE ? OR cm.email LIKE ? OR cm.topic LIKE ? OR cm.contact_reason LIKE ? OR cm.message LIKE ?)");
      const like = `%${search}%`;
      params.push(like, like, like, like, like);
    }

    const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

    const [messages] = await db.query(
      `
      SELECT
        cm.id,
        cm.user_id,
        cm.booking_id,
        cm.full_name,
        cm.email,
        cm.phone,
        cm.contact_reason,
        cm.topic,
        cm.message,
        cm.attachment_name,
        cm.attachment_url,
        cm.status,
        cm.created_at,
        cm.updated_at,
        u.role AS user_role,
        b.status AS booking_status,
        c.name AS car_name
      FROM contact_messages cm
      LEFT JOIN users u ON u.id = cm.user_id
      LEFT JOIN bookings b ON b.id = cm.booking_id
      LEFT JOIN cars c ON c.id = b.car_id
      ${whereSql}
      ORDER BY
        CASE cm.status
          WHEN 'NEW' THEN 1
          WHEN 'READ' THEN 2
          WHEN 'REPLIED' THEN 3
          ELSE 4
        END,
        cm.id DESC
      `,
      params
    );

    return res.json({
      success: true,
      message: "Contact messages retrieved successfully.",
      data: messages.map(mapMessage),
    });
  } catch (error) {
    console.error("Get contact messages error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const updateContactMessageStatus = async (req, res) => {
  try {
    const messageId = Number(req.params.id);
    const status = normalizeStatus(req.body.status);

    if (!messageId || !status) {
      return res.status(400).json({ success: false, message: "Valid message ID and status are required." });
    }

    const [result] = await db.query(
      "UPDATE contact_messages SET status = ? WHERE id = ?",
      [status, messageId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Contact message not found." });
    }

    return res.json({
      success: true,
      message: "Contact message status updated successfully.",
      data: { id: messageId, status },
    });
  } catch (error) {
    console.error("Update contact message status error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  createContactMessage,
  getContactMessages,
  updateContactMessageStatus,
};
