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
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 3000; // 3 seconds
let subscribedChannels = new Set();

// Get WebSocket URL from backend URL
const getWebSocketUrl = () => {
  const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL || "http://localhost:5001";
  // Convert http:// to ws:// and https:// to wss://
  const wsUrl = backendUrl.replace(/^http/, "ws");
  return `${wsUrl}/ws`;
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
  if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
    return wsInstance;
  }

  const wsUrl = getWebSocketUrl();
  
  try {
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
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
      if (onConnected) onConnected();
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
      if (import.meta.env.DEV) {
        console.warn("⚠️ WebSocket error:", error);
      }
    };

    ws.onclose = (event) => {
      if (import.meta.env.DEV) {
        console.log("🔌 WebSocket disconnected");
      }
      
      if (onDisconnected) onDisconnected();
      
      // Attempt to reconnect
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = RECONNECT_DELAY * Math.min(reconnectAttempts, 5); // Exponential backoff, max 5x
        
        if (import.meta.env.DEV) {
          console.log(`🔄 Reconnecting in ${delay / 1000}s... (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        }
        
        reconnectTimeout = setTimeout(() => {
          wsInstance = null;
          initWebSocket(onConnected, onDisconnected);
        }, delay);
      } else {
        if (import.meta.env.DEV) {
          console.error("❌ Max reconnection attempts reached. WebSocket connection failed.");
        }
      }
    };

    wsInstance = ws;
    return ws;
  } catch (error) {
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

