import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

// register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const newUser = await User.create({ name, email, password });
  const token = createToken(newUser._id);

  // ✅ set cookie instead of sending token in response
  res.cookie("session", token, {
    httpOnly: true, // prevents JS access (XSS safe)
    secure: process.env.NODE_ENV === "production", // only HTTPS in prod
    sameSite: "Strict", // prevents CSRF
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
  });

  res.status(201).json({
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
    message: "User registered successfully!",
  });
});

// login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields must be filled" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Email is not registered" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(400).json({ message: "Incorrect password" });
  }

  const token = createToken(user._id);

  // ✅ set cookie instead of sending token
  res.cookie("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

// logout
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("session");
  res.json({ message: "Logged out" });
});

// check session
export const me = asyncHandler(async (req, res) => {
  const token = req.cookies.session;
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    return res.status(401).json({ message: "Invalid session" });
  }
});
