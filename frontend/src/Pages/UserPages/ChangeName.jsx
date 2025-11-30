import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import Modal from "../../components/Modal";
import api from "../../utils/api";
import { SquarePen, User } from "lucide-react";
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
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        className="bg-white rounded-2xl max-w-md w-full p-0 max-h-[90vh] flex flex-col"
      >
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Change Name</h3>
              <p className="text-blue-100 text-sm">Update your display name</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-5 flex-1 overflow-y-auto">
            <div>
              <label htmlFor="name-input" className="block text-sm font-semibold text-gray-700 mb-2">
                Name
              </label>
              <input
                id="name-input"
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900"
                required
                placeholder="Enter your name"
              />
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 btn btn-ghost border-2 border-gray-200 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700 shadow-lg"
              >
                Update Name
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default ChangeName;
