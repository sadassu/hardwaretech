import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const resolveSocketUrl = () => {
  const explicit = import.meta.env.VITE_SOCKET_URL;
  if (explicit) return explicit;

  const apiBase = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL || "";
  if (!apiBase) return "";

  try {
    const url = new URL(apiBase);
    // Remove trailing /api if present
    const pathname = url.pathname.replace(/\/api\/?$/, "/");
    url.pathname = pathname === "/" ? "" : pathname;
    return url.toString().replace(/\/$/, "");
  } catch (err) {
    console.warn("Unable to parse backend base URL for sockets:", err);
    return "";
  }
};

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

// Singleton socket instance to prevent multiple connections
let socketInstance = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000; // Start with 1 second

export const useLiveUpdates = () => {
  const isMountedRef = useRef(true);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    const socketUrl = resolveSocketUrl();
    
    if (!socketUrl) {
      console.warn("⚠️ Socket URL not configured. Live updates disabled.");
      return;
    }

    // Reuse existing socket if available and connected
    if (socketInstance?.connected) {
      return;
    }

    // Clean up existing socket if disconnected
    if (socketInstance && !socketInstance.connected) {
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
      socketInstance = null;
    }

    const connectSocket = () => {
      if (!isMountedRef.current) return;

      try {
        socketInstance = io(socketUrl, {
          transports: ["websocket", "polling"],
          withCredentials: true,
          reconnection: true,
          reconnectionDelay: RECONNECT_DELAY,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
          timeout: 10000,
        });

        socketInstance.on("connect", () => {
          if (!isMountedRef.current) return;
          reconnectAttempts = 0;
          console.log("✅ WebSocket connected:", socketInstance.id);
          dispatchLiveEvent({ topics: ["general"], message: "socket-connected" });
        });

        socketInstance.on("disconnect", (reason) => {
          if (!isMountedRef.current) return;
          console.log("🔌 WebSocket disconnected:", reason);
          
          // Only attempt manual reconnect if it wasn't intentional
          if (reason === "io server disconnect") {
            // Server disconnected, reconnect manually
            socketInstance.connect();
          } else if (reason === "io client disconnect") {
            // Client disconnected intentionally, don't reconnect
            return;
          }
        });

        socketInstance.on("connect_error", (error) => {
          if (!isMountedRef.current) return;
          console.warn("⚠️ WebSocket connection error:", error.message);
          
          // Don't log connection refused errors repeatedly
          if (!error.message.includes("xhr poll error")) {
            reconnectAttempts++;
            if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
              console.warn("⚠️ Max reconnection attempts reached. Live updates disabled.");
            }
          }
        });

        socketInstance.on("app:update", (payload) => {
          if (!isMountedRef.current) return;
          dispatchLiveEvent(payload);
        });

        socketInstance.on("reconnect", (attemptNumber) => {
          if (!isMountedRef.current) return;
          console.log(`✅ WebSocket reconnected after ${attemptNumber} attempts`);
          reconnectAttempts = 0;
        });

        socketInstance.on("reconnect_error", (error) => {
          if (!isMountedRef.current) return;
          console.warn("⚠️ WebSocket reconnection error:", error.message);
        });

        socketInstance.on("reconnect_failed", () => {
          if (!isMountedRef.current) return;
          console.warn("❌ WebSocket reconnection failed. Please refresh the page.");
        });

      } catch (error) {
        console.error("❌ Failed to initialize WebSocket:", error);
      }
    };

    // Small delay to ensure server is ready
    const initTimeout = setTimeout(() => {
      connectSocket();
    }, 100);

    return () => {
      isMountedRef.current = false;
      clearTimeout(initTimeout);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Don't disconnect on unmount - let it stay connected for other components
      // Only disconnect if this is the last component using it
      // For now, we'll keep it connected to maintain real-time updates
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
};

export default useLiveUpdates;

