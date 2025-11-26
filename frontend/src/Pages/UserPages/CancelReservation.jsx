import React, { useState } from "react";
import Modal from "../../components/Modal";
import { useReservation } from "../../hooks/useReservation";

function CancelReservation({ reservationId }) {
  const { cancelReservation } = useReservation();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await cancelReservation(reservationId);
      // Only close modal if cancellation was successful (result is not null)
      if (result !== null) {
        setIsOpen(false);
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
      <button onClick={() => setIsOpen(true)} className="btn btn-warning">
        Cancel Reservation
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <p>Are you sure you want to cancel this reservation?</p>

        <div className="flex gap-3 mt-4 justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            No
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Cancelling..." : "Yes, Cancel"}
          </button>
        </div>
      </Modal>
    </>
  );
}

export default CancelReservation;
