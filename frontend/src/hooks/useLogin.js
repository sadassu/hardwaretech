import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  // ✅ Added captchaToken parameter
  const login = async (email, password, captchaToken) => {
    setIsLoading(true);
    setError(null);

    try {
      // Send captchaToken to backend
      const response = await api.post("/auth/login", {
        email,
        password,
        captchaToken,
      });

      const json = response.data;

      // Save user and update context
      localStorage.setItem("user", JSON.stringify(json));
      dispatch({ type: "LOGIN", payload: json });

      // ✅ Role-based redirect
      const roles = json.roles || [];
      if (roles.includes("admin")) {
        navigate("/dashboard");
      } else if (roles.includes("cashier")) {
        navigate("/pos");
      } else {
        navigate("/");
      }

      setIsLoading(false);
      return response.data; // <-- ✅ this returns the json your component expects
    } catch (err) {
      setIsLoading(false);
      // Handle captcha or login errors
      if (err.response?.data?.error === "Invalid reCAPTCHA") {
        setError("Captcha verification failed. Please try again.");
      } else {
        setError(err.response?.data?.message || "Login failed");
      }
    }
  };

  return { login, isLoading, error };
};
