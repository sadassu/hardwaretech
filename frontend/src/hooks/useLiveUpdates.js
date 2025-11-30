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
    // Only warn in development
    if (import.meta.env.DEV) {
      console.warn("Unable to parse backend base URL for sockets:", err);
    }
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
      // Only warn in development
      if (import.meta.env.DEV) {
        console.warn("⚠️ Socket URL not configured. Live updates disabled.");
      }
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
          transports: ["websocket", "polling"], // WebSocket first for better performance
          withCredentials: true,
          reconnection: true,
          reconnectionDelay: RECONNECT_DELAY,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
          timeout: 10000,
          // Performance optimizations
          upgrade: true, // Allow transport upgrade
          rememberUpgrade: true, // Remember transport preference
          forceNew: false, // Reuse existing connection if available
          // Compression for faster data transfer
          compression: true,
        });

        socketInstance.on("connect", () => {
          if (!isMountedRef.current) return;
          reconnectAttempts = 0;
          // Only log in development
          if (import.meta.env.DEV) {
            console.log("✅ WebSocket connected:", socketInstance.id);
          }
          dispatchLiveEvent({ topics: ["general"], message: "socket-connected" });
        });

        socketInstance.on("disconnect", (reason) => {
          if (!isMountedRef.current) return;
          
          // "transport close" is normal when switching transports - don't log it
          if (reason !== "transport close" && import.meta.env.DEV) {
            console.log("🔌 WebSocket disconnected:", reason);
          }
          
          // Only attempt manual reconnect if it wasn't intentional
          if (reason === "io server disconnect") {
            // Server disconnected, reconnect manually
            socketInstance.connect();
          } else if (reason === "io client disconnect") {
            // Client disconnected intentionally, don't reconnect
            return;
          }
          // "transport close" is handled automatically by Socket.IO - no action needed
        });

        socketInstance.on("connect_error", (error) => {
          if (!isMountedRef.current) return;
          
          // Filter out routine connection errors that are expected during reconnection
          const isRoutineError = 
            error.message.includes("xhr poll error") ||
            error.message === "websocket error" ||
            error.message.includes("transport close");
          
          // Only log significant errors, not routine connection attempts
          if (!isRoutineError && import.meta.env.DEV) {
            console.warn("⚠️ WebSocket connection error:", error.message);
          }
          
          reconnectAttempts++;
          if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS && import.meta.env.DEV) {
            console.warn("⚠️ Max reconnection attempts reached. Live updates disabled.");
          }
        });

        socketInstance.on("app:update", (payload) => {
          if (!isMountedRef.current) return;
          dispatchLiveEvent(payload);
        });

        socketInstance.on("reconnect", (attemptNumber) => {
          if (!isMountedRef.current) return;
          reconnectAttempts = 0;
          // Only log in development
          if (import.meta.env.DEV && attemptNumber > 1) {
            console.log(`✅ WebSocket reconnected after ${attemptNumber} attempts`);
          }
        });

        socketInstance.on("reconnect_error", (error) => {
          if (!isMountedRef.current) return;
          // Only log in development
          if (import.meta.env.DEV) {
            console.warn("⚠️ WebSocket reconnection error:", error.message);
          }
        });

        socketInstance.on("reconnect_failed", () => {
          if (!isMountedRef.current) return;
          // Always log critical failures
          console.warn("❌ WebSocket reconnection failed. Please refresh the page.");
        });

      } catch (error) {
        // Always log initialization errors as they're critical
        console.error("❌ Failed to initialize WebSocket:", error);
      }
    };

    // Immediate connection for faster startup (removed delay)
    connectSocket();

    return () => {
      isMountedRef.current = false;
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

