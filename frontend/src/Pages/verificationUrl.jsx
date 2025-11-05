import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import api from "../utils/api";

export default function VerificationUrl() {
  const [status, setStatus] = useState("verifying");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verificationToken = searchParams.get("verificationToken");
    const email = searchParams.get("email");

    if (!verificationToken || !email) {
      setStatus("error");
      return;
    }

    api
      .get("/auth/confirm-verification-url", {
        params: { verificationToken, email },
        withCredentials: true,
      })
      .then(() => {
        setStatus("success");
        setTimeout(() => navigate("/login"), 2000);
      })
      .catch(() => setStatus("error"));
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div className="relative">
            {status === "verifying" && (
              <div className="bg-blue-100 rounded-full p-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="bg-green-100 rounded-full p-4 animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            )}
            {status === "error" && (
              <div className="bg-red-100 rounded-full p-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800">
            {status === "verifying" && "Verifying Your Account"}
            {status === "success" && "Account Verified!"}
            {status === "error" && "Verification Failed"}
          </h1>

          {/* Message */}
          <p className="text-gray-600">
            {status === "verifying" &&
              "Please wait while we verify your email address..."}
            {status === "success" &&
              "Your account has been successfully verified. Redirecting to login..."}
            {status === "error" &&
              "The verification link is invalid or has expired. Please request a new verification email."}
          </p>

          {/* Mail icon decoration */}
          {status === "verifying" && (
            <div className="pt-4">
              <Mail className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          )}

          {/* Error action button */}
          {status === "error" && (
            <button
              onClick={() => navigate("/login")}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
