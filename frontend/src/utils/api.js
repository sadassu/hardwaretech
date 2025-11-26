// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_BACKEND_BASEURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token before every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Handle expired/invalid token responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      // Don't redirect or clear storage for user reservation cancellation
      // Let the component handle the error gracefully
      const url = error.config?.url || "";
      if (url.includes("/reservations/") && url.includes("/cancel")) {
        // Return error without clearing storage or redirecting
        // The component will handle this error appropriately
        return Promise.reject(error);
      }

      // For other endpoints, clear stale user data and redirect
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
