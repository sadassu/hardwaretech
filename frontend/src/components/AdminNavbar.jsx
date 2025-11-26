import { useState, useEffect } from "react";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";
import CartContent from "./CartContent";
import { Clock } from "lucide-react";
import { getRoleGreeting, getCurrentTimePHT } from "../utils/getGreeting";

function AdminNavbar() {
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const [currentTime, setCurrentTime] = useState(getCurrentTimePHT());

  const handleLogoutButton = () => {
    logout();
  };

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTimePHT());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const greeting = user?.roles ? getRoleGreeting(user.roles) : "Welcome";

  return (
    <nav className="sticky top-0 z-40 bg-[#222831] px-4 py-2 flex justify-between items-center shadow-lg w-full">
      {/* Logo / Brand */}
      <div className="text-xl font-bold"></div>

      {/* Right-side buttons */}
      <div className="flex items-center space-x-3">
        {/* Greeting and Time Display */}
        {user?.roles && user.roles.length > 0 && (
          <div className="hidden sm:flex items-center gap-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-800/90 via-gray-800/80 to-gray-800/90 border border-gray-700/50 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:border-gray-600/60 group">
            {/* Greeting */}
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm leading-tight whitespace-nowrap">
                {greeting}
              </span>
            </div>
            
            {/* Divider */}
            <div className="h-6 w-px bg-gray-600/50"></div>
            
            {/* Time Display */}
          <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
              <span className="text-gray-200 font-mono font-semibold text-sm tracking-wider">
                {currentTime}
              </span>
                </div>
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
