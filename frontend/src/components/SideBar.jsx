import { Link } from "react-router";
import { useAuthContext } from "../hooks/useAuthContext";

const SideBar = () => {
  const { user } = useAuthContext();

  return (
    <div className="h-screen w-64 bg-slate-800 text-slate-100 shadow-xl fixed">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-slate-50">Hardware Tech</h1>
      </div>

      {/* Menu */}
      <ul className="menu p-4 space-y-1 w-full">
        <li>
          <a className="text-slate-200 hover:bg-slate-700 hover:text-slate-50 rounded-lg transition-colors duration-200 active:bg-slate-600">
            Dashboard
          </a>
        </li>
        <li>
          <Link
            to="/reservations"
            className="text-slate-200 hover:bg-slate-700 hover:text-slate-50 rounded-lg transition-colors duration-200 active:bg-slate-600"
          >
            Reservations
          </Link>
        </li>
        <li>
          <Link
            to="/products"
            className="text-slate-200 hover:bg-slate-700 hover:text-slate-50 rounded-lg transition-colors duration-200 active:bg-slate-600"
          >
            Products
          </Link>
        </li>
        <li>
          <Link
            to="/pos"
            className="text-slate-200 hover:bg-slate-700 hover:text-slate-50 rounded-lg transition-colors duration-200 active:bg-slate-600"
          >
            Pos
          </Link>
        </li>
        <li>
          <a className="text-slate-200 hover:bg-slate-700 hover:text-slate-50 rounded-lg transition-colors duration-200 active:bg-slate-600">
            Settings
          </a>
        </li>
      </ul>

      {/* Optional: User section at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
              <span className="text-sm font-medium text-slate-200">U</span>
            </div>
          </div>
          <span className="text-sm text-slate-300 truncate">
            {user ? user.name : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
