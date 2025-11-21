import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";
import CartContent from "./CartContent";
import { Shield, UserCog } from "lucide-react";

function AdminNavbar() {
  const { logout } = useLogout();
  const { user } = useAuthContext();

  const handleLogoutButton = () => {
    logout();
  };

  // Get role badge styling
  const getRoleBadge = (role) => {
    const badges = {
      admin: {
        label: "Admin",
        icon: Shield,
        classes: "bg-red-500/10 text-red-500 border-red-500/30",
      },
      cashier: {
        label: "Cashier",
        icon: UserCog,
        classes: "bg-blue-500/10 text-blue-500 border-blue-500/30",
      },
    };
    return badges[role] || null;
  };

  return (
    <nav className="bg-[#222831] px-4 py-2 flex justify-between items-center">
      {/* Logo / Brand */}
      <div className="text-xl font-bold"></div>

      {/* Right-side buttons */}
      <div className="flex items-center space-x-3">
        {/* Role Badge */}
        {user?.roles && user.roles.length > 0 && (
          <div className="flex items-center gap-2">
            {user.roles.map((role) => {
              const badge = getRoleBadge(role);
              if (!badge) return null;
              const Icon = badge.icon;
              return (
                <div
                  key={role}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${badge.classes} font-medium text-xs`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{badge.label}</span>
                </div>
              );
            })}
          </div>
        )}

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
