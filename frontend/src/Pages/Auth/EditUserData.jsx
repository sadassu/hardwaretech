import React, { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

function EditUserData() {
  const [email, setEmail] = useState("");
  const [fetchUrl, setFetchUrl] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate(); // ✅ Hook for navigation

  const { data, loading, error } = useFetch(fetchUrl, {}, [fetchUrl]);

  const handleFetch = () => {
    if (!email) return;
    setFetchUrl(`/user/fetchUser?email=${encodeURIComponent(email)}`);
    setHasSearched(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleFetch();
    }
  };

  // Update when fetched
  React.useEffect(() => {
    if (data?.user?.roles) {
      setSelectedRoles(data.user.roles);
    }
  }, [data]);

  const handleRoleChange = (e) => {
    const { options } = e.target;
    const newRoles = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) newRoles.push(options[i].value);
    }
    setSelectedRoles(newRoles);
  };

  const handleUpdateRoles = async () => {
    if (!data?.user?._id) return;
    try {
      await api.put(`/user/updateRoles/${data.user._id}`, {
        roles: selectedRoles,
      });
      alert("Roles updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update roles.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              User Management
            </h2>
            <button
              onClick={() => navigate(-1)} // ✅ Go back to previous page
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition duration-200"
            >
              ← Back
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter user email address"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <button
                  onClick={handleFetch}
                  disabled={!email || loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Searching...
                    </span>
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
            </div>

            {hasSearched && error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {data && (
              <div className="mt-6 space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    User Information
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong className="text-gray-900">Name:</strong>{" "}
                      {data.user?.name || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <strong className="text-gray-900">Email:</strong>{" "}
                      {data.user?.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Manage Roles
                  </label>
                  <select
                    multiple
                    value={selectedRoles}
                    onChange={handleRoleChange}
                    className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-32"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="cashier">Cashier</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Hold Ctrl (Windows) or Cmd (Mac) to select multiple roles
                  </p>
                  <button
                    onClick={handleUpdateRoles}
                    className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 shadow-md hover:shadow-lg"
                  >
                    Update Roles
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Reservations
                  </h4>
                  {data.reservations?.length > 0 ? (
                    <ul className="space-y-2">
                      {data.reservations.map((res) => (
                        <li
                          key={res._id}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-800">
                              {res.reservationDate}
                            </span>
                            <span className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
                              {res.reservationDetails.length} detail
                              {res.reservationDetails.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">
                      No reservations found for this user.
                    </p>
                  )}
                </div>
              </div>
            )}

            {!hasSearched && !data && (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-gray-500 text-lg">
                  Enter an email address to search for a user
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditUserData;
