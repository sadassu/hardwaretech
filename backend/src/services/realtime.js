import Pusher from "pusher";

let pusherInstance = null;

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

export const initRealtime = () => {
  // Check if Pusher credentials are configured
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER || "ap1";

  if (!appId || !key || !secret) {
    console.warn("⚠️ Pusher credentials not configured. Real-time updates will be disabled.");
    console.warn("   Set PUSHER_APP_ID, PUSHER_KEY, and PUSHER_SECRET in your environment variables.");
    return null;
  }

  pusherInstance = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
    // Performance optimizations
    enabledTransports: ["ws", "wss"], // WebSocket only for better performance
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("✅ Pusher initialized for real-time updates");
  }

  return pusherInstance;
};

export const emitGlobalUpdate = (payload = {}) => {
  if (!pusherInstance) {
    // Only warn in development if Pusher is not initialized
    if (process.env.NODE_ENV !== "production") {
      console.warn("⚠️ Pusher instance not initialized. Cannot emit update.");
    }
    return;
  }

  const enrichedPayload = {
    timestamp: Date.now(),
    message: "System updated",
    ...payload,
  };

  if (!enrichedPayload.topics || !enrichedPayload.topics.length) {
    enrichedPayload.topics = deriveTopicsFromPath(enrichedPayload.path);
  }

  // Log in development for debugging
  if (process.env.NODE_ENV !== "production") {
    console.log(`📡 Emitting Pusher update for topics:`, enrichedPayload.topics);
  }

  // Emit to each topic channel
  enrichedPayload.topics.forEach((topic) => {
    try {
      const channelName = `hardware-tech-${topic}`;
      pusherInstance.trigger(channelName, "app:update", enrichedPayload);
      if (process.env.NODE_ENV !== "production") {
        console.log(`✅ Emitted to channel: ${channelName}`);
      }
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV !== "production") {
        console.error(`❌ Failed to emit update to topic "${topic}":`, error);
      }
    }
  });

  // Also emit to general channel
  try {
    pusherInstance.trigger("hardware-tech-general", "app:update", enrichedPayload);
    if (process.env.NODE_ENV !== "production") {
      console.log(`✅ Emitted to channel: hardware-tech-general`);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("❌ Failed to emit update to general channel:", error);
    }
  }
};

