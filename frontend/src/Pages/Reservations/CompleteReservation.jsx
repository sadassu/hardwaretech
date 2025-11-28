import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Modal from "../../components/Modal";
import { useReservation } from "../../hooks/useReservation";
import { useConfirm } from "../../hooks/useConfirm";
import { useQuickToast } from "../../hooks/useQuickToast";

function CompleteReservation({ reservation, onCompleteSuccess }) {
  const { completeReservation } = useReservation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const confirm = useConfirm();
  const quickToast = useQuickToast();

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
      const result = await confirm({
        title: "Complete this reservation?",
        text: "This will convert the reservation into a sale.",
        confirmButtonText: "Yes, process payment",
      });
      if (!result.isConfirmed) {
        setLoading(false);
        return;
      }

      const updated = await completeReservation(reservation._id, paid);

      setIsOpen(false);
      quickToast({
        title: "Reservation completed",
        icon: "success",
      });
      if (onCompleteSuccess) onCompleteSuccess(updated);
      
      // Redirect to sales page to verify the sale was added
      navigate("/sales", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="btn btn-sm btn-ghost gap-1.5 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
        onClick={() => setIsOpen(true)}
        title="Complete Reservation"
      >
        <CheckCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Complete</span>
      </button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        className="bg-white rounded-2xl max-w-lg w-full p-0"
      >
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Complete Reservation</h2>
              <p className="text-green-100 text-sm">Process payment and finalize</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Total Amount Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium mb-1">Total Amount Due</p>
                <p className="text-3xl font-bold text-blue-900">
                  ₱{reservation.totalPrice.toLocaleString()}
                </p>
              </div>
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          {/* Amount Paid Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount Paid by Customer
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">₱</span>
              <input
          type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
                className="input input-bordered w-full pl-10 pr-4 py-3 text-lg font-semibold bg-white border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
              />
            </div>
          </div>

          {/* Change Display */}
        {Number(amountPaid) > 0 && (
            <div className={`rounded-xl p-4 border-2 ${
              change >= 0 
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-1 ${
                    change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {change >= 0 ? 'Change to Return' : 'Insufficient Amount'}
                  </p>
                  <p className={`text-3xl font-bold ${
                    change >= 0 ? 'text-green-900' : 'text-red-900'
                  }`}>
                    ₱{Math.abs(change).toLocaleString()}
                  </p>
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  change >= 0 ? 'bg-green-200' : 'bg-red-200'
                }`}>
                  <span className="text-2xl">{change >= 0 ? '💵' : '⚠️'}</span>
                </div>
              </div>
          </div>
        )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center gap-3">
              <span className="text-red-500 text-xl">⚠️</span>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
          <button
              className="flex-1 btn btn-ghost border-2 border-gray-200 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
              className="flex-1 btn bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:from-green-600 hover:to-emerald-700 shadow-lg disabled:opacity-50"
            onClick={handleComplete}
              disabled={loading || !amountPaid || Number(amountPaid) < reservation.totalPrice}
          >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Confirm Payment
                </span>
              )}
          </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default CompleteReservation;
