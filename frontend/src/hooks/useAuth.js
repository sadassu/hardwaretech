import { useEffect, useState } from "react";
import api from "../utils/api"; // axios instance with { withCredentials: true }

export const useAuth = () => {
  const [user, setUser] = useState(null);

  // Check session on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me", { withCredentials: true });
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
        if (err.response?.status !== 401) {
          console.log(err);
        }
      }
    };
    fetchUser();
  }, []);

  // Login just calls backend (cookie will be auto-set)
  const login = async (credentials) => {
    const res = await api.post("/auth/login", credentials, {
      withCredentials: true,
    });
    setUser(res.data.user);
  };

  // Logout clears cookie server-side
  const logout = async () => {
    await api.post("/auth/logout", {}, { withCredentials: true });
    setUser(null);
  };

  return { user, login, logout, isAuthenticated: !!user };
};
