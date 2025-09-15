import { Navigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

export default function RoleRoute({ children, allowedRoles }) {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasRole = user.roles?.some((roles) => allowedRoles.includes(roles));
  if (!hasRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
