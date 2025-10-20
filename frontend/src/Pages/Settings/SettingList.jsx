import React from "react";
import DeleteProductsData from "./DeleteProductsData";
import DeleteReservationsData from "./DeleteReservationsData";
import DeleteSalesData from "./DeleteSalesData";
import DeleteSupplyHistoryData from "./DeleteSupplyHistoryData";
import { Link } from "react-router";
import { UserCog, FolderCog, AlertTriangle } from "lucide-react";

function SettingList() {
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {/* ===== HEADER ===== */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Settings
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your data and system preferences
          </p>
        </div>

        {/* ===== SETTINGS CONTENT ===== */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* USER MANAGEMENT */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-5">
            <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-3 flex items-center">
              <UserCog className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              User Management
            </h3>
            <p className="text-sm sm:text-base text-blue-700 mb-4">
              Update user information such as name, email, and roles.
            </p>
            <Link
              to="/user/edit"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Edit User
            </Link>
          </div>

          {/* CATEGORY MANAGEMENT */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-5">
            <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-3 flex items-center">
              <FolderCog className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              Categories
            </h3>
            <p className="text-sm sm:text-base text-blue-700 mb-4">
              Manage product categories and classification.
            </p>
            <Link
              to="/categories"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Edit Categories
            </Link>
          </div>

          {/* DATA MANAGEMENT */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-5">
            <h3 className="text-lg sm:text-xl font-semibold text-red-800 mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              Data Management
            </h3>
            <p className="text-sm sm:text-base text-red-700 mb-4">
              ⚠️ Warning: These actions will permanently delete data and cannot
              be undone.
            </p>

            <ul className="space-y-3">
              {/* Each delete section now stacks properly on mobile */}
              <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-white rounded-md border border-red-100">
                <div>
                  <h4 className="font-medium text-gray-800 text-base sm:text-lg">
                    Products Data
                  </h4>
                  <p className="text-sm text-gray-600">
                    Delete all product information and inventory
                  </p>
                </div>
                <div className="self-end sm:self-auto">
                  <DeleteProductsData />
                </div>
              </li>

              <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-white rounded-md border border-red-100">
                <div>
                  <h4 className="font-medium text-gray-800 text-base sm:text-lg">
                    Reservations Data
                  </h4>
                  <p className="text-sm text-gray-600">
                    Remove all reservation records and bookings
                  </p>
                </div>
                <div className="self-end sm:self-auto">
                  <DeleteReservationsData />
                </div>
              </li>

              <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-white rounded-md border border-red-100">
                <div>
                  <h4 className="font-medium text-gray-800 text-base sm:text-lg">
                    Sales Data
                  </h4>
                  <p className="text-sm text-gray-600">
                    Clear all sales history and transaction records
                  </p>
                </div>
                <div className="self-end sm:self-auto">
                  <DeleteSalesData />
                </div>
              </li>

              <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-white rounded-md border border-red-100">
                <div>
                  <h4 className="font-medium text-gray-800 text-base sm:text-lg">
                    Supply History
                  </h4>
                  <p className="text-sm text-gray-600">
                    Clear all supply history records
                  </p>
                </div>
                <div className="self-end sm:self-auto">
                  <DeleteSupplyHistoryData />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingList;
