import { useState } from "react";
import api from "../utils/api";

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const signup = async (
    name,
    email,
    password,
    confirmPassword,
    captchaToken
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        confirmPassword,
        captchaToken,
      });

      const json = response.data;

      setIsLoading(false);
      return json;
    } catch (err) {
      setIsLoading(false);
      // Backend returns { error: "message" } for errors
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Signup failed. Please try again.";
      setError(errorMessage);
      return null;
    }
  };

  return { signup, isLoading, error };
};
