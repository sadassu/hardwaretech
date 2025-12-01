import express from "express";
import { createServer } from "http";
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
import notificationRoutes from "./routes/notificationRoutes.js";
import {
  initRealtime,
  emitGlobalUpdate,
  deriveTopicsFromPath,
} from "./services/realtime.js";
import { initWebSocketServer } from "./services/websocketServer.js";

import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import passport from "passport";
// Register passport strategies
import "./config/passport.js";

dotenv.config();
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5001;

// Configure allowed origins - include localhost for development
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://hardware-tech.shop",
  // Development origins
  ...(process.env.NODE_ENV !== "production"
    ? [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5174",
      ]
    : []),
].filter(Boolean);

// HTTP server is created above for WebSocket support

// Middleware
app.use(express.json());

// CORS must be before rate limiter to handle preflight requests
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // In development, allow all origins
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      
      // In production, check against allowed origins
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Rate limiter after CORS
app.use(rateLimiter);

app.use(passport.initialize());

// Emit live reload events automatically for write operations
app.use((req, res, next) => {
  res.on("finish", () => {
    const method = req.method?.toUpperCase();
    if (
      ["POST", "PUT", "PATCH", "DELETE"].includes(method) &&
      res.statusCode < 400
    ) {
      emitGlobalUpdate({
        method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        topics: deriveTopicsFromPath(req.originalUrl),
      });
    }
  });
  next();
});

// ✅ Serve uploads folder as static (important for images)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/reservations", reservationRoutes);
app.use("/api/notifications", notificationRoutes);

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
  // Initialize WebSocket server for real-time updates (Railway-ready)
  try {
    initWebSocketServer(server);
    console.log("✅ WebSocket server ready for Railway deployment");
  } catch (error) {
    console.error("❌ Failed to initialize WebSocket server:", error);
    // Don't crash the server if WebSocket fails
  }
  
  server.listen(PORT, "0.0.0.0", async () => {
    console.log(`🚀 Server listening on port: ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`   WebSocket endpoint: ws://0.0.0.0:${PORT}/ws`);
    
    // Check email configuration on startup
    const emailConfig = {
      BREVO_API_KEY: process.env.BREVO_API_KEY ? "✅ Set" : "❌ Missing",
      BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL || "⚠️ Using default (no-reply@resend.dev)",
      BREVO_FROM_NAME: process.env.BREVO_FROM_NAME || "⚠️ Using default (Hardware Tech)",
    };
    
    console.log("\n📧 Email Configuration Status (Brevo API):");
    console.log(`   BREVO_API_KEY: ${emailConfig.BREVO_API_KEY}`);
    console.log(`   BREVO_FROM_EMAIL: ${emailConfig.BREVO_FROM_EMAIL}`);
    console.log(`   BREVO_FROM_NAME: ${emailConfig.BREVO_FROM_NAME}`);
    
    const allSet = process.env.BREVO_API_KEY;
    
    if (allSet) {
      console.log("✅ Email service is configured (Brevo API)");
      
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
            console.log("   ⚠️  Emails may not work. Check your Brevo API settings.\n");
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
      console.log("📖 Set BREVO_API_KEY in your environment variables\n");
      console.log("   Get your API key from: https://app.brevo.com/settings/keys/api\n");
    }
  });

  // Initialize cron jobs in production
  if (process.env.NODE_ENV === "production") {
    import("./cron/cancelOldReservations.js")
      .then(() => console.log("✅ Cron jobs initialized"))
      .catch((err) => console.error("❌ Failed to initialize cron jobs:", err));
  }
});
