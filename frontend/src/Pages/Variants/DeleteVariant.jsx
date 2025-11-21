import React, { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import Modal from "../../components/Modal";
import { useVariant } from "../../hooks/useVariant";

function DeleteVariant({ variant }) {
  const { deleteVariant } = useVariant();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteVariant(variant._id);
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
        title="Delete Variant"
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
            Delete Variant
          </h3>

          <p className="text-sm text-gray-300 mb-6">
            Are you sure you want to delete this variant? This action cannot be
            undone.
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
              disabled={isDeleting}
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
}

export default DeleteVariant;
