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
    const roles = params.get("roles");
    const name = params.get("name");
    const emailParam = params.get("email");

    if (token) {
      const user = { userId, token, roles, name, email: emailParam };

      // Save full user object
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({ type: "LOGIN", payload: user });

      setEmail(emailParam);

      navigate("/");
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
