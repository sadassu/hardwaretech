import { useLogout } from "../hooks/useLogout";
import CartContent from "./CartContent";

function AdminNavbar() {
  const { logout } = useLogout();

  const handleLogoutButton = () => {
    logout();
  };

  return (
    <nav className="bg-[#222831] px-4 py-2 flex justify-between items-center">
      {/* Logo / Brand */}
      <div className="text-xl font-bold"></div>

      {/* Right-side buttons */}
      <div className="flex items-center space-x-3">
        <CartContent />

        {/* Logout button */}
        <button className="btn btn-error btn-sm" onClick={handleLogoutButton}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default AdminNavbar;
