// src/hooks/useReservation.js
import { useToast } from "../context/ToastContext";
import { useReservationStore } from "../store/reservationStore";
import api from "../utils/api";
import { useAuthContext } from "./useAuthContext";

export const useReservation = () => {
  const { user } = useAuthContext();
  const setToast = useToast();
  const { updateReservation, fetchReservations } = useReservationStore();

  // ✅ Update reservation status (existing)
  const updateReservationStatus = async (reservationId, formData) => {
    try {
      const res = await api.put(
        `/reservations/${reservationId}/status`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const updatedReservation = res.data.reservation || res.data;

      updateReservation(updatedReservation);
      await fetchReservations(user.token);

      setToast({
        show: true,
        color: "success-toast",
        header: "Success",
        message: res.data.message || "Reservation status updated!",
      });

      return updatedReservation;
    } catch (error) {
      console.error("Failed to update reservation status:", error);
      setToast({
        show: true,
        color: "error-toast",
        header: "Error",
        message:
          error.response?.data?.message ||
          "Failed to update reservation status",
      });
      throw error;
    }
  };

  // ✅ Complete reservation (new)
  const completeReservation = async (reservationId, amountPaid) => {
    if (!user) throw new Error("You must be logged in.");

    if (!amountPaid || isNaN(amountPaid))
      throw new Error("Please enter a valid amount paid.");

    try {
      const res = await api.patch(
        `/reservations/${reservationId}/complete`,
        { amountPaid: Number(amountPaid) },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const updatedReservation = res.data.reservation || res.data;

      // ✅ Update Zustand store
      updateReservation(updatedReservation);

      // ✅ Optionally refresh list
      await fetchReservations(user.token);

      setToast({
        show: true,
        color: "success-toast",
        header: "Success",
        message: res.data.message || "Reservation completed successfully!",
      });

      return updatedReservation;
    } catch (error) {
      console.error("Failed to complete reservation:", error);

      setToast({
        show: true,
        color: "error-toast",
        header: "Error",
        message:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to complete reservation",
      });

      throw error;
    }
  };

  return { updateReservationStatus, completeReservation };
};
