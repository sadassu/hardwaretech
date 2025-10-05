import React, { useState } from "react";
import { useReservationsContext } from "../../hooks/useReservationContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import Modal from "../../components/Modal";
import api from "../../utils/api";
import TextInput from "../../components/TextInput";

function CompleteReservation({ reservation, onCompleteSuccess }) {
  const { dispatch } = useReservationsContext();
  const { user } = useAuthContext();

  const [isOpen, setIsOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!user) {
      setError("You must be logged in.");
      return;
    }

    if (!amountPaid || isNaN(amountPaid)) {
      setError("Please enter a valid amount paid.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.patch(
        `/reservations/${reservation._id}/complete`,
        { amountPaid: Number(amountPaid) },
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

      setIsOpen(false);
      if (onCompleteSuccess) onCompleteSuccess(updatedReservation);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="btn btn-sm btn-outline"
        onClick={() => setIsOpen(true)}
      >
        Complete
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">Complete Reservation</h2>
        <p className="mb-4">
          Enter payment to mark this reservation as{" "}
          <span className="font-semibold text-green-600">completed</span>.
        </p>

        <TextInput
          label="Amount Paid"
          type="number"
          placeholder="Amount Paid"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn bg-red-500 text-white border-red-500"
            onClick={handleComplete}
            disabled={loading}
          >
            {loading ? "Processing..." : "Yes, Complete"}
          </button>
        </div>
      </Modal>
    </>
  );
}

export default CompleteReservation;
