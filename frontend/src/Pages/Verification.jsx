import React, { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import api from "../utils/api";

function Verification() {
  const { user } = useAuthContext();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
    }
  }, [user]);

  // ✅ Check cooldown on page load
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

  // ✅ Countdown interval
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

  // ✅ Send verification request
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

      // Set 2-minute cooldown
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

  // ✅ Verify the code
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

      // Optionally redirect or update user context here
      // Example: window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.error || "Failed to verify code.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Email Verification
        </h2>

        <p className="text-gray-700 text-center mb-4">
          We'll send a verification code to:
        </p>

        <div className="text-center font-semibold text-blue-700 mb-4">
          {email || "No email found"}
        </div>

        <button
          onClick={handleSendCode}
          disabled={loading || !email}
          className={`w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? `Please wait ${timeLeft}s` : "Send Verification Code"}
        </button>

        {codeSent && (
          <form onSubmit={handleVerifyCode} className="mt-6">
            <label className="block text-gray-700 font-medium mb-2">
              Enter Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              disabled={verifying}
            />
            <button
              type="submit"
              disabled={verifying || !code}
              className={`w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition ${
                verifying || !code ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {verifying ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        )}

        {message && (
          <p className="mt-4 text-green-600 text-center font-medium">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 text-red-600 text-center font-medium">{error}</p>
        )}
      </div>
    </div>
  );
}

export default Verification;
