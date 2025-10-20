import jwt from "jsonwebtoken";
import User from "../models/User.js";

const requireAuthCookies = async (req, res, next) => {
  try {
    // 1️⃣ Get token from cookies
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Authentication cookie required" });
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Fetch user details
    const user = await User.findById(decoded._id).select(
      "_id name email roles"
    );

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // 4️⃣ Attach user to the request
    req.user = user;
    next();
  } catch (error) {
    console.error("Cookie Auth error:", error.message);
    return res.status(401).json({ error: "Invalid or expired cookie token" });
  }
};

export default requireAuthCookies;
