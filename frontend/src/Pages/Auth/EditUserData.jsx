import React, { useEffect, useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  User,
  Calendar,
  Search,
  Trash,
} from "lucide-react";
import { formatDatePHT } from "../../utils/formatDate";
import { useConfirm } from "../../hooks/useConfirm";
import { useQuickToast } from "../../hooks/useQuickToast";

function EditUserData() {
  const [email, setEmail] = useState("");
  const [fetchUrl, setFetchUrl] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const { data, loading, error } = useFetch(fetchUrl, {}, [fetchUrl]);
  const confirm = useConfirm();
  const quickToast = useQuickToast();

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

  useEffect(() => {
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

    const result = await confirm({
      title: "Update roles?",
      text: `Apply the selected roles to ${data.user.email}?`,
      confirmButtonText: "Yes, update roles",
    });
    if (!result.isConfirmed) return;

    try {
      await api.put(`/user/updateRoles/${data.user._id}`, {
        roles: selectedRoles,
      });
      quickToast({
        title: "Roles updated",
        icon: "success",
      });
      // Refresh user data after successful update
      if (email) {
        setFetchUrl(`/user/fetchUser?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      console.error(err);
      quickToast({
        title: "Failed to update roles",
        text: err.response?.data?.message || err.message,
        icon: "error",
      });
    }
  };

  // DELETE ACCOUNT HANDLER
  const handleDeleteAccount = async () => {
    if (!data?.user?._id) return;

    const result = await confirm({
      title: "Delete this account?",
      text: "This user and all related data will be removed permanently.",
      confirmButtonText: "Yes, delete account",
      icon: "error",
    });
    if (!result.isConfirmed) return;

    setDeleting(true);
    try {
      await api.delete(`/auth/${data.user._id}`);
      quickToast({
        title: "Account deleted",
        icon: "success",
      });

      // Wait for toast to be visible before reloading
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error(err);
      quickToast({
        title: "Failed to delete account",
        text: err.response?.data?.message || err.message,
        icon: "error",
      });
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          {/* Header with Back Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              User Management
            </h2>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition duration-200 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>

          <div className="space-y-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Email
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter user email address"
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm sm:text-base"
                  />
                </div>
                <button
                  onClick={handleFetch}
                  disabled={!email || loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 shadow-md hover:shadow-lg w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" /> Search
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {hasSearched && error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-medium text-sm sm:text-base">Error</p>
                <p className="text-xs sm:text-sm">{error}</p>
              </div>
            )}

            {/* User Data */}
            {data && (
              <div className="mt-6 space-y-4 sm:space-y-6">
                {/* User Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    User Information
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm sm:text-base text-gray-700 break-words">
                      <strong className="text-gray-900">Name:</strong>{" "}
                      {data.user?.name || "N/A"}
                    </p>
                    <p className="text-sm sm:text-base text-gray-700 break-all">
                      <strong className="text-gray-900">Email:</strong>{" "}
                      {data.user?.email || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Role Management */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
                  <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                    Manage Roles
                  </label>
                  <select
                    multiple
                    value={selectedRoles}
                    onChange={handleRoleChange}
                    className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-32 text-sm sm:text-base"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="cashier">Cashier</option>
                  </select>
                  <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <button
                      onClick={handleUpdateRoles}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
                    >
                      Update Roles
                    </button>

                    {/* Delete Button */}

                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 shadow-md hover:shadow-lg w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash className="w-4 h-4" /> Delete Account
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Reservations */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Reservations
                  </h4>
                  {data.reservations?.length > 0 ? (
                    <ul className="space-y-2">
                      {data.reservations.map((res) => (
                        <li
                          key={res._id}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                        >
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <span className="font-medium text-gray-800 text-sm sm:text-base">
                              {formatDatePHT(res.reservationDate)}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full w-fit">
                              {res.reservationDetails.length} detail
                              {res.reservationDetails.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm sm:text-base text-gray-500 italic">
                      No reservations found for this user.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Empty Search Prompt */}
            {!hasSearched && !data && (
              <div className="text-center py-8 sm:py-12">
                <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-base sm:text-lg">
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
