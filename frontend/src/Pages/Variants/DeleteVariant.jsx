import React, { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import Modal from "../../components/Modal";
import { useVariant } from "../../hooks/useVariant";
import { useConfirm } from "../../hooks/useConfirm";
import { useQuickToast } from "../../hooks/useQuickToast";

function DeleteVariant({ variant }) {
  const { deleteVariant } = useVariant();
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      {/* Delete button */}
        <button
        className="btn btn-sm gap-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white border-0 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200"
          onClick={() => setIsOpen(true)}
        title="Delete Variant"
        >
        <Trash2 className="w-4 h-4" />
        </button>

      {/* Confirmation Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        className="bg-white rounded-2xl max-w-md w-full p-0"
      >
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Delete Variant</h2>
              <p className="text-red-100 text-sm">This action cannot be undone</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete this variant? All stock and history will be permanently removed.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 btn btn-ghost border-2 border-gray-200 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </button>

            <button
              type="button"
              className="flex-1 btn bg-gradient-to-r from-red-500 to-red-600 text-white border-0 hover:from-red-600 hover:to-red-700 shadow-lg disabled:opacity-50"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  Deleting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Variant
                </span>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default DeleteVariant;
