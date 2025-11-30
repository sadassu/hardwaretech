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
      reconnectAttempts = 0;
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
      if (import.meta.env.DEV) {
        console.warn("⚠️ SSE connection error:", error);
      }

      // Close the connection
      eventSource.close();
      eventSourceInstance = null;

      // Attempt to reconnect
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = RECONNECT_DELAY * reconnectAttempts;
        
        if (import.meta.env.DEV) {
          console.log(`🔄 Reconnecting SSE in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        }

        reconnectTimeout = setTimeout(() => {
          eventSourceInstance = createEventSource();
        }, delay);
      } else {
        if (import.meta.env.DEV) {
          console.error("❌ Max SSE reconnection attempts reached. Please refresh the page.");
        }
      }
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

