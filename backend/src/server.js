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
    origin: [process.env.CLIENT_URL, "https://hardware-tech.shop"],
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
connectDB().then(async () => {
  app.listen(PORT, async () => {
    console.log(`Server listening on port: ${PORT}`);
    
    // Check email configuration on startup
    const emailConfig = {
      SMTP_HOST: process.env.SMTP_HOST ? "✅ Set" : "❌ Missing",
      SMTP_PORT: process.env.SMTP_PORT ? `✅ Set (${process.env.SMTP_PORT})` : "❌ Missing",
      SMTP_USER: process.env.SMTP_USER ? "✅ Set" : "❌ Missing",
      SMTP_PASS: process.env.SMTP_PASS ? "✅ Set" : "❌ Missing",
      EMAIL_FROM: process.env.EMAIL_FROM || "⚠️ Using default",
    };
    
    console.log("\n📧 Email Configuration Status:");
    console.log(`   SMTP_HOST: ${emailConfig.SMTP_HOST}`);
    console.log(`   SMTP_PORT: ${emailConfig.SMTP_PORT}`);
    console.log(`   SMTP_USER: ${emailConfig.SMTP_USER}`);
    console.log(`   SMTP_PASS: ${emailConfig.SMTP_PASS}`);
    console.log(`   EMAIL_FROM: ${emailConfig.EMAIL_FROM}`);
    
    const allSet = process.env.SMTP_HOST && process.env.SMTP_PORT && 
                    process.env.SMTP_USER && process.env.SMTP_PASS;
    
    if (allSet) {
      console.log("✅ Email service is configured");
      
      // Test email connection (only in production or if TEST_EMAIL is set)
      if (process.env.NODE_ENV === "production" || process.env.TEST_EMAIL === "true") {
        try {
          const { testEmailConfig } = await import("./utils/sendEmail.js");
          const testResult = await testEmailConfig();
          
          if (testResult.success) {
            console.log("✅ Email connection test: PASSED\n");
          } else {
            console.log("⚠️  Email connection test: FAILED");
            console.log(`   Reason: ${testResult.message}`);
            console.log("   ⚠️  Emails may not work. Check your SMTP settings.\n");
          }
        } catch (testError) {
          console.log("⚠️  Email connection test: ERROR");
          console.log(`   ${testError.message}\n`);
        }
      } else {
        console.log("ℹ️  Email connection test skipped (set TEST_EMAIL=true to enable)\n");
      }
    } else {
      console.log("⚠️  Email service is NOT fully configured. Emails will fail.\n");
      console.log("📖 See backend/EMAIL_SETUP.md for configuration guide\n");
    }
  });

  // Initialize cron jobs in production
  if (process.env.NODE_ENV === "production") {
    import("./cron/cancelOldReservations.js")
      .then(() => console.log("✅ Cron jobs initialized"))
      .catch((err) => console.error("❌ Failed to initialize cron jobs:", err));
  }
});
