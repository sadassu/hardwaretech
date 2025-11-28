import React, { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import Modal from "../../components/Modal";
import api from "../../utils/api";
import { LockKeyhole } from "lucide-react";
import TextInput from "../../components/TextInput";
import { useConfirm } from "../../hooks/useConfirm";
import { useQuickToast } from "../../hooks/useQuickToast";

function ChangePassword({ className = "", icon: Icon }) {
  const { user, dispatch } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const quickToast = useQuickToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const confirm = useConfirm();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.password || !formData.confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = await confirm({
      title: "Update password?",
      text: "You will need to use the new password the next time you log in.",
      confirmButtonText: "Yes, change password",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await api.put(
        `/profile/${user.userId}/change-password`,
        {
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      // Update user state with new isVerified status
      if (res.data.isVerified !== undefined) {
        const updatedUser = {
          userId: res.data.userId,
          name: res.data.name,
          email: res.data.email,
          roles: res.data.roles,
          isVerified: res.data.isVerified,
          token: res.data.token || user.token
        };
        
        dispatch({
          type: "UPDATED_USER",
          payload: updatedUser
        });
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      quickToast({
        title:
          res.data.message ||
          "Password updated successfully! Please verify your email.",
        icon: "success",
      });
      setFormData({ password: "", confirmPassword: "" });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update password", error);
      setError(error.response?.data?.message);
    }
  };

  return (
    <>
      <button
            onClick={() => {
              setIsOpen(true);
              setError(null);
            }}
        className={`cursor-pointer rounded-xl flex items-center gap-2 px-4 py-2 text-sm sm:text-base w-full sm:w-auto ${className}`}
      >
        {Icon && <Icon className="w-5 h-5" />}
        <span className="hidden sm:inline">Change Password</span>
        <span className="sm:hidden">Password</span>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold">Change Password</h2>

          <div>
            <label className="block mb-1 text-sm sm:text-base">
              New Password
            </label>
            <TextInput
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm sm:text-base text-gray-900"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm sm:text-base">
              Confirm Password
            </label>
            <TextInput
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm sm:text-base text-gray-900"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="w-4 h-4"
            />
            <label htmlFor="showPassword" className="text-sm sm:text-base">
              Show Password
            </label>
          </div>

          {error && <p className="text-red-400 text-xs sm:text-sm">{error}</p>}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="cursor-pointer w-full sm:w-auto px-4 py-2 border border-gray-500 rounded-md text-sm sm:text-base order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md text-sm sm:text-base order-1 sm:order-2"
            >
              Update
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default ChangePassword;
