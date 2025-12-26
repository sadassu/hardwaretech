import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { useVariant } from "../../hooks/useVariant";
import { useConfirm } from "../../hooks/useConfirm";
import { useQuickToast } from "../../hooks/useQuickToast";

function DeleteVariant({ variant }) {
  const { deleteVariant } = useVariant();
  const [isDeleting, setIsDeleting] = useState(false);
  const confirm = useConfirm();
  const quickToast = useQuickToast();

  const handleDelete = async () => {
    const result = await confirm({
      title: "Delete this variant?",
      text: "Variant stock and history will be removed.",
      confirmButtonText: "Yes, delete variant",
      icon: "error",
    });
    if (!result.isConfirmed) return;

    setIsDeleting(true);
    try {
      await deleteVariant(variant._id);
      quickToast({
        title: "Variant deleted",
        icon: "success",
      });
    } catch (error) {
      quickToast({
        title: "Failed to delete variant",
        text: error.response?.data?.message || error.message,
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
      disabled={isDeleting}
      title="Delete Variant"
    >
      {isDeleting ? (
        <span className="loading loading-spinner loading-sm"></span>
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}

export default DeleteVariant;
