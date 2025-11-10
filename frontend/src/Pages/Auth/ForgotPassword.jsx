// src/pages/auth/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    setIsLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", {
        email,
      });

      setMessage(res.data.message);
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
          <h2 className="text-white text-2xl font-bold">Forgot Password</h2>
        </div>

        {/* Success/Error Messages */}
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
          {/* Email */}
          <div>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded bg-white placeholder-gray-700 focus:outline-none"
                required
              />
              <span className="absolute bottom-9 left-2 bg-black text-white text-sm px-2 py-0.5 font-bold">
                Email
              </span>
            </div>
            <p className="text-sm text-white mx-2">
              Enter the email associated with your account
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 rounded transition-transform duration-200 hover:scale-[1.02]"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;
