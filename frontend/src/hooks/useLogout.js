import { useAuthContext } from "./useAuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export const useLogout = () => {
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      // Call backend to clear cookie
      await api.post("/auth/logout", {}, { withCredentials: true });

      // Clear frontend state & storage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("cart");
      localStorage.removeItem("reservation-storage");

      dispatch({ type: "LOGOUT" });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return { logout };
};
