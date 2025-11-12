import React from "react";
import ChangeName from "./ChangeName";
import ChangePassword from "./ChangePassword";
import ChangeAvatar from "./ChangeAvatar";
import { AlertTriangle, BarChart3, LockIcon, SquarePen } from "lucide-react";
import DeleteAccount from "./DeleteAccount";

function UserInformationCard({ user }) {
  return (
    <div className="lg:col-span-1">
      <h2 className="card-title text-xl mb-4 flex items-center gap-2">
        Account Information
      </h2>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {/* User Details */}
          <div className="space-y-4 flex gap-5">
            {/* Avatar Upload Section */}
            <ChangeAvatar /> {/* ✅ Avatar change */}
            <div className="mt">
              <p>
                <span className="text-2xl font-semibold capitalize text-green-800">
                  {user?.name || ""}
                </span>
              </p>
              <p className=" text-gray-700">{user?.roles || ""}</p>
              <p className=" text-gray-700">{user?.email || ""}</p>
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
