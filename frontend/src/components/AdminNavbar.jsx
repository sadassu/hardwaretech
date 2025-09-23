import { useLogout } from "../hooks/useLogout";
import CartContent from "./CartContent";

function AdminNavbar() {
  const { logout } = useLogout();

  const handleLogoutButton = () => {
    logout();
  };

  return (
    <nav className="bg-base-100 px-4 py-2 flex justify-between items-center">
      {/* Logo / Brand */}
      <div className="text-xl font-bold"></div>

      {/* Right-side buttons */}
      <div className="flex items-center space-x-3">
        <CartContent />
        {/* Notification button */}
        <button className="btn btn-ghost btn-circle">
          <div className="indicator">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="badge badge-xs badge-primary indicator-item"></span>
          </div>
        </button>

        {/* Logout button */}
        <button className="btn btn-error btn-sm" onClick={handleLogoutButton}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default AdminNavbar;
