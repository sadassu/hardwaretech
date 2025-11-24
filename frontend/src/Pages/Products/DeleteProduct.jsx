import React, { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import Modal from "../../components/Modal";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useProductStore } from "../../store/productStore";
import StatusToast from "../../components/StatusToast"; // ✅ import your toast

const DeleteProduct = ({ product }) => {
  const { user } = useAuthContext();
  const { deleteProduct, loading } = useProductStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    color: "",
    header: "",
    message: "",
  });

  const handleDelete = async () => {
    if (!product?._id) {
      console.error("Product ID is missing");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProduct(user.token, product._id);
      setIsOpen(false);

      setToast({
        show: true,
        color: "border-green-500 bg-green-100 text-green-700",
        header: "Success",
        message: "Product deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting product:", error);

      setToast({
        show: true,
        color: "border-red-500 bg-red-100 text-red-700",
        header: "Error",
        message: "Failed to delete product. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Delete button */}
        <button
        className="btn btn-sm btn-ghost gap-1.5 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
          onClick={() => setIsOpen(true)}
        title="Delete Product"
        >
        <Trash2 className="w-4 h-4" />
        </button>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">
            Delete Product
          </h3>

          <p className="text-sm text-gray-300 mb-6">
            Are you sure you want to delete{" "}
            <span className="font-medium text-red-400">
              “{product?.name || "this product"}”
            </span>
            ? This action cannot be undone.
          </p>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-error flex items-center gap-2 text-gray-200"
              onClick={handleDelete}
              disabled={isDeleting || loading}
            >
              {isDeleting ? (
                <>
                  <span className="loading loading-spinner loading-sm text-gray-200"></span>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ✅ Toast */}
      <StatusToast
        color={toast.color}
        header={toast.header}
        message={toast.message}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </>
  );
};

export default DeleteProduct;
