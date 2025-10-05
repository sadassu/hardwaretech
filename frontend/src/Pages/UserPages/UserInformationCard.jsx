import React from "react";
import ChangeName from "./ChangeName";
import ChangePassword from "./ChangePassword";
import ChangeAvatar from "./ChangeAvatar";
import { BarChart3 } from "lucide-react";

function UserInformationCard({ user, data, statusCounts }) {
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
            <ChangePassword />
            <ChangeName />
          </div>
        </div>
      </div>

      {/* Status Overview Card */}
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4 flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Reservation Summary
          </h2>

          <div className="stats stats-vertical shadow">
            <div className="stat">
              <div className="stat-title">Total Reservations</div>
              <div className="stat-value text-primary">{data?.total || 0}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="stat bg-base-200 rounded-lg p-3">
              <div className="stat-title text-xs">Pending</div>
              <div className="stat-value text-sm text-warning">
                {statusCounts.pending}
              </div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-3">
              <div className="stat-title text-xs">Confirmed</div>
              <div className="stat-value text-sm text-success">
                {statusCounts.confirmed}
              </div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-3">
              <div className="stat-title text-xs">Completed</div>
              <div className="stat-value text-sm text-info">
                {statusCounts.completed}
              </div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-3">
              <div className="stat-title text-xs">Cancelled/Failed</div>
              <div className="stat-value text-sm text-error">
                {statusCounts.cancelled + statusCounts.failed}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInformationCard;
