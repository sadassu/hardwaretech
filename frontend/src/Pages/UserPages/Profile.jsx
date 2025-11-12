import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useAuthorize } from "../../hooks/useAuthorize";
import { formatDatePHT } from "../../utils/formatDate";
import { formatPrice } from "../../utils/formatPrice";
import UserInformationCard from "./UserInformationCard";
import { ClipboardList, Receipt, BarChart3 } from "lucide-react";
import { useReservationStore } from "../../store/reservationStore";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const {
    reservations = [],
    total = 0,
    loading,
    statusCounts = {},
    fetchUserReservations,
  } = useReservationStore();

  // ✅ Restrict unauthorized access
  useAuthorize(userId);

  // ✅ Fetch only the current user's reservations
  useEffect(() => {
    if (user?.token && userId) {
      fetchUserReservations(user.token, userId, { page: 1, limit: 30 });
    }
  }, [user?.token, userId, fetchUserReservations]);

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

  // ✅ Hide transaction history if user.roles includes admin or cashier
  const showTransactionHistory =
    !user?.roles?.includes("admin") && !user?.roles?.includes("cashier");

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-base-content mb-2 fira-code">
            My Profile
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* User Information */}
          <UserInformationCard user={user} statusCounts={statusCounts} />

          {/* ✅ Conditionally show Reservation Summary + Transaction History */}
          {showTransactionHistory && (
            <>
              {/* ✅ Reservation Summary Card */}
              <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                  <h2 className="card-title text-xl mb-4 flex items-center gap-2">
                    <BarChart3 className="h-6 w-6" />
                    Reservation Summary
                  </h2>

                  <div className="stats stats-vertical shadow">
                    <div className="stat">
                      <div className="stat-title">Total Reservations</div>
                      <div className="stat-value text-primary">
                        {total || 0}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="stat bg-base-200 rounded-lg p-3">
                      <div className="stat-title text-xs">Pending</div>
                      <div className="stat-value text-sm text-warning">
                        {statusCounts.pending || 0}
                      </div>
                    </div>
                    <div className="stat bg-base-200 rounded-lg p-3">
                      <div className="stat-title text-xs">Confirmed</div>
                      <div className="stat-value text-sm text-success">
                        {statusCounts.confirmed || 0}
                      </div>
                    </div>
                    <div className="stat bg-base-200 rounded-lg p-3">
                      <div className="stat-title text-xs">Completed</div>
                      <div className="stat-value text-sm text-info">
                        {statusCounts.completed || 0}
                      </div>
                    </div>
                    <div className="stat bg-base-200 rounded-lg p-3">
                      <div className="stat-title text-xs">Cancelled/Failed</div>
                      <div className="stat-value text-sm text-error">
                        {(statusCounts.cancelled || 0) +
                          (statusCounts.failed || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ Transaction History */}
              <div className="lg:col-span-2">
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="card-title text-xl flex items-center gap-2">
                        <ClipboardList className="h-6 w-6" />
                        Transaction History
                      </h2>
                      <div className="text-sm text-base-content/70">
                        {total || 0} total transactions
                      </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                      <div className="flex justify-center py-8">
                        <span className="loading loading-spinner loading-md"></span>
                      </div>
                    )}

                    {/* Transaction List */}
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {!loading && reservations.length > 0 ? (
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
                            </div>
                          </div>
                        ))
                      ) : !loading ? (
                        <div className="text-center py-12">
                          <Receipt className="h-12 w-12 mx-auto text-base-content/30 mb-4" />
                          <h3 className="text-lg font-medium text-base-content/60 mb-2">
                            No Transactions Yet
                          </h3>
                          <p className="text-base-content/40">
                            Your reservation history will appear here once you
                            make your first booking.
                          </p>
                        </div>
                      ) : null}
                    </div>

                    {/* View All */}
                    {!loading && reservations.length > 0 && (
                      <div className="card-actions justify-center mt-4">
                        <button
                          className="btn btn-outline"
                          onClick={() =>
                            navigate(`/reservations/user/${userId}`)
                          }
                        >
                          View All Reservations
                          {total > reservations.length && (
                            <span className="badge badge-primary ml-2">
                              +{total - reservations.length} more
                            </span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
