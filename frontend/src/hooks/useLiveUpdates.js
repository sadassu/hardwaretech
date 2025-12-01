import { useEffect, useRef } from "react";

const dispatchLiveEvent = (detail) => {
  const eventDetail = {
    timestamp: Date.now(),
    ...detail,
  };
  window.dispatchEvent(new CustomEvent("live-update", { detail: eventDetail }));
  (eventDetail.topics || []).forEach((topic) => {
    window.dispatchEvent(
      new CustomEvent(`live-update:${topic}`, { detail: eventDetail })
    );
  });
};

// Singleton WebSocket instance to prevent multiple connections
let wsInstance = null;
let reconnectTimeout = null;
let reconnectAttempts = 0;
let isConnecting = false; // Prevent multiple simultaneous connection attempts
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 3000; // 3 seconds
let subscribedChannels = new Set();
let connectionCallbacks = new Set(); // Track all components using the connection

// Get WebSocket URL from backend URL
const getWebSocketUrl = () => {
  // Get backend URL from environment variable
  let backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
  
  // Fallback for development
  if (!backendUrl) {
    backendUrl = import.meta.env.DEV 
      ? "http://localhost:5001" 
      : window.location.origin.replace(/^https?/, "ws");
  }
  
  // Remove any trailing paths (like /api) since WebSocket is at root /ws
  // Convert http:// to ws:// and https:// to wss://
  try {
    const urlObj = new URL(backendUrl);
    const protocol = urlObj.protocol === "https:" ? "wss" : "ws";
    const host = urlObj.host; // This includes hostname:port (e.g., localhost:5001)
    const wsUrl = `${protocol}://${host}/ws`;
    
    if (import.meta.env.DEV) {
      console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
    }
    
    return wsUrl;
  } catch (error) {
    // Fallback if URL parsing fails - strip any path manually
    const protocol = backendUrl.startsWith("https") ? "wss" : "ws";
    // Remove protocol and any path, keep only host:port
    const host = backendUrl.replace(/^https?:\/\//, "").split("/")[0];
    const wsUrl = `${protocol}://${host}/ws`;
    
    if (import.meta.env.DEV) {
      console.log(`🔌 Connecting to WebSocket (fallback): ${wsUrl}`);
    }
    
    return wsUrl;
  }
};

// Subscribe to channels
const subscribeToChannels = (ws, channels) => {
  channels.forEach((channelName) => {
    if (!subscribedChannels.has(channelName)) {
      try {
        ws.send(JSON.stringify({
          type: "subscribe",
          channels: [channelName],
        }));
        subscribedChannels.add(channelName);
        
        if (import.meta.env.DEV) {
          console.log(`✅ Subscribed to channel: ${channelName}`);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn(`⚠️ Failed to subscribe to ${channelName}:`, error);
        }
      }
    }
  });
};

// Initialize WebSocket connection
const initWebSocket = (onConnected, onDisconnected) => {
  // If already connected, just return the instance
  if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
    if (onConnected) onConnected();
    return wsInstance;
  }

  // If already connecting, wait for it
  if (isConnecting) {
    // Store callbacks to call when connection is established
    if (onConnected) connectionCallbacks.add(onConnected);
    if (onDisconnected) connectionCallbacks.add(onDisconnected);
    return wsInstance; // Return existing instance (even if not open yet)
  }

  // If there's an instance but it's not open, close it first
  if (wsInstance) {
    try {
      wsInstance.close();
    } catch (e) {
      // Ignore errors when closing
    }
    wsInstance = null;
  }

  isConnecting = true;
  const wsUrl = getWebSocketUrl();
  
  try {
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      isConnecting = false;
      reconnectAttempts = 0;
      if (import.meta.env.DEV) {
        console.log("✅ WebSocket connected");
      }
      
      // Subscribe to all channels
      const channels = [
        "hardware-tech-general",
        "hardware-tech-reservations",
        "hardware-tech-sales",
        "hardware-tech-supply",
        "hardware-tech-inventory",
        "hardware-tech-dashboard",
        "hardware-tech-categories",
        "hardware-tech-users",
      ];
      
      subscribeToChannels(ws, channels);
      
      dispatchLiveEvent({ topics: ["general"], message: "socket-connected" });
      
      // Call all registered callbacks
      if (onConnected) onConnected();
      connectionCallbacks.forEach(callback => {
        try {
          callback();
        } catch (e) {
          console.error("Error in connection callback:", e);
        }
      });
      connectionCallbacks.clear();
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === "update" && message.event === "app:update") {
          // Log in development for debugging
          if (import.meta.env.DEV) {
            console.log(`📨 Received update on ${message.channel}:`, message.data);
          }
          dispatchLiveEvent(message.data);
        } else if (message.type === "subscribed") {
          if (import.meta.env.DEV) {
            console.log(`✅ ${message.message}`);
          }
        } else if (message.type === "connected") {
          if (import.meta.env.DEV) {
            console.log(`✅ ${message.message}`);
          }
        } else if (message.type === "pong") {
          // Heartbeat response
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      isConnecting = false;
      if (import.meta.env.DEV) {
        console.warn("⚠️ WebSocket error:", error);
      }
    };

    ws.onclose = (event) => {
      isConnecting = false;
      const wasClean = event.wasClean;
      const code = event.code;
      const reason = event.reason || "Unknown reason";
      
      if (import.meta.env.DEV) {
        console.log(`🔌 WebSocket disconnected (code: ${code}, clean: ${wasClean}, reason: ${reason})`);
      }
      
      // Call disconnected callbacks
      if (onDisconnected) onDisconnected();
      connectionCallbacks.forEach(callback => {
        try {
          callback();
        } catch (e) {
          console.error("Error in disconnection callback:", e);
        }
      });
      
      // Don't reconnect if it was a clean close (e.g., server shutdown)
      if (wasClean && code === 1000) {
        if (import.meta.env.DEV) {
          console.log("Connection closed cleanly, not reconnecting");
        }
        wsInstance = null;
        return;
      }
      
      // Only reconnect if no other component is already handling reconnection
      if (!isConnecting && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = RECONNECT_DELAY * Math.min(reconnectAttempts, 5); // Exponential backoff, max 5x
        
        if (import.meta.env.DEV) {
          console.log(`🔄 Reconnecting in ${delay / 1000}s... (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        }
        
        reconnectTimeout = setTimeout(() => {
          wsInstance = null;
          initWebSocket(onConnected, onDisconnected);
        }, delay);
      } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error("❌ Max reconnection attempts reached. WebSocket connection failed.");
        // Reset attempts after a longer delay to allow retry later
        setTimeout(() => {
          reconnectAttempts = 0;
        }, 60000); // Reset after 1 minute
      }
    };

    wsInstance = ws;
    return ws;
  } catch (error) {
    isConnecting = false;
    console.error("❌ Failed to initialize WebSocket:", error);
    return null;
  }
};

export const useLiveUpdates = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Initialize WebSocket connection
    const ws = initWebSocket(
      () => {
        if (!isMountedRef.current) return;
        // Connection established
      },
      () => {
        if (!isMountedRef.current) return;
        // Connection lost
      }
    );

    // Send ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: "ping" }));
        } catch (error) {
          console.error("Error sending ping:", error);
        }
      }
    }, 30000);

    return () => {
      isMountedRef.current = false;
      clearInterval(pingInterval);
      // Don't close WebSocket on unmount - let it stay connected for other components
      // WebSocket will automatically clean up when the page is closed
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);
};

export default useLiveUpdates;

