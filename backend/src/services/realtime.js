// SSE (Server-Sent Events) implementation for real-time updates

const TOPIC_MATCHERS = [
  { topic: "reservations", regex: /reservations?/i },
  { topic: "sales", regex: /sales?/i },
  { topic: "supply", regex: /supply/i },
  { topic: "inventory", regex: /(product|variant|stock)/i },
  { topic: "dashboard", regex: /dashboard/i },
  { topic: "categories", regex: /categories/i },
  { topic: "users", regex: /auth|profile|user/i },
];

// Store all connected SSE clients
const sseClients = new Set();

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

export const initRealtime = () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("✅ SSE (Server-Sent Events) initialized for real-time updates");
  }
  return true;
};

// Add a new SSE client connection
export const addSSEClient = (res) => {
  sseClients.add(res);
  
  // Remove client when connection closes
  res.on("close", () => {
    sseClients.delete(res);
    if (process.env.NODE_ENV !== "production") {
      console.log(`🔌 SSE client disconnected. Total clients: ${sseClients.size}`);
    }
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`✅ SSE client connected. Total clients: ${sseClients.size}`);
  }
};

// Remove a client (cleanup)
export const removeSSEClient = (res) => {
  sseClients.delete(res);
};

// Get count of connected clients
export const getClientCount = () => sseClients.size;

export const emitGlobalUpdate = (payload = {}) => {
  if (sseClients.size === 0) {
    // Only warn in development if no clients are connected
    if (process.env.NODE_ENV !== "production") {
      console.warn("⚠️ No SSE clients connected. Cannot emit update.");
    }
    return;
  }

  const enrichedPayload = {
    timestamp: Date.now(),
    message: "System updated",
    ...payload,
  };

  if (!enrichedPayload.topics || !enrichedPayload.topics.length) {
    enrichedPayload.topics = deriveTopicsFromPath(enrichedPayload.path);
  }

  // Log in development for debugging
  if (process.env.NODE_ENV !== "production") {
    console.log(`📡 Emitting SSE update for topics:`, enrichedPayload.topics);
  }

  // Send to all connected clients
  const message = `data: ${JSON.stringify(enrichedPayload)}\n\n`;
  const deadClients = [];

  sseClients.forEach((res) => {
    try {
      res.write(message);
    } catch (error) {
      // Client connection is dead, mark for removal
      deadClients.push(res);
      if (process.env.NODE_ENV !== "production") {
        console.warn(`⚠️ Failed to send SSE update to client:`, error.message);
      }
    }
  });

  // Clean up dead clients
  deadClients.forEach((res) => {
    sseClients.delete(res);
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`✅ Emitted SSE update to ${sseClients.size} client(s)`);
  }
};

