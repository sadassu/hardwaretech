import React, { useState } from "react";
import api from "../../utils/api";
import { useAuthContext } from "../../hooks/useAuthContext";
import Modal from "../../components/Modal";
import { useConfirm } from "../../hooks/useConfirm";
import { useQuickToast } from "../../hooks/useQuickToast";

function DeleteSupplyHistoryData() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const confirm = useConfirm();
  const quickToast = useQuickToast();

  const handleDelete = async () => {
    const result = await confirm({
      title: "Delete all supply history?",
      text: "Supply records will be wiped permanently.",
      confirmButtonText: "Yes, delete supply history",
      icon: "error",
    });
    if (!result.isConfirmed) return;

    setLoading(true); // start loading
    try {
      await api.delete("delete/supply-histories", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setIsOpen(false);

      quickToast({
        title: "Supply history deleted",
        icon: "success",
      });
    } catch (error) {
      quickToast({
        title: "Failed to delete supply histories data",
        text: error.response?.data?.message || error.message,
        icon: "error",
      });
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-warning">
        Delete Supply History Data
      </button>

      <Modal isOpen={isOpen} onClose={() => !loading && setIsOpen(false)}>
        <div className="p-4">
          <p className="mb-4">
            Are you sure you want to delete all Supply History data? This action
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

export default DeleteSupplyHistoryData;
