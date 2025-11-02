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

  const change =
    Number(amountPaid) > 0 ? Number(amountPaid) - reservation.totalPrice : 0;

  const handleComplete = async () => {
    try {
      setLoading(true);
      setError(null);

      const paid = Number(amountPaid);

      if (paid < reservation.totalPrice) {
        setError("Insufficient amount.");
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
        <h2 className="text-xl font-semibold mb-2">Complete Reservation</h2>
        <p className="text-gray-600 mb-4">
          Enter the payment amount to mark this reservation as{" "}
          <span className="font-semibold text-green-600">completed</span>.
        </p>

        <div className="bg-gray-100 p-3 rounded-md mb-4 flex justify-between items-center">
          <span className="text-sm text-gray-600 font-medium">
            Total Amount:
          </span>
          <span className="text-lg font-semibold text-gray-800">
            ₱{reservation.totalPrice.toLocaleString()}
          </span>
        </div>

        <TextInput
          label="Amount Paid"
          type="number"
          placeholder="Enter amount paid"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
        />

        {Number(amountPaid) > 0 && (
          <div className="bg-gray-100 p-3 rounded-md mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600 font-medium">Change:</span>
            <span
              className={`text-lg font-semibold ${
                change >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ₱{change.toLocaleString()}
            </span>
          </div>
        )}

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-6">
          <button
            className="btn btn-ghost"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn bg-green-600 text-white border-green-600"
            onClick={handleComplete}
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm Payment"}
          </button>
        </div>
      </Modal>
    </>
  );
}

export default CompleteReservation;
