// src/hooks/useReservation.js
import { useToast } from "../context/ToastContext";
import { useReservationStore } from "../store/reservationStore";
import api from "../utils/api";
import { useAuthContext } from "./useAuthContext";

export const useReservation = () => {
  const { user } = useAuthContext();
  const setToast = useToast();
  const { 
    updateReservation, 
    fetchReservations, 
    fetchUserReservations,
    statusFilter,
    page,
    updateStatusCounts,
    setStatusFilter
  } = useReservationStore();

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
      const newStatus = updatedReservation.status || formData.status;

      // Automatically switch to the tab that matches the new status
      setStatusFilter(newStatus);

      // Refresh the list with the new status filter to show the updated reservation
      await fetchReservations(user.token, {
        page: 1, // Reset to page 1 when switching tabs
        limit: 20,
        status: newStatus,
      });

      // Update status counts to reflect the change
      await updateStatusCounts(user.token);

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

  const cancelReservation = async (reservationId) => {
    if (!user) throw new Error("You must be logged in.");

    try {
      const res = await api.patch(
        `/reservations/${reservationId}/cancel`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const updatedReservation = res.data.reservation || res.data;
      updateReservation(updatedReservation);
      
      // Refresh user reservations with current filter
      await fetchUserReservations(user.token, user.userId, {
        page,
        limit: 20,
        status: "all", // User reservations page typically shows all
      });
      
      // Update status counts
      await updateStatusCounts(user.token);

      setToast({
        show: true,
        color: "success-toast",
        header: "Success",
        message: res.data.message || "Reservation cancelled successfully!",
      });

      return updatedReservation;
    } catch (error) {
      console.error("Failed to cancel reservation:", error);

      setToast({
        show: true,
        color: "error-toast",
        header: "Error",
        message:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to cancel reservation",
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
      const newStatus = "completed"; // Completing a reservation sets status to "completed"

      // Automatically switch to the "completed" tab to show the completed reservation
      setStatusFilter(newStatus);

      // Refresh the list with the completed status filter
      await fetchReservations(user.token, {
        page: 1, // Reset to page 1 when switching tabs
        limit: 20,
        status: newStatus,
      });

      // ✅ Update status counts
      await updateStatusCounts(user.token);

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

  return { updateReservationStatus, completeReservation, cancelReservation };
};
