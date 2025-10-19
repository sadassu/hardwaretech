import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { AuthContextProvider } from "./context/AuthContext";
import { SaleContextProvider } from "./context/SaleContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { SpeedInsights } from "@vercel/speed-insights/react";

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
