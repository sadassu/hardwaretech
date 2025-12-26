import React from "react";
import ChangeName from "./ChangeName";
import ChangePassword from "./ChangePassword";
import { AlertTriangle, BarChart3, LockIcon, SquarePen, Shield, UserCog } from "lucide-react";
import DeleteAccount from "./DeleteAccount";
import Avatar from "../../components/Avatar";

function UserInformationCard({ user }) {
  // Get role badge styling
  const getRoleBadge = (role) => {
    const badges = {
      admin: {
        label: "Owner",
        icon: Shield,
        classes: "bg-red-500 text-white",
      },
      cashier: {
        label: "Cashier",
        icon: UserCog,
        classes: "bg-blue-500 text-white",
      },
      user: {
        label: "User",
        icon: UserCog,
        classes: "bg-gray-500 text-white",
      },
    };
    return badges[role] || null;
  };

  return (
    <div className="lg:col-span-1">
      <h2 className="card-title text-xl mb-4 flex items-center gap-2">
        Account Information
      </h2>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {/* User Details */}
          <div className="space-y-4 flex gap-5">
            {/* Avatar Display (Read-only) */}
            <div className="flex-shrink-0">
              <Avatar user={user} size="xl" showBorder={true} className="shadow-lg" />
            </div>
            <div className="mt">
              <p>
                <span className="text-2xl font-semibold capitalize text-green-800">
                  {user?.name || ""}
                </span>
              </p>
              
              {/* Role Badges */}
              {user?.roles && user.roles.length > 0 && (
                <div className="flex flex-wrap gap-2 my-2">
                  {user.roles.map((role) => {
                    const badge = getRoleBadge(role);
                    if (!badge) return null;
                    const Icon = badge.icon;
                    return (
                      <div
                        key={role}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${badge.classes} font-medium text-sm`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{badge.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <p className="text-gray-700">{user?.email || ""}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="card-actions justify-end ">
            {!user.googleLoggedIn && (
              <ChangePassword
                className="btn bg-red-500 text-white"
                icon={LockIcon}
              />
            )}
            <ChangeName
              className="btn bg-red-500 text-white"
              icon={SquarePen}
            />
            <DeleteAccount
              className="btn bg-red-500 text-white"
              icon={AlertTriangle}
            />
          </div>
        </div>
      </div>

      
    </div>
  );
}

export default UserInformationCard;
