import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

function LoginSuccess() {
  const navigate = useNavigate();
  const { dispatch } = useAuthContext();
  const [email, setEmail] = useState("");

  useEffect(() => {
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
        roles = JSON.parse(rolesParam);
      } catch {
        roles = rolesParam ? [rolesParam] : ["user"]; // fallback
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

      // ✅ Redirect based on role
      if (roles.includes("admin")) {
        navigate("/dashboard");
      } else if (roles.includes("cashier")) {
        navigate("/pos");
      } else {
        navigate("/");
      }
    } else {
      navigate("/login");
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
