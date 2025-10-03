import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  fetchUserData,
  login,
  register,
  updateUserRoles,
} from "../controllers/authController.js";

const router = express.Router();

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

// Local auth
router.post("/api/auth/register", register);
router.post("/api/auth/login", login);
router.get("/api/user/fetchUser", fetchUserData);
router.put("/api/user/updateRoles/:id", updateUserRoles);

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

    // Redirect to frontend with query params
    res.redirect(
      `http://localhost:5173/login/success?token=${token}&userId=${
        req.user._id
      }&roles=${encodeURIComponent(roles)}&name=${encodeURIComponent(
        req.user.name
      )}&email=${encodeURIComponent(
        req.user.email
      )}&avatar=${encodeURIComponent(req.user.avatar || "")}`
    );
  }
);

export default router;
