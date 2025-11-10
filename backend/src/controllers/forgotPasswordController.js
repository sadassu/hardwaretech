// controllers/authController.js
import User from "../models/User.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import validator from "validator";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { verificationLimiter } from "../config/upstash.js";

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Check if email is provided
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Validate email format
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Rate limit check
  const ip = req.ip; // or user identifier if logged in
  const limit = await verificationLimiter.limit(ip);
  if (!limit.success) {
    return res.status(429).json({
      message: `Too many requests. Try again in ${Math.ceil(
        limit.reset / 1000
      )} seconds.`,
    });
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "No user found with this email" });
  }

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const tokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  // Save token hash & expiration
  user.resetPasswordTokenHash = tokenHash;
  user.resetPasswordTokenExpires = tokenExpires;
  await user.save();

  // Send email
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const subject = "Password Reset Request";
  const html = `
    <p>Hello ${user.name},</p>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
  `;
  await sendEmail(user.email, subject, html);

  res.status(200).json({ message: "Password reset email sent" });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (!validator.isStrongPassword(newPassword)) {
    return res.status(400).json({
      message:
        "Password must be stronger. It should include at least 8 characters, uppercase, lowercase, numbers, and symbols.",
    });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordTokenExpires: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  // Clear token fields
  user.verificationTokenHash = undefined;
  user.verificationTokenExpires = undefined;

  await user.save();

  res.status(200).json({ message: "Password reset successful" });
});
