import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
    token,
  });
});
