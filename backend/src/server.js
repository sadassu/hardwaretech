import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import productsRoutes from "./routes/productsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import variantRoutes from "./routes/variantRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import passport from "passport";
// Register passport strategies
import "./config/passport.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(rateLimiter);
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(passport.initialize());

// ✅ Serve uploads folder as static (important for images)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/reservations", reservationRoutes);

app.use("/", authRoutes);
app.use("/api", productsRoutes);
app.use("/api/product-variants", variantRoutes);
app.use("/api/profile", profileRoutes);

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

// Connect DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
  });
});
