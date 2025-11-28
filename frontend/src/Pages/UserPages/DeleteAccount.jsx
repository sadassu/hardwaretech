import React, { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import Modal from "../../components/Modal";
import api from "../../utils/api";
import { Trash } from "lucide-react";
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
      }, 1500);
    } catch (error) {
      console.error("Failed to delete account", error);
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="space-y-4 text-white">
          <h2 className="text-lg sm:text-xl font-bold text-red-500">
            Delete Account
          </h2>
          <p className="text-sm sm:text-base">
            This action is irreversible. To confirm, type{" "}
            <strong>delete</strong> below.
          </p>

          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type 'delete' to confirm"
            className="w-full border border-gray-600 rounded px-3 py-2 text-sm sm:text-base bg-gray-800 text-white placeholder-gray-400"
          />

          {error && <p className="text-red-400 text-xs sm:text-sm">{error}</p>}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="cursor-pointer w-full sm:w-auto px-4 py-2 border border-gray-500 rounded-md text-sm sm:text-base text-white order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="cursor-pointer w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md text-sm sm:text-base order-1 sm:order-2"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default DeleteAccount;
