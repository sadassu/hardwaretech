import React from "react";
import DeleteProductsData from "./DeleteProductsData";
import DeleteReservationsData from "./DeleteReservationsData";
import DeleteSalesData from "./DeleteSalesData";
import DeleteSupplyHistoryData from "./DeleteSupplyHistoryData";
import { Link } from "react-router";
import { UserCog, FolderCog, AlertTriangle, Settings } from "lucide-react";

function SettingList() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full px-2 sm:px-3 lg:px-3 xl:px-4 py-2 sm:py-3 ml-4 sm:ml-6 lg:ml-8 transform scale-98 origin-top-left">
      {/* Header */}
      <div className="mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-400 rounded-lg shadow-md flex-shrink-0">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
                Settings
              </h1>
              <p className="text-xs text-gray-600 hidden sm:block">
                Manage your data and system preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 text-sm">

        {/* ===== SETTINGS CONTENT ===== */}
        <div className="p-3 sm:p-4 space-y-4">
          {/* USER MANAGEMENT */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2 flex items-center">
              <UserCog className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              User Management
            </h3>
            <p className="text-xs sm:text-sm text-red-700 mb-3">
              Update user information such as name, email, and roles.
            </p>
            <Link
              to="/user/edit"
              className="inline-block bg-yellow-400 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-500 transition-colors text-sm sm:text-base"
            >
              Edit User
            </Link>
          </div>

          {/* CATEGORY MANAGEMENT */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2 flex items-center">
              <FolderCog className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              Categories
            </h3>
            <p className="text-xs sm:text-sm text-red-700 mb-3">
              Manage product categories and classification.
            </p>
            <Link
              to="/categories"
              className="inline-block bg-yellow-400 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-500 transition-colors text-sm sm:text-base"
            >
              Edit Categories
            </Link>
          </div>

        </div>
      </div>
      </div>
    </div>
  );
}

export default SettingList;
