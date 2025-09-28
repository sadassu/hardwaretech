import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { AuthContextProvider } from "./context/AuthContext";
import { ProductContextProvider } from "./context/ProductContext.jsx";
import { ReservationContextProvider } from "./context/ReservationContext.jsx";
import { SaleContextProvider } from "./context/SaleContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <ReservationContextProvider>
          <ProductContextProvider>
            <SaleContextProvider>
              <App />
            </SaleContextProvider>
          </ProductContextProvider>
        </ReservationContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </StrictMode>
);
