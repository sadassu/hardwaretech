// hooks/useAuthorize.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./useAuthContext";

export function useAuthorize(userId) {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userId !== user.userId) {
      navigate("/unauthorized");
    }
  }, [userId, user, navigate]);
}
