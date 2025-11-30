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
  // Don't add if already in set
  if (sseClients.has(res)) {
    return;
  }
  
  sseClients.add(res);

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
  // Fast path: return early if no clients
  if (sseClients.size === 0) {
    return;
  }

  // Prepare payload efficiently
  const enrichedPayload = {
    timestamp: Date.now(),
    message: payload.message || "System updated",
    ...payload,
  };

  // Derive topics if not provided
  if (!enrichedPayload.topics || !enrichedPayload.topics.length) {
    enrichedPayload.topics = deriveTopicsFromPath(enrichedPayload.path);
  }

  // Serialize message once (reused for all clients)
  const message = `data: ${JSON.stringify(enrichedPayload)}\n\n`;
  const deadClients = [];

  // Send to all connected clients efficiently
  sseClients.forEach((res) => {
    try {
      // Check if response is still writable before attempting to write
      if (!res.writable || res.destroyed) {
        deadClients.push(res);
        return;
      }
      
      // Use res.write() which is non-blocking and fast
      const written = res.write(message);
      
      // If write buffer is full, handle backpressure
      if (!written) {
        res.once("drain", () => {
          // Buffer drained, can continue writing
        });
      }
    } catch (error) {
      // Client connection is dead, mark for removal
      deadClients.push(res);
      if (process.env.NODE_ENV !== "production") {
        console.warn(`⚠️ Failed to write to SSE client: ${error.message}`);
      }
    }
  });

  // Clean up dead clients in batch
  if (deadClients.length > 0) {
    deadClients.forEach((res) => {
      sseClients.delete(res);
    });
  }

  // Log only in development
  if (process.env.NODE_ENV !== "production" && sseClients.size > 0) {
    console.log(`📡 SSE update emitted: ${enrichedPayload.topics.join(", ")} → ${sseClients.size} client(s)`);
  }
};

