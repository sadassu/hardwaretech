/**
 * Controller: User Authentication & Profile
 *
 * Features:
 * - register: Creates a new user account and returns JWT token.
 * - login: Authenticates an existing user and returns JWT token.
 * - fetchUserData: Fetches a user by email and aggregates their reservations
 *   along with reservation details.
 *
 * Notes:
 * - Uses JWT for authentication tokens.
 * - Passwords are excluded from user responses.
 * - Reservation aggregation uses $lookup to join with ReservationDetail.
 */

import jwt from "jsonwebtoken";
import validator from "validator";

import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Reservation from "../models/Reservation.js";
import axios from "axios";

import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { verificationLimiter } from "../config/upstash.js";
import { createVerificationToken } from "../utils/tokens.js";

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

// register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword, captchaToken } = req.body;

  if (!captchaToken) {
    return res.status(400).json({ error: "Captcha verification required" });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const { data } = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`
  );

  if (!data.success) {
    return res.status(400).json({ error: "Captcha verification failed" });
  }

  const { token: verificationToken, tokenHash } = createVerificationToken();
  const expires = Date.now() + 24 * 60 * 60 * 1000;

  const defaultAvatar =
    "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/no-profile-picture-icon.png";

  const user = await User.signup({
    name,
    email,
    password,
    confirmPassword,
    verificationTokenHash: tokenHash,
    verificationTokenExpires: new Date(expires),
    avatar: defaultAvatar,
  });

  // verification link
  const verifyUrl = `${
    process.env.CLIENT_URL
  }/verify-account?verificationToken=${verificationToken}&email=${encodeURIComponent(
    email
  )}`;

  const html = `
    <p>Hi ${name},</p>
    <p>Click the link below to verify your account:</p>
    <a href="${verifyUrl}">${verifyUrl}</a>
    <p>This link expires in 24 hours.</p>
  `;

  try {
    await sendEmail(user.email, "Verify Your Email", html);
  } catch (error) {
    console.error("Failed to send email:", error);
    return res
      .status(500)
      .json({ error: "Failed to send verification email." });
  }

  res.status(201).json({
    message: "User registered successfully! Verification email sent.",
    email: user.email,
  });
});

// login
export const login = asyncHandler(async (req, res) => {
  const { email, password, captchaToken } = req.body;

  if (!captchaToken) {
    return res.status(400).json({ error: "Captcha verification required" });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  try {
    const { data } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`
    );

    if (!data.success) {
      return res.status(400).json({ error: "Captcha verification failed" });
    }
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return res.status(500).json({ error: "Captcha verification error" });
  }

  const user = await User.login(email, password);

  const token = createToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.status(201).json({
    userId: user._id,
    roles: user.roles,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    isVerified: user.isVerified,
    token,
  });
});

// fetch user and reservations
export const fetchUserData = asyncHandler(async (req, res) => {
  const userEmail = req.query.email;

  if (!userEmail || !validator.isEmail(userEmail)) {
    throw Error("The email is either empty or not valid.");
  }

  // find user
  const user = await User.findOne({ email: userEmail }).select("-password");
  if (!user) {
    throw Error("User with this email was not found.");
  }

  // aggregate reservations by this user
  const reservations = await Reservation.aggregate([
    {
      $match: { userId: user._id },
    },
    {
      $lookup: {
        from: "reservationdetails",
        localField: "_id",
        foreignField: "reservationId",
        as: "reservationDetails",
      },
    },
    {
      $sort: { reservationDate: -1 },
    },
  ]);

  res.status(200).json({
    user,
    reservations,
  });
});

// update user roles
export const updateUserRoles = asyncHandler(async (req, res) => {
  const { id } = req.params; // user id from route
  const { roles } = req.body; // roles array from frontend

  if (!id) {
    return res.status(400).json({ message: "User ID is required." });
  }

  if (!Array.isArray(roles) || roles.length === 0) {
    return res
      .status(400)
      .json({ message: "Roles must be a non-empty array." });
  }

  // validate roles against allowed enum
  const allowedRoles = ["user", "admin", "cashier"];
  const invalidRoles = roles.filter((role) => !allowedRoles.includes(role));
  if (invalidRoles.length > 0) {
    return res.status(400).json({
      message: `Invalid roles: ${invalidRoles.join(", ")}.`,
    });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  user.roles = roles;
  await user.save();

  res.status(200).json({
    message: "User roles updated successfully.",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    },
  });
});

//this is for preparation of applying cookies
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.status(200).json({ message: "User logged out successfully." });
});

export const sendVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // rate limit based on email (per user)
  const identifier = email || req.ip;
  const { success, reset } = await verificationLimiter.limit(identifier);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000); // seconds
    console.warn(`⚠️ Rate limit hit for ${email}. Retry after ${retryAfter}s.`);
    return res.status(429).json({
      error: `You can request another code in ${retryAfter} seconds.`,
    });
  }

  // check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    console.warn("❌ User not found:", email);
    return res.status(404).json({ error: "User not found." });
  }

  // generate 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();

  // save code + expiration
  user.verificationCode = code;
  user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // email template
  const html = `
    <h2>Email Verification</h2>
    <p>Use the code below to verify your email address:</p>
    <h1>${code}</h1>
    <p>This code will expire in 10 minutes.</p>
  `;

  try {
    await sendEmail(user.email, "Verify Your Email", html);

    res.status(200).json({
      message: "Verification code sent successfully.",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to send verification email.",
    });
  }
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found." });

  if (
    !user.verificationCode ||
    user.verificationCode !== code ||
    user.verificationCodeExpires < Date.now()
  ) {
    return res.status(400).json({ error: "Invalid or expired code." });
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  res.status(200).json({ message: "Email verified successfully." });
});

export const verifyEmailUsingUrl = asyncHandler(async (req, res) => {
  const { verificationToken, email } = req.query;

  if (!verificationToken || !email)
    return res.status(400).json({ message: "Invalid verification link" });

  const tokenHash = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    email,
    verificationTokenHash: tokenHash,
    verificationTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.isVerified = true;
  user.verificationTokenHash = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  const sessionToken = createToken(user._id);

  res.cookie("token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });

  return res.status(200).json({
    message: "Account verified successfully!",
    isVerified: user.isVerified,
  });
});
