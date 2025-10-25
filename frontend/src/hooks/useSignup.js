import { useState } from "react";
import api from "../utils/api";
import { useAuthContext } from "./useAuthContext";

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();

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

      localStorage.setItem("user", JSON.stringify(json));
      dispatch({ type: "LOGIN", payload: json });

      setIsLoading(false);
      return json;
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || "Signup failed");
      return null;
    }
  };

  return { signup, isLoading, error };
};
