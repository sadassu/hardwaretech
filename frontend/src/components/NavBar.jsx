import { Link } from "react-router";
import { useAuthContext } from "../hooks/useAuthContext";
import Login from "../Pages/Auth/Login";
import { useLogout } from "../hooks/useLogout";

const NavBar = () => {
  const { logout } = useLogout();
  const handleLogoutButton = () => {
    logout();
  };
  const { user } = useAuthContext();
  return (
    <div className="navbar bg-base-100 shadow-md px-4">
      {/* Logo / Brand */}
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">Hardware Tech</a>
      </div>
      {/* Desktop Menu */}
      <div className="hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <a>Home</a>
          </li>
          <li>
            <a>About</a>
          </li>
          <li>
            <a>Services</a>
          </li>
          <li>{user ? user.email : <Link to="/login">Login</Link>}</li>
          <li>
            {user ? (
              <button
                className="btn btn-error btn-sm"
                onClick={handleLogoutButton}
              >
                Logout
              </button>
            ) : (
              ""
            )}
          </li>
        </ul>
      </div>
      {/* Mobile Menu */}
      <div className="dropdown dropdown-end lg:hidden">
        <label tabIndex={0} className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </label>
        <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <a>Home</a>
          </li>
          <li>
            <a>About</a>
          </li>
          <li>
            <a>Services</a>
          </li>
          {!user ? <Link to="/login">Login</Link> : user.email}
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
