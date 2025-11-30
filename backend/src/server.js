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
import {
  initRealtime,
  emitGlobalUpdate,
  deriveTopicsFromPath,
  addSSEClient,
  removeSSEClient,
} from "./services/realtime.js";

import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import passport from "passport";
// Register passport strategies
import "./config/passport.js";

dotenv.config();
const app = express();
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

// Note: Using SSE (Server-Sent Events) for real-time updates

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

// SSE endpoint for real-time updates
app.get("/api/events", (req, res) => {
  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
  
  // Enable CORS for SSE
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production")) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  // Prevent timeout - set to a very high value instead of 0
  // Some systems don't handle 0 well
  req.setTimeout(2147483647); // Max 32-bit integer (about 68 years)
  res.setTimeout(2147483647);
  
  // Flush headers immediately
  res.flushHeaders();

  // Send initial connection message
  try {
    res.write(`: SSE connection established\n\n`);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("❌ Failed to send initial SSE message:", error.message);
    }
    return;
  }

  // Add client to SSE clients set
  addSSEClient(res);

  // Track if connection is still alive
  let isAlive = true;
  let heartbeatInterval = null;

  // Function to send heartbeat
  const sendHeartbeat = () => {
    if (!isAlive) {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      return;
    }

    try {
      // Check if response is still writable and not destroyed
      if (res.writable && !res.destroyed && !res.closed && res.socket && !res.socket.destroyed) {
        // Send heartbeat comment (SSE format)
        const success = res.write(`: heartbeat\n\n`);
        if (!success) {
          // If write buffer is full, wait for drain
          res.once("drain", sendHeartbeat);
        }
      } else {
        // Connection is dead
        isAlive = false;
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }
        removeSSEClient(res);
        if (process.env.NODE_ENV !== "production") {
          console.log("🔌 Heartbeat detected dead connection, removing client");
        }
      }
    } catch (error) {
      // Connection error
      isAlive = false;
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      removeSSEClient(res);
      if (process.env.NODE_ENV !== "production") {
        console.warn("⚠️ Heartbeat failed, removing client:", error.message);
      }
    }
  };

  // Send heartbeat every 20 seconds to keep connection alive
  heartbeatInterval = setInterval(sendHeartbeat, 20000);

  // Clean up on client disconnect
  const cleanup = () => {
    if (!isAlive) return; // Already cleaned up
    isAlive = false;
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    removeSSEClient(res);
    if (process.env.NODE_ENV !== "production") {
      console.log("🔌 SSE client disconnected");
    }
  };

  req.on("close", cleanup);
  req.on("aborted", cleanup);
  res.on("close", cleanup);
  res.on("finish", cleanup);
  
  // Handle errors
  req.on("error", (error) => {
    if (process.env.NODE_ENV !== "production") {
      console.error("❌ SSE request error:", error.message);
    }
    cleanup();
  });

  res.on("error", (error) => {
    if (process.env.NODE_ENV !== "production") {
      console.error("❌ SSE response error:", error.message);
    }
    cleanup();
  });
});

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
  // Initialize SSE for real-time updates
  initRealtime();
  
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
