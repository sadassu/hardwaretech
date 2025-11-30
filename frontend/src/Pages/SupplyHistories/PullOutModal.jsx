import React, { useMemo, useState } from "react";
import { ArchiveRestore } from "lucide-react";
import Modal from "../../components/Modal";

function PullOutModal({ user, history, pullOutSupplyHistory }) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableFromHistory = useMemo(() => {
    return Math.max(
      0,
      (history?.quantity || 0) - (history?.pulledOutQuantity || 0)
    );
  }, [history]);

  const currentVariantStock = history?.product_variant?.quantity || 0;
  const maxPullable = Math.min(availableFromHistory, currentVariantStock);

  const estimatedLoss = useMemo(() => {
    const qty = Number(quantity) || 0;
    const price = history?.supplier_price || 0;
    return qty * price;
  }, [quantity, history?.supplier_price]);

  const resetState = () => {
    setQuantity("");
    setNotes("");
    setError("");
  };

  const handleOpen = () => {
    resetState();
    setIsOpen(true);
  };

  const handleClose = () => {
    if (loading) return;
    setIsOpen(false);
  };

  const handleConfirm = async () => {
    if (!user?.token || !history?._id) return;

    const parsedQuantity = Number(quantity);
    if (!parsedQuantity || parsedQuantity <= 0) {
      setError("Please enter a quantity greater than zero.");
      return;
    }

    if (parsedQuantity > maxPullable) {
      setError(`Maximum pull out allowed is ${maxPullable} unit(s).`);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await pullOutSupplyHistory({
        id: history._id,
        token: user.token,
        quantity: parsedQuantity,
        notes,
      });
      setIsOpen(false);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to pull out stock.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="btn btn-sm btn-ghost gap-1.5 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
        title="Pull out from this supply"
      >
        <ArchiveRestore className="w-4 h-4" />
        <span className="hidden sm:inline">Pull Out</span>
      </button>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">Pull Out Stocks</h2>
            <p className="text-sm text-base-content/70">
              Select how many units you want to remove from this supply record.
            </p>
          </div>

          <div className="rounded-lg bg-base-200 p-3 text-sm space-y-1">
            <p className="font-semibold text-base-content">
              {history?.product_variant?.product?.name || history?.productName || "Unknown product"}
            </p>
            <p className="text-base-content/70">
              Available from this supply:{" "}
              <span className="font-semibold text-base-content">
                {availableFromHistory} unit(s)
              </span>
            </p>
            <p className="text-base-content/70">
              Current variant stock:{" "}
              <span className="font-semibold text-base-content">
                {currentVariantStock} unit(s)
              </span>
            </p>
            <p className="text-base-content/70">
              Supplier price: ₱
              {(history?.supplier_price || 0).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="space-y-3">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-sm font-medium">
                  Quantity to pull out
                </span>
                <span className="label-text-alt text-xs text-base-content/70">
                  Max: {maxPullable}
                </span>
              </div>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Enter quantity"
              />
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-sm font-medium">Notes (optional)</span>
              </div>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="textarea textarea-bordered"
                placeholder="Reason / reference"
              ></textarea>
            </label>

            <div className="text-sm text-base-content/70">
              Estimated lost money:{" "}
              <span className="font-semibold text-error">
                ₱
                {estimatedLoss.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 p-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="btn btn-outline btn-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`btn btn-error btn-sm ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Pull Out"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default PullOutModal;

