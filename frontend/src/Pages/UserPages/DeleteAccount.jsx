import React, { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import Modal from "../../components/Modal";
import api from "../../utils/api";
import { Trash, AlertTriangle } from "lucide-react";
import { useConfirm } from "../../hooks/useConfirm";
import { useQuickToast } from "../../hooks/useQuickToast";

function DeleteAccount({ className = "", icon: Icon }) {
  const { user, deleteAccount } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  const confirm = useConfirm();
  const quickToast = useQuickToast();

  const handleDelete = async () => {
    setError(null);
    setSuccess(null);

    if (confirmText.toLowerCase() !== "delete") {
      setError('Please type "delete" to confirm.');
      return;
    }

    const result = await confirm({
      title: "Delete account?",
      text: "This will permanently remove your account and data.",
      confirmButtonText: "Yes, delete account",
      icon: "error",
    });
    if (!result.isConfirmed) return;

    try {
      await api.delete("/auth/me", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      quickToast({
        title: "Account deleted",
        icon: "success",
      });
      deleteAccount();
      setTimeout(() => {
        setIsOpen(false);
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error("Failed to delete account", error);
      quickToast({
        title: "Failed to delete account",
        text: error.response?.data?.message || "Failed to delete account.",
        icon: "error",
      });
      setError(error.response?.data?.message || "Failed to delete account.");
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setError(null);
          setSuccess(null);
          setConfirmText("");
        }}
        className={`cursor-pointer rounded-xl flex items-center gap-2 px-4 py-2 text-sm sm:text-base w-full sm:w-auto ${className}`}
      >
        {Icon && <Icon className="w-5 h-5 text-white" />}
        <span className="hidden sm:inline text-white">Delete Account</span>
        <span className="sm:hidden text-white">Delete</span>
      </button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        className="bg-white rounded-2xl max-w-md w-full p-0 max-h-[90vh] flex flex-col"
      >
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Delete Account</h3>
              <p className="text-red-100 text-sm">This action cannot be undone</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-5 flex-1 overflow-y-auto">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-700 font-medium mb-2">
                ⚠️ Warning: This action is irreversible
              </p>
              <p className="text-sm text-gray-700">
                All your account data, reservations, and history will be permanently deleted. To confirm, type <strong className="text-red-600">delete</strong> below.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type "delete" to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type 'delete' to confirm"
                className="input input-bordered w-full bg-white border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-gray-900"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 btn btn-ghost border-2 border-gray-200 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmText.toLowerCase() !== "delete"}
                className="flex-1 btn bg-gradient-to-r from-red-500 to-red-600 text-white border-0 hover:from-red-600 hover:to-red-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default DeleteAccount;
