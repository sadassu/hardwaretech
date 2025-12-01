import React, { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import Modal from "../../components/Modal";
import api from "../../utils/api";
import { LockKeyhole, Eye, EyeOff } from "lucide-react";
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

      // Mark that a verification code was already sent by the backend
      // so the verification page can go directly to the \"Enter code\" step
      localStorage.setItem("verificationCodeAlreadySent", "true");

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

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        className="bg-white rounded-2xl max-w-md w-full p-0 max-h-[90vh] flex flex-col"
      >
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <LockKeyhole className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Change Password</h3>
              <p className="text-blue-100 text-sm">Update your account password</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-5 flex-1 overflow-y-auto">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 pr-10"
                  required
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters with uppercase, lowercase, number,
                and special characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 pr-10"
                  required
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
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
                Update Password
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default ChangePassword;
