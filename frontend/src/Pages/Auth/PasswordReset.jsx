// src/pages/auth/ResetPassword.jsx
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../utils/api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post(`/auth/reset-password/${token}`, {
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setMessage(res.data.message);

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: "url('assets/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="backdrop-blur-md bg-zinc-800/90 rounded-xl p-8 w-full max-w-sm"
        style={{ boxShadow: "0 10px 15px -3px rgba(255, 255, 255, 0.4)" }}
      >
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-6">
          <img src="assets/logo.jpg" alt="Logo" className="w-32 mb-2" />
          <h2 className="text-white text-2xl font-bold">Reset Password</h2>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-600/90 text-white text-sm px-4 py-2 rounded mb-4 text-center animate-pulse">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-600/90 text-white text-sm px-4 py-2 rounded mb-4 text-center animate-pulse">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative">
          {/* New Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full px-4 py-2 rounded bg-white placeholder-gray-700 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-black transition"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
              <span className="absolute bottom-9 left-2 bg-black text-white text-sm px-2 py-0.5 font-bold">
                New Password
              </span>
            </div>
            <p className="text-sm text-white mx-2">
              Must be at least 8 characters with uppercase, lowercase, number,
              and special characters
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="w-full px-4 py-2 rounded bg-white placeholder-gray-700 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-black transition"
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
              <span className="absolute bottom-9 left-2 bg-black text-white text-sm px-2 py-0.5 font-bold">
                Confirm Password
              </span>
            </div>
            {formData.confirmPassword &&
              formData.confirmPassword !== formData.newPassword && (
                <p className="text-red-400 text-xs -mt-4">
                  Passwords do not match
                </p>
              )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 rounded transition-transform duration-200 hover:scale-[1.02]"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-500"></div>
          <span className="mx-3 text-gray-300 text-sm">or login</span>
          <div className="flex-grow border-t border-gray-500"></div>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-300 text-sm">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="text-yellow-400 hover:text-yellow-500 font-semibold transition"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
