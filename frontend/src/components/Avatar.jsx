// components/Avatar.jsx
import React from "react";
import { User, Shield, UserCog } from "lucide-react";

/**
 * Avatar component with role-based fallback icons
 * @param {Object} props
 * @param {Object} props.user - User object with avatar, roles, email, name
 * @param {string} props.size - Size: "sm" | "md" | "lg" | "xl" | number (pixels)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showBorder - Whether to show border
 */
const Avatar = ({ user, size = "md", className = "", showBorder = false }) => {
  // Size mapping
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  // Get size classes
  const sizeClasses = typeof size === "number" 
    ? { width: `${size}px`, height: `${size}px` }
    : sizeMap[size] || sizeMap.md;

  // Get icon size based on avatar size
  const iconSizeMap = {
    sm: 16,
    md: 20,
    lg: 32,
    xl: 48,
  };
  const iconSize = typeof size === "number" 
    ? size * 0.5 
    : iconSizeMap[size] || iconSizeMap.md;

  // Determine user role (prioritize admin > cashier > user)
  const primaryRole = user?.roles?.includes("admin")
    ? "admin"
    : user?.roles?.includes("cashier")
    ? "cashier"
    : "user";

  // Role-based styling
  const roleStyles = {
    admin: {
      bgColor: "bg-red-500",
      icon: Shield,
      iconColor: "text-white",
    },
    cashier: {
      bgColor: "bg-blue-500",
      icon: UserCog,
      iconColor: "text-white",
    },
    user: {
      bgColor: "bg-gray-500",
      icon: User,
      iconColor: "text-white",
    },
  };

  const roleStyle = roleStyles[primaryRole] || roleStyles.user;
  const IconComponent = roleStyle.icon;

  // Get user initials
  const getInitials = () => {
    if (user?.name) {
      const names = user.name.trim().split(" ");
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "?";
  };

  const borderClass = showBorder
    ? primaryRole === "admin"
      ? "border-4 border-red-300"
      : primaryRole === "cashier"
      ? "border-4 border-blue-300"
      : "border-4 border-gray-300"
    : "";

  // If user has avatar, show image with fallback
  if (user?.avatar) {
    const [imageError, setImageError] = React.useState(false);
    
    return (
      <div
        className={`rounded-full overflow-hidden flex items-center justify-center ${borderClass} ${className}`}
        style={typeof size === "number" ? sizeClasses : undefined}
      >
        {!imageError ? (
          <img
            src={user.avatar}
            alt={`${user.name || user.email}'s avatar`}
            className={`${typeof size === "string" ? sizeClasses : ""} object-cover`}
            style={typeof size === "number" ? sizeClasses : undefined}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={`${roleStyle.bgColor} ${roleStyle.iconColor} rounded-full flex items-center justify-center ${typeof size === "string" ? sizeClasses : ""}`}
            style={typeof size === "number" ? sizeClasses : undefined}
          >
            <IconComponent size={iconSize} />
          </div>
        )}
      </div>
    );
  }

  // Show role-based icon
  return (
    <div
      className={`${roleStyle.bgColor} ${roleStyle.iconColor} rounded-full flex items-center justify-center ${borderClass} ${typeof size === "string" ? sizeClasses : ""} ${className}`}
      style={typeof size === "number" ? sizeClasses : undefined}
      title={user?.name || user?.email || "User"}
    >
      <IconComponent size={iconSize} />
    </div>
  );
};

export default Avatar;

