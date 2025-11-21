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
import requireAuth from "../middleware/requireAuth.js";
import { deleteAccount } from "../controllers/deleteAccountController.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/forgotPasswordController.js";

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
router.delete("/api/auth/me", requireAuth, deleteAccount);
router.delete(
  "/api/auth/:id",
  requireAuth,
  requireRole("admin"),
  deleteAccount
);

router.post("/api/auth/forgot-password", forgotPassword);
router.post("/api/auth/reset-password/:token", resetPassword);

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

    // Ensure roles is always an array and pass it as JSON string
    const roles = Array.isArray(req.user.roles)
      ? req.user.roles
      : req.user.roles
      ? [req.user.roles]
      : ["user"];

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // include isVerified
    const isVerified = req.user.isVerified || false;

    // google logged in flag
    const googleLoggedIn = true;

    res.redirect(
      `${CLIENT_URL}/login/success?token=${token}&userId=${
        req.user._id
      }&roles=${encodeURIComponent(JSON.stringify(roles))}&name=${encodeURIComponent(
        req.user.name
      )}&email=${encodeURIComponent(
        req.user.email
      )}&avatar=${encodeURIComponent(
        req.user.avatar || ""
      )}&isVerified=${encodeURIComponent(
        isVerified
      )}&googleLoggedIn=${encodeURIComponent(googleLoggedIn)}`
    );
  }
);

export default router;
