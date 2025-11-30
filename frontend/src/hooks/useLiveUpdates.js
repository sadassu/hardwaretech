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

// Singleton EventSource instance to prevent multiple connections
let eventSourceInstance = null;
let reconnectTimeout = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 seconds

const createEventSource = () => {
  try {
    // Get API base URL from environment or use default
    let apiBaseUrl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL || "http://localhost:5001";
    
    // Remove trailing slash if present
    apiBaseUrl = apiBaseUrl.replace(/\/$/, "");
    
    // If base URL already includes /api, use /events, otherwise use /api/events
    const eventSourceUrl = apiBaseUrl.endsWith("/api") 
      ? `${apiBaseUrl}/events`
      : `${apiBaseUrl}/api/events`;
    
    if (import.meta.env.DEV) {
      console.log(`🔌 Connecting to SSE endpoint: ${eventSourceUrl}`);
    }

    // EventSource automatically sends credentials for same-origin requests
    // For cross-origin, CORS must be configured on the server
    const eventSource = new EventSource(eventSourceUrl);

    eventSource.onopen = () => {
      // Reset reconnection attempts on successful connection
      reconnectAttempts = 0;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      if (import.meta.env.DEV) {
        console.log("✅ SSE connection established");
      }
      dispatchLiveEvent({ topics: ["general"], message: "sse-connected" });
    };

    eventSource.onmessage = (event) => {
      try {
        // Skip heartbeat messages (lines starting with ':')
        if (event.data.startsWith(":")) {
          return;
        }

        const payload = JSON.parse(event.data);
        if (import.meta.env.DEV) {
          console.log("📨 Received SSE update:", payload);
        }
        dispatchLiveEvent(payload);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn("⚠️ Failed to parse SSE message:", error);
        }
      }
    };

    eventSource.onerror = (error) => {
      // Check connection state
      const state = eventSource.readyState;
      
      // Only handle errors if connection is actually closed
      if (state === EventSource.CLOSED) {
        if (import.meta.env.DEV) {
          console.warn("⚠️ SSE connection closed, will reconnect...");
        }

        // Close the connection if not already closed
        if (eventSourceInstance === eventSource) {
          eventSource.close();
          eventSourceInstance = null;
        }

        // Clear any existing reconnect timeout
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          const delay = Math.min(RECONNECT_DELAY * reconnectAttempts, 10000); // Cap at 10 seconds
          
          if (import.meta.env.DEV) {
            console.log(`🔄 Reconnecting SSE in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
          }

          reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null;
            // Only reconnect if we don't have an active connection
            if (!eventSourceInstance) {
              eventSourceInstance = createEventSource();
              // Reset attempts on successful reconnect (handled in onopen)
            }
          }, delay);
        } else {
          if (import.meta.env.DEV) {
            console.error("❌ Max SSE reconnection attempts reached. Will retry after delay.");
          }
          // Reset attempts after a longer delay to allow recovery
          reconnectTimeout = setTimeout(() => {
            reconnectAttempts = 0;
            reconnectTimeout = null;
            if (!eventSourceInstance) {
              if (import.meta.env.DEV) {
                console.log("🔄 Resetting reconnection attempts, retrying...");
              }
              eventSourceInstance = createEventSource();
            }
          }, 30000); // Retry after 30 seconds
        }
      } else if (state === EventSource.CONNECTING) {
        // Connection is connecting, don't do anything
        if (import.meta.env.DEV) {
          console.log("🔄 SSE reconnecting...");
        }
      }
      // If state is OPEN, connection is fine, ignore transient errors
    };

    return eventSource;
  } catch (error) {
    console.error("❌ Failed to create SSE connection:", error);
    return null;
  }
};

export const useLiveUpdates = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Initialize EventSource if not already initialized
    if (!eventSourceInstance) {
      eventSourceInstance = createEventSource();
    }

    return () => {
      isMountedRef.current = false;
      // Don't close EventSource on unmount - let it stay connected for other components
      // EventSource will automatically clean up when the page is closed
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Clean up reconnect timeout if component unmounts
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };
  }, []);
};

export default useLiveUpdates;

