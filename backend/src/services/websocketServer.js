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
    const clientIp = req.socket.remoteAddress || req.headers['x-forwarded-for'] || "unknown";
    clients.set(clientId, ws);
    
    // Store client metadata
    ws.clientId = clientId;
    ws.clientIp = clientIp;
    ws.connectedAt = Date.now();
    
    // Log connection in production (limited logging)
    console.log(`✅ WebSocket client connected: ${clientId.substring(0, 8)}... (${clientIp})`);
    
    // Set connection timeout for Railway (keep connections alive)
    ws.isAlive = true;
    ws.lastPong = Date.now();
    
    // Handle pong responses
    ws.on("pong", () => {
      ws.isAlive = true;
      ws.lastPong = Date.now();
    });

    // Send welcome message with error handling
    try {
      ws.send(JSON.stringify({
        type: "connected",
        clientId,
        message: "WebSocket connection established",
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error(`Error sending welcome message to ${clientId}:`, error);
    }

    // Handle incoming messages with improved error handling
    ws.on("message", (message) => {
      // Check if connection is still open
      if (ws.readyState !== 1) { // WebSocket.OPEN
        return;
      }

      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === "subscribe") {
          // Subscribe to channels
          const channels = Array.isArray(data.channels) ? data.channels : [data.channel].filter(Boolean);
          
          channels.forEach((channel) => {
            if (!channel || typeof channel !== "string") return;
            
            if (!subscriptions.has(channel)) {
              subscriptions.set(channel, new Set());
            }
            subscriptions.get(channel).add(clientId);
            
            // Send subscription confirmation with error handling
            try {
              ws.send(JSON.stringify({
                type: "subscribed",
                channel,
                message: `Subscribed to ${channel}`,
                timestamp: Date.now(),
              }));
            } catch (error) {
              console.error(`Error sending subscription confirmation to ${clientId}:`, error);
            }
          });
        } else if (data.type === "unsubscribe") {
          // Unsubscribe from channels
          const channels = Array.isArray(data.channels) ? data.channels : [data.channel].filter(Boolean);
          
          channels.forEach((channel) => {
            if (!channel || typeof channel !== "string") return;
            
            if (subscriptions.has(channel)) {
              subscriptions.get(channel).delete(clientId);
            }
            
            try {
              ws.send(JSON.stringify({
                type: "unsubscribed",
                channel,
                message: `Unsubscribed from ${channel}`,
                timestamp: Date.now(),
              }));
            } catch (error) {
              console.error(`Error sending unsubscription confirmation to ${clientId}:`, error);
            }
          });
        } else if (data.type === "ping") {
          // Heartbeat/ping - respond immediately
          try {
            ws.send(JSON.stringify({ 
              type: "pong",
              timestamp: Date.now(),
            }));
            ws.isAlive = true;
            ws.lastPong = Date.now();
          } catch (error) {
            console.error(`Error sending pong to ${clientId}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error processing WebSocket message from ${clientId}:`, error);
        try {
          ws.send(JSON.stringify({
            type: "error",
            message: "Invalid message format",
            timestamp: Date.now(),
          }));
        } catch (sendError) {
          console.error(`Error sending error message to ${clientId}:`, sendError);
        }
      }
    });

    // Handle client disconnect
    ws.on("close", (code, reason) => {
      // Remove from all subscriptions
      subscriptions.forEach((clientSet) => {
        clientSet.delete(clientId);
      });
      
      clients.delete(clientId);
      
      const connectionDuration = Date.now() - (ws.connectedAt || Date.now());
      console.log(`🔌 WebSocket client disconnected: ${clientId.substring(0, 8)}... (code: ${code}, duration: ${Math.round(connectionDuration / 1000)}s)`);
    });

    // Handle errors with better recovery
    ws.on("error", (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error.message || error);
      
      // If connection is in a bad state, try to close it cleanly
      if (ws.readyState !== 1) { // Not OPEN
        try {
          ws.terminate();
        } catch (e) {
          // Ignore errors when terminating
        }
      }
    });

    // Handle connection timeout (30 seconds without pong)
    const connectionTimeout = setTimeout(() => {
      if (ws.isAlive === false || (ws.lastPong && Date.now() - ws.lastPong > 30000)) {
        console.warn(`⚠️ WebSocket connection timeout for ${clientId}, closing...`);
        try {
          ws.terminate();
        } catch (e) {
          // Ignore errors
        }
      }
    }, 35000); // 35 seconds timeout

    // Clear timeout on close
    ws.on("close", () => {
      clearTimeout(connectionTimeout);
    });
  });

  wss.on("error", (error) => {
    console.error("WebSocket server error:", error);
  });

  // Health check ping interval for Railway (every 25 seconds)
  // Reduced interval for better connection reliability
  const pingInterval = setInterval(() => {
    if (!wss) return;
    
    wss.clients.forEach((ws) => {
      try {
        // Check if connection is still open
        if (ws.readyState !== 1) { // WebSocket.OPEN
          // Connection is closed, clean it up
          const clientId = ws.clientId || "unknown";
          subscriptions.forEach((clientSet) => {
            clientSet.delete(clientId);
          });
          clients.delete(clientId);
          return;
        }

        // Check if last pong was too long ago (connection might be dead)
        if (ws.lastPong && Date.now() - ws.lastPong > 60000) {
          console.warn(`⚠️ WebSocket client ${ws.clientId?.substring(0, 8) || "unknown"} hasn't responded to pings, terminating...`);
          ws.terminate();
          return;
        }

        // Mark as not alive and send ping
        ws.isAlive = false;
        ws.ping(() => {
          // Ping sent successfully
        });
      } catch (error) {
        // Connection is likely dead, clean it up
        const clientId = ws.clientId || "unknown";
        console.error(`Error pinging client ${clientId}:`, error.message || error);
        subscriptions.forEach((clientSet) => {
          clientSet.delete(clientId);
        });
        clients.delete(clientId);
        try {
          ws.terminate();
        } catch (e) {
          // Ignore termination errors
        }
      }
    });
  }, 25000); // 25 seconds for more frequent health checks

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
  const deadClients = [];
  
  clientSet.forEach((clientId) => {
    const client = clients.get(clientId);
    if (client && client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(message);
        sentCount++;
      } catch (error) {
        console.error(`Error sending to client ${clientId}:`, error.message || error);
        // Mark for removal
        deadClients.push(clientId);
      }
    } else {
      // Mark dead connection for removal
      deadClients.push(clientId);
    }
  });

  // Clean up dead connections
  deadClients.forEach((clientId) => {
    clientSet.delete(clientId);
    clients.delete(clientId);
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

