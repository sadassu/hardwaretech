import { useState, useEffect, useRef } from "react";
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
  User,
} from "lucide-react";
import ChangePassword from "../Pages/UserPages/ChangePassword";
import ChangeName from "../Pages/UserPages/ChangeName";
import api from "../utils/api";
import { useLiveResourceRefresh } from "../hooks/useLiveResourceRefresh";
import Avatar from "./Avatar";
import { useReservationStore } from "../store/reservationStore";

const SideBar = () => {
  const { user } = useAuthContext();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [pendingReservations, setPendingReservations] = useState(0);
  const userMenuRef = useRef(null);
  const reservationsLiveKey = useLiveResourceRefresh(["reservations"]);
  const { statusCounts } = useReservationStore();

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsCollapsed(true); // auto-collapse on md
      } else if (window.innerWidth >= 1024) {
        setIsCollapsed(false); // expand on large screens
      } else {
        setIsCollapsed(false); // mobile mode handled separately
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const canSeeReservationBadge = user?.roles?.some((role) =>
    ["admin", "staff", "cashier"].includes(role)
  );

  useEffect(() => {
    let isMounted = true;

    const fetchPendingReservations = async () => {
      if (!canSeeReservationBadge) return;
      try {
        const res = await api.get("/dashboard/reservations/pending-count");
        if (isMounted) {
          setPendingReservations(res.data?.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch pending reservations:", error.message);
      }
    };

    if (canSeeReservationBadge) {
      fetchPendingReservations();
    }

    return () => {
      isMounted = false;
    };
  }, [canSeeReservationBadge, reservationsLiveKey]);

  // Keep sidebar badge in sync with reservation store status counts
  // so that when an admin/cashier updates reservation statuses,
  // the pending count reflects the latest value without needing
  // a separate dashboard API call.
  useEffect(() => {
    if (!canSeeReservationBadge) return;
    if (
      statusCounts &&
      typeof statusCounts.pending === "number" &&
      !Number.isNaN(statusCounts.pending)
    ) {
      setPendingReservations(statusCounts.pending);
    }
  }, [canSeeReservationBadge, statusCounts?.pending]);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      isLink: true,
      roles: ["admin", "staff"],
    },
    {
      name: "Reservations",
      path: "/reservations",
      icon: Calendar,
      isLink: true,
      roles: ["admin", "staff", "cashier"],
    },
    {
      name: "Inventory",
      path: "/products",
      icon: Package,
      isLink: true,
      roles: ["admin", "staff"],
    },
    {
      name: "POS",
      path: "/pos",
      icon: ShoppingCart,
      isLink: true,
      roles: ["admin", "cashier"],
    },
    {
      name: "Sales",
      path: "/sales",
      icon: TrendingUp,
      isLink: true,
      roles: ["admin", "staff", "cashier"],
    },
    {
      name: "Supply History",
      path: "/supply-histories",
      icon: FileBox,
      isLink: true,
      roles: ["admin", "staff"],
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
      isLink: true,
      roles: ["admin"],
    },
  ];

  // Filter menu items based on user roles
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.some((role) => user?.roles?.includes(role))
  );

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
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              const baseClasses = `
      flex items-center w-full p-3 rounded-lg transition-all duration-200
      text-left hover:bg-red-800 hover:text-slate-50 active:bg-slate-600
      ${
        active
          ? "bg-red-800 text-red-50 shadow-md border-l-4 "
          : "text-slate-200"
      }
      ${isCollapsed ? "justify-center" : "justify-start"}
    `;

              const showBadge =
                item.name === "Reservations" && pendingReservations > 0;
              return (
                <li key={item.name}>
                  {item.isLink ? (
                    <Link
                      to={item.path}
                      className={`${baseClasses} relative`}
                      aria-label={item.name}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="ml-3 font-medium text-white flex items-center gap-2">
                          {item.name}
                          {showBadge && (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-500 text-white">
                              {pendingReservations}
                            </span>
                          )}
                        </span>
                      )}
                      {showBadge && isCollapsed && (
                        <span className="absolute top-2 right-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-semibold rounded-full bg-red-500 text-white">
                          {pendingReservations}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <button className={`${baseClasses} group relative`}>
                      <Icon size={20} className="flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="ml-3 font-medium text-white">
                          {item.name}
                        </span>
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
          <Link
            to={`/profile/${user?.userId}`}
            className={`flex items-center cursor-pointer rounded-lg p-2 transition-all duration-200 
      hover:bg-slate-700 hover:scale-[1.01] 
      ${isCollapsed ? "justify-center" : "space-x-3"}`}
          >
            <Avatar user={user} size="sm" />

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 truncate font-medium">
                {user?.name || "Guest User"}
                </p>
                {user?.roles && user.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.roles.map((role) => {
                      const roleColors = {
                        admin: "bg-red-500/20 text-red-400 border-red-500/30",
                        cashier: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                      };
                      return (
                        <span
                          key={role}
                          className={`text-xs px-2 py-0.5 rounded border ${
                            roleColors[role] || "bg-slate-600 text-slate-300"
                          }`}
                        >
                          {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </Link>
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
