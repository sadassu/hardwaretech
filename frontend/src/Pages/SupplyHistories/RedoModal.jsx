import React, { useState } from "react";
import Modal from "../../components/Modal";

function RedoModal({ user, history, redoSupplyHistory }) {
  const [isOpen, setIsOpen] = useState(false);
  const [redoLoading, setRedoLoading] = useState(false);

  const handleRedoConfirm = async () => {
    if (!history || !user?.token) return;

    setRedoLoading(true);
    try {
      await redoSupplyHistory({
        id: history._id,
        token: user.token,
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Redo failed:", error);
      alert(error.message || "Failed to redo supply history");
    } finally {
      setRedoLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-sm btn-outline bg-red-500 text-white hover:scale-105"
      >
        Redo
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Redo Supply</h2>
          <p className="mb-4">
            Are you sure you want to redo this supply for{" "}
            <span className="font-medium">
              {history?.product_variant?.product?.name || "Unknown product"}
            </span>
            ?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-outline"
              disabled={redoLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleRedoConfirm}
              className={`btn btn-warning ${redoLoading ? "loading" : ""}`}
              disabled={redoLoading}
            >
              {redoLoading ? "Redoing..." : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default RedoModal;
