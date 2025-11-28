import React, { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import Modal from "../../components/Modal";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useProductStore } from "../../store/productStore";
import { useConfirm } from "../../hooks/useConfirm";
import { useQuickToast } from "../../hooks/useQuickToast";

const DeleteProduct = ({ product }) => {
  const { user } = useAuthContext();
  const { deleteProduct, loading } = useProductStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const confirm = useConfirm();
  const quickToast = useQuickToast();

  const handleDelete = async () => {
    if (!product?._id) {
      console.error("Product ID is missing");
      return;
    }

    const result = await confirm({
      title: `Delete ${product?.name || "this product"}?`,
      text: "This product and its variants will be removed permanently.",
      confirmButtonText: "Yes, delete product",
      icon: "error",
    });
    if (!result.isConfirmed) return;

    setIsDeleting(true);
    try {
      await deleteProduct(user.token, product._id);
      setIsOpen(false);

      quickToast({
        title: "Product deleted",
        icon: "success",
      });
    } catch (error) {
      console.error("Error deleting product:", error);

      quickToast({
        title: "Failed to delete product",
        text: error.response?.data?.message || "Please try again.",
        icon: "error",
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

    </>
  );
};

export default DeleteProduct;
