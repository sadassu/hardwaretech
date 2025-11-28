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
    transports: ["websocket", "polling"],
  });

  ioInstance.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
    });

    socket.on("error", (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });
  });

  console.log("✅ Socket.IO server initialized");
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

