import React, { useState } from "react";
import { useReservation } from "../../hooks/useReservation";
import { useConfirm } from "../../hooks/useConfirm";

function CancelReservation({ reservationId }) {
  const { cancelReservation } = useReservation();
  const [loading, setLoading] = useState(false);
  const confirm = useConfirm();

  const handleCancelClick = async () => {
    const result = await confirm({
      title: "Cancel this reservation?",
      text: "Any reserved stock will be released.",
      confirmButtonText: "Yes, cancel reservation",
    });
    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      const result = await cancelReservation(reservationId);
      // Success alert removed as requested; nothing else to do here.
      if (result === null) {
        // Auth error already handled via toast in hook
        return;
      }
      // If result is null, it means there was an auth error that was handled gracefully
      // User stays on the page and sees the error toast
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      // Error is already handled in cancelReservation hook with toast notification
      // User remains on the page
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleCancelClick}
        className="btn btn-warning"
        disabled={loading}
      >
        {loading ? "Cancelling..." : "Cancel Reservation"}
      </button>
    </>
  );
}

export default CancelReservation;
