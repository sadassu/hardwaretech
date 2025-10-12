import React, { useState } from "react";
import Modal from "../../components/Modal";
import TextInput from "../../components/TextInput";
import { useReservation } from "../../hooks/useReservation";

function CompleteReservation({ reservation, onCompleteSuccess }) {
  const { completeReservation } = useReservation();
  const [isOpen, setIsOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    try {
      setLoading(true);
      setError(null);

      const total = Number(reservation.amount || reservation.totalAmount || 0);
      const paid = Number(amountPaid);

      if (paid !== total) {
        setError("Insufficient amount. Must match total.");
        setLoading(false);
        return;
      }

      const updated = await completeReservation(reservation._id, paid);

      setIsOpen(false);
      if (onCompleteSuccess) onCompleteSuccess(updated);
    } catch (err) {
      setError(err.message);
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

        {reservation.amount && (
          <p className="text-sm text-gray-500 mb-2">
            Total Amount: ₱{reservation.amount}
          </p>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="btn btn-ghost"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
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
