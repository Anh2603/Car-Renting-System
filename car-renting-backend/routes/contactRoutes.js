const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { optionalAuthMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createContactMessage,
  getContactMessages,
  updateContactMessageStatus,
} = require("../controllers/contactController");

const uploadDir = path.join(__dirname, "..", "uploads", "contact");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const baseName = path
      .basename(file.originalname || "attachment", ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60) || "attachment";

    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${ext}`);
  },
});

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error("Only JPG, PNG, WEBP, or PDF attachments up to 5MB are allowed."));
  },
});

const uploadContactAttachment = (req, res, next) => {
  upload.single("attachment")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Invalid attachment upload.",
    });
  });
};

router.post("/", optionalAuthMiddleware, uploadContactAttachment, createContactMessage);

router.get(
  "/messages",
  authMiddleware,
  roleMiddleware("ADMIN", "STAFF"),
  getContactMessages
);

router.patch(
  "/messages/:id/status",
  authMiddleware,
  roleMiddleware("ADMIN", "STAFF"),
  updateContactMessageStatus
);

module.exports = router;
