import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

function LoginSuccess() {
  const navigate = useNavigate();
  const { dispatch } = useAuthContext();
  const [email, setEmail] = useState("");
  const hasProcessed = useRef(false); // Prevent double processing

  useEffect(() => {
    // Prevent running this effect multiple times
    if (hasProcessed.current) {
      console.log("Already processed, skipping...");
      return;
    }

    const params = new URLSearchParams(window.location.search);

    const userId = params.get("userId");
    const token = params.get("token");
    const rolesParam = params.get("roles");
    const name = params.get("name");
    const emailParam = params.get("email");
    const avatar = params.get("avatar");
    const isVerified = params.get("isVerified");
    const googleLoggedIn = params.get("googleLoggedIn");

    if (token) {
      let roles = [];
      try {
        // Try to parse as JSON first (backend now sends it as JSON string)
        const parsed = JSON.parse(rolesParam);
        roles = Array.isArray(parsed) ? parsed : [parsed];
      } catch (error) {
        // Fallback: if not JSON, treat as string and wrap in array
        roles = rolesParam ? [rolesParam.trim()] : ["user"];
      }

      // Ensure roles is always an array
      if (!Array.isArray(roles) || roles.length === 0) {
        roles = ["user"];
      }

      const user = {
        userId,
        token,
        roles,
        name,
        email: emailParam,
        avatar,
        isVerified,
        googleLoggedIn,
      };

      // Save full user object
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({ type: "LOGIN", payload: user });

      setEmail(emailParam);

      // Mark as processed BEFORE any navigation
      hasProcessed.current = true;

      // ✅ Redirect based on role - check if roles array includes the role
      const userRoles = Array.isArray(roles) ? roles : [roles];
      
      // Use setTimeout to ensure context is updated before navigation
      setTimeout(() => {
        if (userRoles.includes("admin")) {
          navigate("/dashboard", { replace: true });
        } else if (userRoles.includes("cashier")) {
          navigate("/pos", { replace: true });
      } else {
          navigate("/", { replace: true });
      }
      }, 0);
    } else {
      hasProcessed.current = true;
      navigate("/login", { replace: true });
    }
  }, [navigate, dispatch]);

  return (
    <div className="bg-[url(/assets/background-shadow.webp)] min-h-screen flex justify-center items-center">
      <div className="card w-96 bg-base-100 shadow-sm p-4">
        {email ? `Signing ${email} in with Google...` : "Signing in..."}
      </div>
    </div>
  );
}

export default LoginSuccess;
