import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  fetchUserData,
  login,
  logout,
  register,
  sendVerificationCode,
  updateUserRoles,
  verifyEmail,
  verifyEmailUsingUrl,
} from "../controllers/authController.js";
import dotenv from "dotenv";

const router = express.Router();

dotenv.config();

const CLIENT_URL = process.env.CLIENT_URL;

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

// Local auth
router.post("/api/auth/register", register);
router.post("/api/auth/login", login);
router.get("/api/user/fetchUser", fetchUserData);
router.put("/api/user/updateRoles/:id", updateUserRoles);
router.post("/api/auth/logout", logout);
router.post("/api/auth/send-verification-code", sendVerificationCode);
router.post("/api/auth/confirm-verification-code", verifyEmail);
router.get("/api/auth/confirm-verification-url", verifyEmailUsingUrl);

// Google OAuth route - step 1
router.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback - step 2
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = createToken(req.user._id);

    const roles = Array.isArray(req.user.roles)
      ? req.user.roles[0]
      : req.user.roles;

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // include isVerified
    const isVerified = req.user.isVerified || false;

    res.redirect(
      `${CLIENT_URL}/login/success?token=${token}&userId=${
        req.user._id
      }&roles=${encodeURIComponent(roles)}&name=${encodeURIComponent(
        req.user.name
      )}&email=${encodeURIComponent(
        req.user.email
      )}&avatar=${encodeURIComponent(
        req.user.avatar || ""
      )}&isVerified=${encodeURIComponent(isVerified)}`
    );
  }
);

export default router;
