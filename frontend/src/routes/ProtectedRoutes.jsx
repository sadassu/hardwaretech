import { Navigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

export default function ProtectedRoute({
  children,
  requireVerification = false,
}) {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not verified → only block if route requires it
  if (requireVerification && !user.isVerified) {
    return <Navigate to="/verification" replace />;
  }

  return children;
}
