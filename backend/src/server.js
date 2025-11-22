import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import productsRoutes from "./routes/productsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import variantRoutes from "./routes/variantRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import deleteRoutes from "./routes/deleteRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import supplyHistoryRoute from "./routes/supplyHistoriesRoute.js";
import categoryRoutes from "./routes/categoriesRoute.js";

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
app.use("/api/sales", saleRoutes);
app.use("/api/delete", deleteRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/supply-histories", supplyHistoryRoute);
app.use("/api/categories", categoryRoutes);

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    message: err.message || "Internal Server Error", // For backward compatibility
  });
});

// Connect DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
  });

  // Initialize cron jobs in production
  if (process.env.NODE_ENV === "production") {
    import("./cron/cancelOldReservations.js")
      .then(() => console.log("✅ Cron jobs initialized"))
      .catch((err) => console.error("❌ Failed to initialize cron jobs:", err));
  }
});
