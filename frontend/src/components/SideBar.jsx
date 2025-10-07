import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  Package,
  ShoppingCart,
  TrendingUp,
  Settings,
  X,
  Menu,
  FileBox,
} from "lucide-react";

const SideBar = () => {
  const { user } = useAuthContext();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      isLink: true,
    },
    {
      name: "Reservations",
      path: "/reservations",
      icon: Calendar,
      isLink: true,
    },
    {
      name: "Products",
      path: "/products",
      icon: Package,
      isLink: true,
    },
    {
      name: "POS",
      path: "/pos",
      icon: ShoppingCart,
      isLink: true,
    },
    {
      name: "Sales",
      path: "/sales",
      icon: TrendingUp,
      isLink: true,
    },
    {
      name: "Supply History",
      path: "/supply-histories",
      icon: FileBox,
      isLink: true,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
      isLink: true,
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-49 p-2 bg-slate-800 text-white rounded-lg shadow-lg hover:bg-slate-700 transition-colors"
        aria-label="Toggle mobile menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-gray-600/50 bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-screen bg-[#222831] text-slate-100 shadow-xl z-50
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-16" : "w-64"}
          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-slate-50 truncate">
              Hardware Tech
            </h1>
          )}

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-700 transition-colors ml-auto"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              const baseClasses = `
                flex items-center w-full p-3 rounded-lg transition-all duration-200
                text-left hover:bg-red-500 hover:text-slate-50 active:bg-slate-600
                ${
                  active
                    ? "bg-red-500 text-red-50 shadow-md border-l-4 border-blue-400"
                    : "text-slate-200"
                }
                ${isCollapsed ? "justify-center" : "justify-start"}
              `;

              return (
                <li key={item.name}>
                  {item.isLink ? (
                    <Link to={item.path} className={baseClasses}>
                      <Icon size={20} className="flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="ml-3 font-medium">{item.name}</span>
                      )}
                      {isCollapsed && (
                        <div className="absolute left-16 ml-2 px-2 py-1 bg-slate-900 text-slate-100 text-sm rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  ) : (
                    <button className={`${baseClasses} group relative`}>
                      <Icon size={20} className="flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="ml-3 font-medium">{item.name}</span>
                      )}
                      {isCollapsed && (
                        <div className="absolute left-16 ml-2 px-2 py-1 bg-slate-900 text-slate-100 text-sm rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
                          {item.name}
                        </div>
                      )}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section at bottom */}
        <div className="p-4 border-t border-slate-700">
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "space-x-3"
            }`}
          >
            <div className="avatar">
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-slate-200">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            </div>
            {!isCollapsed && (
              <span className="text-sm text-slate-300 truncate">
                {user?.name || "Guest User"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content Spacer for Desktop */}
      <div
        className={`hidden md:block transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      />
    </>
  );
};

export default SideBar;
