import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

function LoginSuccess() {
  const navigate = useNavigate();
  const { dispatch } = useAuthContext();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const roles = params.get("roles");
    const name = params.get("name");
    const email = params.get("email");

    if (token) {
      const user = { token, roles, name, email };

      // Save full user object
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({ type: "LOGIN", payload: user });

      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [navigate, dispatch]);

  return <div>Signing you in with Google...</div>;
}

export default LoginSuccess;
