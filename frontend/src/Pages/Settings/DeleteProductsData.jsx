import React, { useState } from "react";
import Modal from "../../components/Modal";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useProductStore } from "../../store/productStore"; // ✅ import store
import api from "../../utils/api";
import { useConfirm } from "../../hooks/useConfirm";
import { useQuickToast } from "../../hooks/useQuickToast";

function DeleteProductsData() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthContext();
  const { setProducts } = useProductStore(); // ✅ get setter from store

  const [loading, setLoading] = useState(false);
  const confirm = useConfirm();
  const quickToast = useQuickToast();

  const handleDelete = async () => {
    const result = await confirm({
      title: "Delete all products?",
      text: "This will permanently remove every product record. This action cannot be undone.",
      confirmButtonText: "Yes, delete all products",
      icon: "error",
    });
    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await api.delete("/delete/products", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // ✅ Clear products in Zustand store
      setProducts({
        products: [],
        total: 0,
        page: 1,
        pages: 1,
      });

      // ✅ Close modal after success
      setIsOpen(false);

      quickToast({
        title: "Products cleared",
        icon: "success",
      });
    } catch (error) {
      quickToast({
        title: "Failed to delete product data",
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
