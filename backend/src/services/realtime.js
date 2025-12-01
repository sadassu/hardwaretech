// services/realtime.js
// Re-export WebSocket functions for backward compatibility
export {
  initWebSocketServer as initRealtime,
  emitGlobalUpdate,
  deriveTopicsFromPath,
  getWebSocketServer,
  getConnectionStats,
} from "./websocketServer.js";

