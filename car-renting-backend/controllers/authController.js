const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const sanitizeUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  status: user.status,
});

exports.register = async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required",
      });
    }

    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (full_name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)",
      [full_name, email, hashedPassword, phone || null, "USER"]
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: result.insertId,
        full_name,
        email,
        phone: phone || null,
        role: "USER",
        status: "ACTIVE",
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    if (user.status && user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "This account is inactive. Please contact admin support.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      data: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, full_name, email, phone, role, status FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    return res.json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const fullName = String(req.body.full_name || req.body.fullName || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone = String(req.body.phone || "").trim();

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ? AND id <> ?",
      [email, userId]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This email is already used by another account",
      });
    }

    await db.query(
      "UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?",
      [fullName, email, phone || null, userId]
    );

    const [updatedUsers] = await db.query(
      "SELECT id, full_name, email, phone, role, status FROM users WHERE id = ?",
      [userId]
    );

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUsers[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password, new password and confirmation are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation do not match",
      });
    }

    const [users] = await db.query(
      "SELECT id, password FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, users[0].password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId]
    );

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
