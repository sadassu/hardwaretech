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

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

// register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const user = await User.signup(name, email, password, confirmPassword);

  const token = createToken(user._id);

  res.status(201).json({
    userId: user._id,
    roles: user.roles,
    name,
    email,
    token,
    avatar,
    message: "User registered successfully!",
  });
});

// login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.login(email, password);

  const token = createToken(user._id);

  res.status(201).json({
    userId: user._id,
    roles: user.roles,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    token,
  });
});

// fetch user and reservations
export const fetchUserData = asyncHandler(async (req, res) => {
  const userEmail = req.query.email; // ✅ correct way

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
