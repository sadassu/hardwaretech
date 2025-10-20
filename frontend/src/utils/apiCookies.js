// src/utils/apiCookies.js
import axios from "axios";

const apiCookies = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_BACKEND_BASEURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ Always send cookies (for auth/session)
});

// ✅ Optional Response Interceptor
apiCookies.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      // Remove any client-stored user info if unauthorized
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiCookies;
