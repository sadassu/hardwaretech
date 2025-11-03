import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
    <div className="flex flex-col items-center justify-center h-screen">
      {status === "verifying" && <p>Verifying your account...</p>}
      {status === "success" && <p>✅ Account verified! Redirecting...</p>}
      {status === "error" && (
        <p>❌ Verification failed or link expired. Please request a new one.</p>
      )}
    </div>
  );
}
