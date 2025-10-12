import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/login", { email, password });
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
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return { login, isLoading, error };
};
