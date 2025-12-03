import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useProductStore } from "../../store/productStore";
import { useConfirm } from "../../hooks/useConfirm";
import { useQuickToast } from "../../hooks/useQuickToast";

const DeleteProduct = ({ product }) => {
  const { user } = useAuthContext();
  const { deleteProduct, loading } = useProductStore();

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
    <button
      className="btn btn-sm btn-ghost gap-1.5 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 disabled:opacity-50"
      onClick={handleDelete}
      disabled={isDeleting || loading}
      title="Delete Product"
    >
      {isDeleting ? (
        <span className="loading loading-spinner loading-sm"></span>
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
};

export default DeleteProduct;
