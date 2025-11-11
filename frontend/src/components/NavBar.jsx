import { Link } from "react-router";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import CartContent from "./CartContent";
import {
  Home,
  Wrench,
  Calendar,
  User,
  Menu,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

const NavBar = () => {
  const { logout } = useLogout();
  const handleLogoutButton = () => {
    logout();
  };
  const { user } = useAuthContext();

  // helper condition — show "My Reservations" only if not admin/cashier
  const canShowReservations =
    user && !user.roles?.includes("admin") && !user.roles?.includes("cashier");

  return (
    <div className="navbar bg-slate-800 text-white shadow-lg px-4 sticky top-0 z-50 fira-code">
      {/* Logo / Brand */}
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl font-bold text-white">
          <img src="/assets/logo.jpg" alt="logo" className="h-7 w-12" />
          <span className="hidden sm:inline">Hardware Tech</span>
        </Link>

        {/* Mobile Menu Dropdown */}
        <div className="dropdown lg:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost">
            <Menu className="h-5 w-5" />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 text-gray-800 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg border border-base-300"
          >
            <li>
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Home
              </Link>
            </li>
            <li>
              <Link to="/user/product-list" className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Products
              </Link>
            </li>

            {canShowReservations && (
              <>
                <div className="divider my-1"></div>
                <li>
                  <Link
                    to={`/reservations/user/${user.userId}`}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-5 w-5" />
                    My Reservations
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-2">
          <li>
            <Link to="/" className="btn btn-ghost btn-sm tracking-wide">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/user/product-list"
              className="btn btn-ghost btn-sm tracking-wide"
            >
              <Wrench className="h-4 w-4" />
              Products
            </Link>
          </li>
          {canShowReservations && (
            <li>
              <Link
                to={`/reservations/user/${user.userId}`}
                className="btn btn-ghost btn-sm tracking-wide"
              >
                <Calendar className="h-4 w-4" />
                Reservations
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* User Actions */}
      <div className="navbar-end">
        {!user ? (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-primary btn-sm">
              Login
            </Link>
            <Link to="/register" className="btn btn-outline btn-sm">
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="flex gap-3 justify-center items-center">
            <CartContent />
            <div className="dropdown dropdown-end text-black">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar placeholder"
              >
                <div className="bg-primary text-neutral-content rounded-full w-10 h-10 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg border border-base-300"
              >
                <li className="menu-title">
                  <span className="text-xs">{user.email}</span>
                </li>
                <div className="divider my-1"></div>

                {/* Admin Dashboard */}
                {user.roles?.some((role) =>
                  ["admin", "staff"].includes(role)
                ) && (
                  <li>
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Go to Admin Dashboard
                    </Link>
                  </li>
                )}

                {user.roles?.includes("cashier") && (
                  <li>
                    <Link to="/pos" className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Go to Point of Sale
                    </Link>
                  </li>
                )}

                <li>
                  <Link
                    to={`/profile/${user.userId}`}
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </li>

                {canShowReservations && (
                  <li>
                    <Link
                      to={`/reservations/user/${user.userId}`}
                      className="flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      My Reservations
                    </Link>
                  </li>
                )}

                <div className="divider my-1"></div>
                <li>
                  <button
                    onClick={handleLogoutButton}
                    className="flex items-center gap-2 text-error hover:bg-error/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;
