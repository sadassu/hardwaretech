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

      console.log("Login response from backend:", json);
      console.log("Roles received:", json.roles);

      // Save user and update context
      localStorage.setItem("user", JSON.stringify(json));
      dispatch({ type: "LOGIN", payload: json });

      // ✅ Role-based redirect with replace to prevent back button issues
      const roles = Array.isArray(json.roles) ? json.roles : [json.roles || "user"];
      
      console.log("Processed roles:", roles);
      console.log("Includes admin?", roles.includes("admin"));
      
      if (roles.includes("admin")) {
        console.log("Navigating to /dashboard");
        navigate("/dashboard", { replace: true });
      } else if (roles.includes("cashier")) {
        console.log("Navigating to /pos");
        navigate("/pos", { replace: true });
      } else {
        console.log("Navigating to /");
        navigate("/", { replace: true });
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
      throw err; // Re-throw to let component handle it
    }
  };

  return { login, isLoading, error };
};
