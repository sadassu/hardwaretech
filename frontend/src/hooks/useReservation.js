import { useToast } from "../context/ToastContext";
import api from "../utils/api";
import { useAuthContext } from "./useAuthContext";
import { useReservationsContext } from "./useReservationContext";

export const useReservation = () => {
  const { user } = useAuthContext();
  const { dispatch } = useReservationsContext();
  const setToast = useToast();

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

      dispatch({
        type: "UPDATE_RESERVATION",
        payload: updatedReservation,
      });

      setToast({
        show: true,
        color: "success-toast",
        header: "Success",
        message: res.data.message || "Reservation Status Updated!",
      });
    } catch (error) {
      setToast({
        show: true,
        color: "error-toast",
        header: "Error",
        message:
          error.response?.data?.message ||
          "Failed to update status of reservation",
      });
      throw error;
    }
  };

  return { updateReservationStatus };
};
