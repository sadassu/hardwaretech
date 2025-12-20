import React, { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import api from "../utils/api";

function Verification() {
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const [fromChangePassword, setFromChangePassword] = useState(false);

  useEffect(() => {
    if (user && user.email) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    // If we came from change-password flow, a code was already sent by backend.
    // Skip the \"Send Verification Code\" step and show the code input directly.
    const flag = localStorage.getItem("verificationCodeAlreadySent");
    if (flag === "true") {
      setCodeSent(true);
      setMessage("A verification code has already been sent to your email. Please enter it below.");
      setFromChangePassword(true);
      // Clear the flag so future visits behave normally
      localStorage.removeItem("verificationCodeAlreadySent");
    }
  }, []);

  useEffect(() => {
    const storedTimestamp = localStorage.getItem("verificationCooldown");
    if (storedTimestamp) {
      const remaining = Math.max(
        0,
        Math.floor((parseInt(storedTimestamp) - Date.now()) / 1000)
      );
      if (remaining > 0) {
        setLoading(true);
        setTimeLeft(remaining);
        setCodeSent(true);
      } else {
        localStorage.removeItem("verificationCooldown");
      }
    }
  }, []);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      const storedTimestamp = localStorage.getItem("verificationCooldown");
      if (!storedTimestamp) {
        clearInterval(interval);
        setLoading(false);
        return;
      }

      const remaining = Math.max(
        0,
        Math.floor((parseInt(storedTimestamp) - Date.now()) / 1000)
      );

      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        setLoading(false);
        localStorage.removeItem("verificationCooldown");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [loading]);

  const handleSendCode = async () => {
    if (!email) {
      setError("Email not found. Please log in again.");
      return;
    }

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/send-verification-code", {
        email,
      });
      setMessage(data.message);
      setCodeSent(true);
      const cooldownUntil = Date.now() + 2 * 60 * 1000;
      localStorage.setItem("verificationCooldown", cooldownUntil.toString());
      setTimeLeft(120);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to send verification code."
      );
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code || code.length < 4) {
      setError("Please enter a valid verification code.");
      return;
    }

    setMessage("");
    setError("");
    setVerifying(true);

    try {
      const { data } = await api.post("/auth/confirm-verification-code", {
        email,
        code,
      });
      setMessage(data.message);
      setCode("");
      localStorage.removeItem("verificationCooldown");
      localStorage.removeItem("user");
      setTimeout(() => logout(), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to verify code.");
    } finally {
      setVerifying(false);
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
        <div className="flex flex-col items-center mb-6">
          <img src="assets/logo.jpg" alt="Logo" className="w-32 mb-2 bg-white p-3 shadow-lg rounded-lg" />
          <h2 className="text-white text-2xl font-bold text-center">
            Email Verification
          </h2>
        </div>

        {error && (
          <div className="bg-red-600/90 text-white text-sm px-4 py-2 rounded mb-4 text-center animate-pulse">
            {error}
          </div>
        )}

        <p className="text-white text-sm mb-2 text-center">
          {codeSent
            ? "Enter the verification code sent to:"
            : "We'll send a verification code to:"}
        </p>
        <div className="text-center font-semibold text-yellow-400 mb-4 break-words">
          {email || "No email found"}
        </div>

        {!codeSent && (
          <button
            onClick={handleSendCode}
            disabled={loading || !email}
            className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-sm mb-4 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? `Please wait ${timeLeft}s` : "Send Verification Code"}
          </button>
        )}

        {codeSent && (
          <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              className="w-full px-4 py-2 rounded bg-white placeholder-gray-700 focus:outline-none"
              disabled={verifying}
            />
            <button
              type="submit"
              disabled={verifying || !code}
              className={`w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition text-sm ${
                verifying || !code ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {verifying ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        )}

        {message && (
          <p className="mt-4 text-green-400 text-center font-medium text-sm">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Verification;
