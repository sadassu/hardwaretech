import React, { useState } from "react";
import Modal from "../../components/Modal";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useProductsContext } from "../../hooks/useProductContext";
import api from "../../utils/api"; // make sure you import your axios instance
import StatusToast from "../../components/StatusToast";

function DeleteProductsData() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthContext();
  const { dispatch } = useProductsContext();

  const [loading, setLoading] = useState(false); // <-- loading state

  const [toast, setToast] = useState({
    show: false,
    color: "",
    header: "",
    message: "",
  });

  const handleDelete = async () => {
    setLoading(true); // start loading
    try {
      await api.delete("delete/products", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      // Close modal after success
      setIsOpen(false);
      // Clear products from context state
      dispatch({ type: "CLEAR_PRODUCTS" });

      setToast({
        show: true,
        color: "success-toast",
        header: "Success 🎉",
        message: "All product data has been deleted successfully.",
      });
    } catch (error) {
      setToast({
        show: true,
        color: "error-toast",
        header: "Failed 🥲",
        message: `Failed to delete product data: ${
          error.response?.data?.message || error.message
        }`,
      });
    } finally {
      setLoading(false); // stop loading after success or failure
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
        Delete Product Data
      </button>

      <Modal isOpen={isOpen} onClose={() => !loading && setIsOpen(false)}>
        <div className="p-4">
          <p className="mb-4">
            Are you sure you want to delete all product data? This action cannot
            be undone.
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

export default DeleteProductsData;
