import React, { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import Modal from "../../components/Modal";
import api from "../../utils/api";
import { LockKeyhole } from "lucide-react";

function ChangePassword() {
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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

    try {
      await api.put(
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

      setSuccess("Password updated successfully!");
      setFormData({ password: "", confirmPassword: "" });
      setTimeout(() => setIsOpen(false), 1500);
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
          setSuccess(null);
        }}
        className="btn bg-red-500 text-white rounded-xl"
      >
        <LockKeyhole />
        Change Password
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-1/4">
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <h2 className="text-lg font-bold">Change Password</h2>

          <div>
            <label className="block mb-1">New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPassword">Show Password</label>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
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
