import { Server } from "socket.io";

let ioInstance = null;

const TOPIC_MATCHERS = [
  { topic: "reservations", regex: /reservations?/i },
  { topic: "sales", regex: /sales?/i },
  { topic: "supply", regex: /supply/i },
  { topic: "inventory", regex: /(product|variant|stock)/i },
  { topic: "dashboard", regex: /dashboard/i },
  { topic: "categories", regex: /categories/i },
  { topic: "users", regex: /auth|profile|user/i },
];

export const deriveTopicsFromPath = (path = "") => {
  const normalized = (path || "").toLowerCase();
  const topics = TOPIC_MATCHERS.filter(({ regex }) => regex.test(normalized)).map(
    ({ topic }) => topic
  );
  if (!topics.length) {
    topics.push("general");
  }
  return Array.from(new Set(topics));
};

export const initRealtime = (httpServer, allowedOrigins = []) => {
  // In development, allow all origins for easier debugging
  const corsConfig =
    process.env.NODE_ENV === "production" && allowedOrigins.length > 0
      ? {
          origin: allowedOrigins,
          credentials: true,
        }
      : {
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
        };

  ioInstance = new Server(httpServer, {
    cors: corsConfig,
    transports: ["websocket", "polling"], // WebSocket first for better performance
    // Performance optimizations
    pingTimeout: 20000, // 20 seconds (default is 5000ms, increased for stability)
    pingInterval: 25000, // 25 seconds (default is 25000ms, keep same)
    upgradeTimeout: 10000, // 10 seconds for transport upgrade
    maxHttpBufferSize: 1e6, // 1MB max message size
    allowEIO3: true, // Allow Engine.IO v3 clients for compatibility
    // Compression for faster data transfer
    perMessageDeflate: {
      threshold: 1024, // Only compress messages larger than 1KB
      zlibDeflateOptions: {
        level: 6, // Compression level (1-9, 6 is balanced)
      },
    },
    // Connection optimization
    allowRequest: (req, callback) => {
      // Allow all requests by default (CORS handles security)
      callback(null, true);
    },
  });

  ioInstance.on("connection", (socket) => {
    // Only log in development
    if (process.env.NODE_ENV !== "production") {
      console.log(`🔌 Client connected: ${socket.id}`);
    }

    socket.on("disconnect", (reason) => {
      // Only log significant disconnects, not routine transport changes
      if (reason !== "transport close" && process.env.NODE_ENV !== "production") {
        console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
      }
    });

    socket.on("error", (error) => {
      // Always log errors as they're important
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });
  });

  // Only log initialization in development
  if (process.env.NODE_ENV !== "production") {
    console.log("✅ Socket.IO server initialized");
  }
  return ioInstance;
};

export const emitGlobalUpdate = (payload = {}) => {
  if (!ioInstance) return;
  const enrichedPayload = {
    timestamp: Date.now(),
    message: "System updated",
    ...payload,
  };
  if (!enrichedPayload.topics || !enrichedPayload.topics.length) {
    enrichedPayload.topics = deriveTopicsFromPath(enrichedPayload.path);
  }
  ioInstance.emit("app:update", enrichedPayload);
};

