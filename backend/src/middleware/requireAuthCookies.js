import jwt from "jsonwebtoken";
import User from "../models/User.js";

const requireAuthCookies = async (req, res, next) => {
  try {
    // Check for JWT in cookies
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    // Verify token
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(_id).select("_id name email roles");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth (cookies) error:", error.message);
    return res.status(401).json({ error: "Request is not authorized" });
  }
};

export default requireAuthCookies;
