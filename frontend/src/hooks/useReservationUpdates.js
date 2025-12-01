// hooks/useReservationUpdates.js
import { useState, useEffect } from "react";
import api from "../utils/api";
import { useAuthContext } from "./useAuthContext";

/**
 * Hook to fetch and manage reservation updates
 * @param {string} reservationId - ID of the reservation
 * @param {boolean} autoFetch - Whether to fetch updates automatically on mount
 */
export const useReservationUpdates = (reservationId, autoFetch = true) => {
  const { user } = useAuthContext();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchUpdates = async (page = 1, limit = 50) => {
    if (!reservationId || !user?.token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/reservations/${reservationId}/updates`, {
        params: { page, limit },
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setUpdates(response.data.updates || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch reservation updates:", err);
      setError(err.response?.data?.message || "Failed to fetch updates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && reservationId && user?.token) {
      fetchUpdates();
    }
  }, [reservationId, user?.token, autoFetch]);

  return {
    updates,
    loading,
    error,
    total,
    fetchUpdates,
    refreshUpdates: () => fetchUpdates(),
  };
};

export default useReservationUpdates;

