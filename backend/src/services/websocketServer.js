// services/websocketServer.js
import { WebSocketServer } from "ws";

let wss = null;
const clients = new Map(); // Map of client ID to WebSocket connection
const subscriptions = new Map(); // Map of channel to Set of client IDs

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

/**
 * Initialize WebSocket server
 * @param {http.Server} server - HTTP server instance
 */
export const initWebSocketServer = (server) => {
  if (wss) {
    console.warn("⚠️ WebSocket server already initialized");
    return wss;
  }

  wss = new WebSocketServer({ 
    server,
    path: "/ws",
    perMessageDeflate: false, // Disable compression for better performance
    clientTracking: true, // Track clients for better connection management
  });

  wss.on("connection", (ws, req) => {
    const clientId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const clientIp = req.socket.remoteAddress || "unknown";
    clients.set(clientId, ws);
    
    // Log connection in production (limited logging)
    console.log(`✅ WebSocket client connected: ${clientId.substring(0, 8)}... (${clientIp})`);
    
    // Set connection timeout for Railway (keep connections alive)
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: "connected",
      clientId,
      message: "WebSocket connection established",
    }));

    // Handle incoming messages
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === "subscribe") {
          // Subscribe to channels
          const channels = Array.isArray(data.channels) ? data.channels : [data.channel].filter(Boolean);
          
          channels.forEach((channel) => {
            if (!subscriptions.has(channel)) {
              subscriptions.set(channel, new Set());
            }
            subscriptions.get(channel).add(clientId);
            
            // Send subscription confirmation
            ws.send(JSON.stringify({
              type: "subscribed",
              channel,
              message: `Subscribed to ${channel}`,
            }));
          });
        } else if (data.type === "unsubscribe") {
          // Unsubscribe from channels
          const channels = Array.isArray(data.channels) ? data.channels : [data.channel].filter(Boolean);
          
          channels.forEach((channel) => {
            if (subscriptions.has(channel)) {
              subscriptions.get(channel).delete(clientId);
            }
            
            ws.send(JSON.stringify({
              type: "unsubscribed",
              channel,
              message: `Unsubscribed from ${channel}`,
            }));
          });
        } else if (data.type === "ping") {
          // Heartbeat/ping
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        ws.send(JSON.stringify({
          type: "error",
          message: "Invalid message format",
        }));
      }
    });

    // Handle client disconnect
    ws.on("close", (code, reason) => {
      // Remove from all subscriptions
      subscriptions.forEach((clientSet) => {
        clientSet.delete(clientId);
      });
      
      clients.delete(clientId);
      
      console.log(`🔌 WebSocket client disconnected: ${clientId.substring(0, 8)}... (code: ${code})`);
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
    });
  });

  wss.on("error", (error) => {
    console.error("WebSocket server error:", error);
  });

  // Health check ping interval for Railway (every 30 seconds)
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        // Connection is dead, terminate it
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  // Cleanup interval on server close
  wss.on("close", () => {
    clearInterval(pingInterval);
  });

  console.log("✅ WebSocket server initialized on /ws");
  console.log(`   Ready for Railway deployment`);

  return wss;
};

/**
 * Broadcast message to all clients subscribed to a channel
 * @param {string} channel - Channel name
 * @param {Object} payload - Message payload
 */
export const broadcastToChannel = (channel, payload) => {
  if (!wss) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("⚠️ WebSocket server not initialized. Cannot broadcast.");
    }
    return;
  }

  const clientSet = subscriptions.get(channel);
  if (!clientSet || clientSet.size === 0) {
    // No subscribers, skip silently
    return;
  }

  const message = JSON.stringify({
    type: "update",
    channel,
    event: "app:update",
    data: payload,
    timestamp: Date.now(),
  });

  let sentCount = 0;
  clientSet.forEach((clientId) => {
    const client = clients.get(clientId);
    if (client && client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(message);
        sentCount++;
      } catch (error) {
        console.error(`Error sending to client ${clientId}:`, error);
        // Remove dead connection
        clientSet.delete(clientId);
        clients.delete(clientId);
      }
    } else {
      // Remove dead connection
      clientSet.delete(clientId);
    }
  });

  if (process.env.NODE_ENV !== "production" && sentCount > 0) {
    console.log(`📡 Broadcasted to ${sentCount} client(s) on channel: ${channel}`);
  }
};

/**
 * Emit update to multiple channels (topics)
 * @param {Object} payload - Update payload
 */
export const emitGlobalUpdate = (payload = {}) => {
  if (!wss) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("⚠️ WebSocket server not initialized. Cannot emit update.");
    }
    return;
  }

  const enrichedPayload = {
    timestamp: Date.now(),
    message: "System updated",
    ...payload,
  };

  // Derive topics from path if not provided
  if (!enrichedPayload.topics || !enrichedPayload.topics.length) {
    enrichedPayload.topics = deriveTopicsFromPath(enrichedPayload.path);
  }

  // Emit to each topic channel
  enrichedPayload.topics.forEach((topic) => {
    const channelName = `hardware-tech-${topic}`;
    broadcastToChannel(channelName, enrichedPayload);
  });

  // Also emit to general channel
  broadcastToChannel("hardware-tech-general", enrichedPayload);
};

/**
 * Get WebSocket server instance
 */
export const getWebSocketServer = () => wss;

/**
 * Get connection stats
 */
export const getConnectionStats = () => {
  return {
    totalClients: clients.size,
    totalChannels: subscriptions.size,
    channelSubscriptions: Object.fromEntries(
      Array.from(subscriptions.entries()).map(([channel, clientSet]) => [
        channel,
        clientSet.size,
      ])
    ),
  };
};

