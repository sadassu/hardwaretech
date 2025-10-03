import React from "react";
import DeleteProductsData from "./DeleteProductsData";
import DeleteReservationsData from "./DeleteReservationsData";
import DeleteSalesData from "./DeleteSalesData";
import { Link } from "react-router";

function SettingList() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your data and system preferences
          </p>
        </div>

        {/* Edit User Section */}
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M17.414 2.586a2 2 0 010 2.828l-9.9 9.9-3.536.707.707-3.536 9.9-9.9a2 2 0 012.829 0z" />
                <path
                  fillRule="evenodd"
                  d="M2 15.25V18h2.75l8.63-8.63-2.75-2.75L2 15.25z"
                  clipRule="evenodd"
                />
              </svg>
              User Management
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              Update user information such as name, email, and roles.
            </p>
            <Link
              to="/user/edit"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
            >
              Edit User
            </Link>
          </div>

          {/* Data Management Section */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Data Management
            </h3>
            <p className="text-sm text-red-700 mb-4">
              Warning: These actions will permanently delete data and cannot be
              undone.
            </p>

            <ul className="space-y-3">
              <li className="flex items-center justify-between p-3 bg-white rounded-md border border-red-100">
                <div>
                  <h4 className="font-medium text-gray-800">Products Data</h4>
                  <p className="text-sm text-gray-600">
                    Delete all product information and inventory
                  </p>
                </div>
                <DeleteProductsData />
              </li>

              <li className="flex items-center justify-between p-3 bg-white rounded-md border border-red-100">
                <div>
                  <h4 className="font-medium text-gray-800">
                    Reservations Data
                  </h4>
                  <p className="text-sm text-gray-600">
                    Remove all reservation records and bookings
                  </p>
                </div>
                <DeleteReservationsData />
              </li>

              <li className="flex items-center justify-between p-3 bg-white rounded-md border border-red-100">
                <div>
                  <h4 className="font-medium text-gray-800">Sales Data</h4>
                  <p className="text-sm text-gray-600">
                    Clear all sales history and transaction records
                  </p>
                </div>
                <DeleteSalesData />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingList;
