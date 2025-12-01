import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { AuthContextProvider } from "./context/AuthContext";
import { SaleContextProvider } from "./context/SaleContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Suppress ERR_NETWORK_IO_SUSPENDED errors from Vercel Speed Insights
// This is a benign error that occurs when the browser suspends network activity
// (e.g., tab goes to background, page unloads) before analytics requests complete
if (typeof window !== "undefined") {
  const originalError = window.console.error;
  window.console.error = (...args) => {
    const errorMessage = args[0]?.toString() || "";
    // Filter out ERR_NETWORK_IO_SUSPENDED errors from Speed Insights
    if (
      errorMessage.includes("ERR_NETWORK_IO_SUSPENDED") &&
      errorMessage.includes("api/events")
    ) {
      // Silently ignore - this is expected behavior for analytics requests
      return;
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthContextProvider>
          <SaleContextProvider>
            <App />
            <SpeedInsights />
          </SaleContextProvider>
        </AuthContextProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
