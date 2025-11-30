import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLogin } from "../../hooks/useLogin";
import { useAuthContext } from "../../hooks/useAuthContext";
import ReCAPTCHA from "react-google-recaptcha";
import api from "../../utils/api";

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useAuthContext();
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ""
  );

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, isLoading } = useLogin();
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState(false);
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only require reCAPTCHA if it's configured and hasn't errored
    if (recaptchaSiteKey && !captchaError && !captchaToken) {
      alert("Please complete the reCAPTCHA.");
      return;
    }

    try {
      const result = await login(formData.email, formData.password, captchaToken || "");
      // If login returns requiresVerification, show verification input
      if (result && result.requiresVerification) {
        setVerificationEmail(result.email || formData.email);
        setShowVerification(true);
      }
    } catch (err) {
      // Error is already handled by useLogin hook
      // Check if it's a verification error
      if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
        setVerificationEmail(err.response?.data?.email || formData.email);
        setShowVerification(true);
      }
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationError("Please enter a valid 6-digit code.");
      return;
    }

    setVerificationError("");
    setVerifying(true);

    try {
      const response = await api.post("/auth/confirm-verification-code", {
        email: verificationEmail,
        code: verificationCode,
      });

      const { token, userId, roles, name, email, avatar, isVerified } = response.data;

      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify({
        userId,
        roles,
        name,
        email,
        avatar,
        isVerified,
        token,
      }));

      // Update auth context
      dispatch({ type: "LOGIN", payload: {
        userId,
        roles,
        name,
        email,
        avatar,
        isVerified,
        token,
      }});

      setVerificationMessage("Email verified successfully! Redirecting...");
      
      // Navigate based on role
      setTimeout(() => {
        if (roles.includes("admin")) {
          navigate("/dashboard", { replace: true });
        } else if (roles.includes("cashier")) {
          navigate("/pos", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }, 1500);
    } catch (err) {
      setVerificationError(
        err.response?.data?.error || "Failed to verify code. Please try again."
      );
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
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-6">
          <img src="assets/logo.jpg" alt="Logo" className="w-32 mb-2" />
          <h2 className="text-white text-2xl font-bold">Log In</h2>
        </div>

        {successMessage && (
          <div className="bg-green-600/90 text-white text-sm px-4 py-2 rounded mb-4 text-center animate-fade-in">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && !showVerification && (
          <div className="bg-red-600/90 text-white text-sm px-4 py-2 rounded mb-4 text-center animate-pulse">
            {error}
          </div>
        )}

        {/* Verification Code Input */}
        {showVerification && (
          <div className="mb-4">
            <p className="text-white text-sm mb-2 text-center">
              Please verify your email. A code has been sent to:
            </p>
            <div className="text-center font-semibold text-yellow-400 mb-4 break-words">
              {verificationEmail}
            </div>

            {verificationMessage && (
              <div className="bg-green-600/90 text-white text-sm px-4 py-2 rounded mb-4 text-center">
                {verificationMessage}
              </div>
            )}

            {verificationError && (
              <div className="bg-red-600/90 text-white text-sm px-4 py-2 rounded mb-4 text-center animate-pulse">
                {verificationError}
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setVerificationCode(value);
                    }}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-2 rounded bg-white placeholder-gray-700 focus:outline-none text-center text-2xl tracking-widest"
                    maxLength={6}
                    disabled={verifying}
                    required
                  />
                  <span className="absolute bottom-9 left-2 bg-black text-white text-sm px-2 py-0.5 font-bold">
                    Verification Code
                  </span>
                </div>
                <p className="text-sm text-white mx-2 mt-2">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <button
                type="submit"
                disabled={verifying || verificationCode.length !== 6}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition-transform duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? "Verifying..." : "Verify Email"}
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="text-gray-300 text-sm">
                Didn't receive the code?{" "}
                <button
                  onClick={async () => {
                    try {
                      await api.post("/auth/send-verification-code", {
                        email: verificationEmail,
                      });
                      setVerificationMessage("Verification code resent to your email.");
                      setVerificationError("");
                    } catch (err) {
                      setVerificationError(
                        err.response?.data?.error || "Failed to resend code."
                      );
                    }
                  }}
                  className="text-yellow-400 hover:text-yellow-500 font-semibold transition"
                >
                  Resend Code
                </button>
              </p>
              <button
                onClick={() => {
                  setShowVerification(false);
                  setVerificationCode("");
                  setVerificationError("");
                  setVerificationMessage("");
                }}
                className="text-gray-300 text-sm mt-2 hover:text-white transition"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {!showVerification && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative">
          {/* Email */}
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded bg-white placeholder-gray-700 focus:outline-none"
              required
            />
            <span className="absolute bottom-9 left-2 bg-black text-white text-sm px-2 py-0.5 font-bold">
              Email
            </span>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
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
              Password
            </span>
          </div>

          {/* ✅ reCAPTCHA - Only render if site key is configured */}
          {recaptchaSiteKey && !captchaError && (
            <ReCAPTCHA
              sitekey={recaptchaSiteKey}
              onChange={(token) => {
                setCaptchaToken(token);
                setCaptchaError(false);
              }}
              onError={() => {
                // Silently handle reCAPTCHA errors - they're expected if key is invalid/not configured
                setCaptchaError(true);
                setCaptchaToken(""); // Clear token since reCAPTCHA failed
              }}
              onExpired={() => {
                setCaptchaToken("");
              }}
            />
          )}
          {captchaError && recaptchaSiteKey && (
            <div className="bg-yellow-600/90 text-white text-xs px-4 py-2 rounded text-center">
              reCAPTCHA is unavailable. You can still proceed with login.
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 rounded transition-transform duration-200 hover:scale-[1.02]"
          >
            {isLoading ? "Signing In..." : "Log in"}
          </button>
        </form>
        )}

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-500"></div>
          <span className="mx-3 text-gray-300 text-sm">or continue with</span>
          <div className="flex-grow border-t border-gray-500"></div>
        </div>

        {/* Google OAuth */}
        <a
          href={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/auth/google`}
          className="w-full bg-white text-gray-800 font-semibold py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-200 transition"
        >
          {/* Google SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </a>

        {/* Register */}
        <div className="text-center mt-6">
          <p className="text-gray-300 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-yellow-400 hover:text-yellow-500 font-semibold transition"
            >
              Create one now
            </Link>
          </p>
          <p className="text-gray-300 text-sm">
            Forgot password?
            <Link
              to="/forgot-password"
              className="text-yellow-400 hover:text-yellow-500 font-semibold transition"
            >
              Reset Password
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
