import { useEffect, useRef } from "react";
import Pusher from "pusher-js";

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

// Singleton Pusher instance to prevent multiple connections
let pusherInstance = null;
let subscribedChannels = new Set();

export const useLiveUpdates = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Get Pusher configuration from environment variables
    const pusherKey = import.meta.env.VITE_PUSHER_KEY;
    const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER || "ap1";

    if (!pusherKey) {
      // Only warn in development
      if (import.meta.env.DEV) {
        console.warn("⚠️ Pusher key not configured. Live updates disabled.");
        console.warn("   Set VITE_PUSHER_KEY in your environment variables.");
      }
      return;
    }

    // Initialize Pusher if not already initialized
    if (!pusherInstance) {
      try {
        pusherInstance = new Pusher(pusherKey, {
          cluster: pusherCluster,
          encrypted: true,
          // Performance optimizations
          enabledTransports: ["ws", "wss"], // WebSocket only for better performance
          forceTLS: true,
          // Reconnection settings
          authEndpoint: undefined, // No auth needed for public channels
        });

        pusherInstance.connection.bind("connected", () => {
          if (!isMountedRef.current) return;
          // Only log in development
          if (import.meta.env.DEV) {
            console.log("✅ Pusher connected");
          }
          dispatchLiveEvent({ topics: ["general"], message: "socket-connected" });
        });

        pusherInstance.connection.bind("disconnected", () => {
          if (!isMountedRef.current) return;
          // Only log in development
          if (import.meta.env.DEV) {
            console.log("🔌 Pusher disconnected");
          }
        });

        pusherInstance.connection.bind("error", (error) => {
          if (!isMountedRef.current) return;
          // Only log significant errors
          if (import.meta.env.DEV) {
            console.warn("⚠️ Pusher connection error:", error);
          }
        });

        pusherInstance.connection.bind("state_change", (states) => {
          if (!isMountedRef.current) return;
          // Only log state changes in development
          if (import.meta.env.DEV && states.previous !== states.current) {
            console.log(`🔄 Pusher state: ${states.previous} → ${states.current}`);
          }
        });
      } catch (error) {
        // Always log initialization errors as they're critical
        console.error("❌ Failed to initialize Pusher:", error);
        return;
      }
    }

    // Subscribe to channels for different topics
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

    channels.forEach((channelName) => {
      if (!subscribedChannels.has(channelName)) {
        try {
          const channel = pusherInstance.subscribe(channelName);
          
          channel.bind("app:update", (payload) => {
            if (!isMountedRef.current) return;
            // Log in development for debugging
            if (import.meta.env.DEV) {
              console.log(`📨 Received Pusher update on ${channelName}:`, payload);
            }
            dispatchLiveEvent(payload);
          });

          channel.bind("pusher:subscription_succeeded", () => {
            if (!isMountedRef.current) return;
            // Only log in development
            if (import.meta.env.DEV) {
              console.log(`✅ Subscribed to channel: ${channelName}`);
            }
          });

          channel.bind("pusher:subscription_error", (error) => {
            if (!isMountedRef.current) return;
            // Only log in development
            if (import.meta.env.DEV) {
              console.warn(`⚠️ Subscription error for ${channelName}:`, error);
            }
          });

          subscribedChannels.add(channelName);
        } catch (error) {
          // Only log in development
          if (import.meta.env.DEV) {
            console.warn(`⚠️ Failed to subscribe to ${channelName}:`, error);
          }
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      // Don't disconnect Pusher on unmount - let it stay connected for other components
      // Pusher will automatically clean up when the page is closed
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

