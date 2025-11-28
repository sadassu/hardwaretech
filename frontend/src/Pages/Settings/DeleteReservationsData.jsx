import React, { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import api from "../../utils/api";
import Modal from "../../components/Modal";
import { useReservationStore } from "../../store/reservationStore";
import { useConfirm } from "../../hooks/useConfirm";
import { useQuickToast } from "../../hooks/useQuickToast";

function DeleteReservationsData() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthContext();
  const { reset } = useReservationStore();
  const [loading, setLoading] = useState(false);
  const confirm = useConfirm();
  const quickToast = useQuickToast();

  const handleDelete = async () => {
    const result = await confirm({
      title: "Delete all reservations?",
      text: "All reservation records will be permanently removed.",
      confirmButtonText: "Yes, delete reservations",
      icon: "error",
    });
    if (!result.isConfirmed) return;

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

      quickToast({
        title: "Reservations deleted",
        icon: "success",
      });
    } catch (error) {
      quickToast({
        title: "Failed to delete reservation data",
        text: error.response?.data?.message || error.message,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
