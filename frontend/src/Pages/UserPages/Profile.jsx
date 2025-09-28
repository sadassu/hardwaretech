import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useReservationsContext } from "../../hooks/useReservationContext";
import { useFetch } from "../../hooks/useFetch";
import { formatDatePHT } from "../../utils/formatDate";
import { formatPrice } from "../../utils/formatPrice";
import ChangeName from "./ChangeName";
import { useAuthorize } from "../../hooks/useAuthorize";
import ChangePassword from "./ChangePassword";

const Profile = () => {
  const { userId } = useParams();
  const { user } = useAuthContext();
  const { reservations, dispatch } = useReservationsContext();
  const [page] = useState(1);
  const limit = 30;

  //check if the params userid is actually the user logged in
  useAuthorize(userId);

  const { data, loading, error } = useFetch(
    `/reservations/user/${userId}`,
    {
      params: {
        page,
        limit,
        sortBy: "reservationDate",
        sortOrder: "desc",
      },
      headers: { Authorization: `Bearer ${user?.token}` },
    },
    [page, userId]
  );

  useEffect(() => {
    if (data) {
      dispatch({
        type: "SET_RESERVATIONS",
        payload: {
          reservations: data.reservations,
          total: data.total,
          page: data.page,
          pages: data.pages,
        },
      });
    }
  }, [data, dispatch]);

  // Calculate status counts
  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      failed: 0,
      completed: 0,
    };

    if (reservations) {
      reservations.forEach((reservation) => {
        counts[reservation.status] = (counts[reservation.status] || 0) + 1;
      });
    }

    return counts;
  };

  const statusCounts = getStatusCounts();

  // Get status badge color (matching your UserReservations component)
  const getStatusBadgeColor = (status) => {
    const statusClasses = {
      pending: "badge-warning",
      confirmed: "badge-success",
      cancelled: "badge-error",
      completed: "badge-info",
      failed: "badge-error",
    };
    return `badge ${statusClasses[status] || "badge-neutral"}`;
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-2">Profile</h1>
          <p className="text-base-content/70">
            Manage your account and view your reservation history
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Information Card */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Account Information
                </h2>

                {/* User Details */}
                <div className="space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Name</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={user?.name || ""}
                        className="input input-bordered flex-1"
                        disabled
                      />
                      <ChangeName />
                    </div>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Email</span>
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      className="input input-bordered w-full"
                      disabled
                    />
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        Email cannot be changed
                      </span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="card-actions justify-end mt-6">
                  <ChangePassword />
                </div>
              </div>
            </div>

            {/* Status Overview Card */}
            <div className="card bg-base-100 shadow-xl mt-6">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Reservation Summary
                </h2>

                <div className="stats stats-vertical shadow">
                  <div className="stat">
                    <div className="stat-title">Total Reservations</div>
                    <div className="stat-value text-primary">
                      {data?.total || 0}
                    </div>
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

          {/* Transactions History */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="card-title text-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Transaction History
                  </h2>
                  <div className="text-sm text-base-content/70">
                    {data?.total || 0} total transactions
                  </div>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="flex justify-center py-8">
                    <span className="loading loading-spinner loading-md"></span>
                  </div>
                )}

                {/* Transactions List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {!loading && reservations && reservations.length > 0 ? (
                    reservations.map((reservation) => (
                      <div
                        key={reservation._id}
                        className="card bg-base-200 p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className={`${getStatusBadgeColor(
                                  reservation.status
                                )} capitalize`}
                              >
                                {reservation.status}
                              </div>
                              <span className="text-sm text-base-content/70">
                                {formatDatePHT(reservation.reservationDate)}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <span className="text-sm font-medium">
                                  Reservation ID:
                                </span>
                                <span className="text-sm text-base-content/70 ml-2">
                                  #{reservation._id?.slice(-8)}
                                </span>
                              </div>
                              <div>
                                <span className="text-sm font-medium">
                                  Amount:
                                </span>
                                <span className="text-sm font-bold text-primary ml-2">
                                  {formatPrice(reservation.totalPrice)}
                                </span>
                              </div>
                            </div>

                            {/* Items Count */}
                            {reservation.reservationDetails && (
                              <div className="mt-2">
                                <span className="text-sm font-medium">
                                  Items:
                                </span>
                                <span className="text-sm text-base-content/70 ml-2">
                                  {reservation.reservationDetails.length}{" "}
                                  item(s)
                                </span>
                              </div>
                            )}

                            {reservation.notes && (
                              <div className="mt-2">
                                <span className="text-sm font-medium">
                                  Notes:
                                </span>
                                <p className="text-sm text-base-content/70 ml-2 line-clamp-1">
                                  {reservation.notes}
                                </p>
                              </div>
                            )}

                            {reservation.remarks &&
                              reservation.remarks !== "no remarks" && (
                                <div className="mt-2">
                                  <span className="text-sm font-medium">
                                    Remarks:
                                  </span>
                                  <p className="text-sm text-base-content/70 ml-2 line-clamp-1">
                                    {reservation.remarks}
                                  </p>
                                </div>
                              )}
                          </div>

                          <div className="dropdown dropdown-left">
                            <button
                              type="button"
                              tabIndex={0}
                              role="button"
                              className="btn btn-ghost btn-sm"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 5v.01M12 12v.01M12 19v.01"
                                />
                              </svg>
                            </button>
                            <ul
                              tabIndex={0}
                              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                            >
                              <li>
                                <a>View Details</a>
                              </li>
                              <li>
                                <a>Download Receipt</a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : !loading ? (
                    <div className="text-center py-12">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-base-content/30 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-base-content/60 mb-2">
                        No Transactions Yet
                      </h3>
                      <p className="text-base-content/40">
                        Your reservation history will appear here once you make
                        your first booking.
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* View All Reservations Button */}
                {!loading && reservations && reservations.length > 0 && (
                  <div className="card-actions justify-center mt-4">
                    <button
                      className="btn btn-outline"
                      onClick={() =>
                        (window.location.href = `/reservations/user/${userId}`)
                      }
                    >
                      View All Reservations
                      {data?.total > reservations.length && (
                        <span className="badge badge-primary ml-2">
                          +{data.total - reservations.length} more
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
