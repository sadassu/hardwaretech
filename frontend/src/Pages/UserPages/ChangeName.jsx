import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import Modal from "../../components/Modal";
import api from "../../utils/api";
import { SquarePen } from "lucide-react";
import TextInput from "../../components/TextInput.jsx";
import { useConfirm } from "../../hooks/useConfirm";
import { useQuickToast } from "../../hooks/useQuickToast";

function ChangeName({ onUpdateSuccess, className = "", icon: Icon }) {
  const { user, dispatch } = useAuthContext();
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const quickToast = useQuickToast();
  const confirm = useConfirm();

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name);
    }
  }, [isOpen, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const result = await confirm({
      title: "Update profile name?",
      text: "Your display name will be updated immediately.",
      confirmButtonText: "Yes, update name",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await api.put(
        `/profile/${user.userId}/change-name`,
        { name },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      // Merge with existing user data to preserve all fields (token, roles, etc.)
      const updatedUser = {
        ...user,
        ...res.data.user,
        // Ensure token is preserved
        token: res.data.user.token || user.token,
        // Ensure roles are preserved
        roles: res.data.user.roles || user.roles || [],
      };
      
      dispatch({ type: "UPDATED_USER", payload: updatedUser });
      localStorage.setItem("user", JSON.stringify(updatedUser));

      quickToast({
        title: "Name updated!",
        icon: "success",
      });
      setIsOpen(false);
      if (onUpdateSuccess) onUpdateSuccess(res.data.user);
    } catch (error) {
      console.error("Failed to update name:", error);
    }
  };

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`cursor-pointer rounded-xl flex items-center gap-2 px-4 py-2 text-sm sm:text-base w-full sm:w-auto ${className}`}
      >
        {Icon && <Icon className="w-5 h-5" />}
        Change Name
      </button>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-4 sm:p-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 w-11/12 sm:w-96 mx-auto"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-center">
              Change Name
            </h2>

            <TextInput
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full"
            />

            <button
              type="submit"
              className="btn btn-primary w-full text-sm sm:text-base py-2 sm:py-3"
            >
              Update
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
}

export default ChangeName;
