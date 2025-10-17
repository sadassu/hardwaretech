import React, { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import api from "../../utils/api";
import StatusToast from "../../components/StatusToast";
import Modal from "../../components/Modal";
import { useReservationStore } from "../../store/reservationStore";

function DeleteReservationsData() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthContext();
  const { reset } = useReservationStore();
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    color: "",
    header: "",
    message: "",
  });

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete("delete/reservations", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // ✅ Reset Zustand reservation state
      reset();
      setIsOpen(false);

      setToast({
        show: true,
        color: "success-toast",
        header: "Success 🎉",
        message: "All reservation data has been deleted successfully.",
      });
    } catch (error) {
      setToast({
        show: true,
        color: "error-toast",
        header: "Failed 🥲",
        message: `Failed to delete reservation data: ${
          error.response?.data?.message || error.message
        }`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusToast
        show={toast.show}
        color={toast.color}
        header={toast.header}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <button onClick={() => setIsOpen(true)} className="btn btn-warning">
        Delete Reservation Data
      </button>

      <Modal isOpen={isOpen} onClose={() => !loading && setIsOpen(false)}>
        <div className="p-4">
          <p className="mb-4">
            Are you sure you want to delete all reservation data? This action
            cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleDelete}
              className={`btn btn-danger ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Confirm Delete"}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default DeleteReservationsData;
