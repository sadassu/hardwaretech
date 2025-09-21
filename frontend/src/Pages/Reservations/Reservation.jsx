import React, { useEffect, useState } from "react";
import { useReservationsContext } from "../../hooks/useReservationContext";
import { useProductsContext } from "../../hooks/useProductContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useFetch } from "../../hooks/useFetch";
import UpdateReservationStatus from "./UpdateReservationStatus";
import CompleteReservation from "./CompleteReservation";

const Reservation = () => {
  const { reservations, pages, dispatch } = useReservationsContext();
  const { products } = useProductsContext();
  const { user } = useAuthContext();

  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);
  const limit = 20;

  const { data, loading, error } = useFetch(
    "/reservations",
    {
      params: { page, limit, sortBy: "reservationDate", sortOrder: "asc" },
      headers: { Authorization: `Bearer ${user?.token}` },
    },
    [page, user?.token]
  );

  console.log(reservations);
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

  const toggleExpandedRow = (reservationId) => {
    setExpandedRow(expandedRow === reservationId ? null : reservationId);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "badge-warning",
      confirmed: "badge-info",
      cancelled: "badge-error",
      failed: "badge-error",
      completed: "badge-success",
    };
    return `badge ${statusClasses[status] || "badge-neutral"}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-base-content">Reservations</h1>
        <p className="text-base-content/70 mt-2">
          Manage customer reservations and orders
        </p>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200">
                <tr>
                  <th></th>
                  <th className="font-semibold">Customer</th>
                  <th className="font-semibold">Contact</th>
                  <th className="font-semibold">Reservation Date</th>
                  <th className="font-semibold">Total Price</th>
                  <th className="font-semibold">Status</th>
                  <th className="font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations && reservations.length > 0 ? (
                  reservations.map((res) => (
                    <React.Fragment key={res._id}>
                      <tr className="hover">
                        <td>
                          <button
                            className="btn btn-ghost btn-sm btn-circle"
                            onClick={() => toggleExpandedRow(res._id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 transition-transform ${
                                expandedRow === res._id ? "rotate-90" : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </td>
                        <td>
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="font-bold text-sm">
                                {res.userId?.name || "Unknown User"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-sm">
                            {res.userId?.email || "N/A"}
                          </span>
                        </td>
                        <td>
                          <div className="text-sm">
                            {new Date(res.reservationDate).toLocaleDateString(
                              "en-PH",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="font-mono font-semibold text-success">
                            ₱{res.totalPrice?.toLocaleString() || "0"}
                          </span>
                        </td>
                        <td>
                          <span className={getStatusBadge(res.status)}>
                            {res.status?.charAt(0).toUpperCase() +
                              res.status?.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <UpdateReservationStatus
                              reservation={res}
                              onUpdateSuccess={(updated) =>
                                dispatch({
                                  type: "UPDATE_RESERVATION",
                                  payload: updated,
                                })
                              }
                            />
                            <CompleteReservation
                              reservation={res}
                              onUpdateSuccess={(updated) =>
                                dispatch({
                                  type: "UPDATE_RESERVATION",
                                  payload: updated,
                                })
                              }
                            />
                          </div>
                        </td>
                      </tr>

                      {/* Expanded row for reservation details */}
                      {expandedRow === res._id && (
                        <tr>
                          <td colSpan="7" className="p-0">
                            <div className="bg-base-50 p-4 border-t">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                {/* Notes and Remarks */}
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="font-semibold text-sm text-base-content mb-1">
                                      Notes
                                    </h4>
                                    <p className="text-sm text-base-content/70 bg-base-100 p-2 rounded">
                                      {res.notes || "No notes provided"}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-base-content mb-1">
                                      Remarks
                                    </h4>
                                    <p className="text-sm text-base-content/70 bg-base-100 p-2 rounded">
                                      {res.remarks || "No remarks"}
                                    </p>
                                  </div>
                                </div>

                                {/* Reservation Details */}
                                <div>
                                  <h4 className="font-semibold text-sm text-base-content mb-2">
                                    Order Details
                                  </h4>
                                  {res.reservationDetails &&
                                  res.reservationDetails.length > 0 ? (
                                    <div className="space-y-2">
                                      {res.reservationDetails.map(
                                        (detail, index) => {
                                          // Find matching product
                                          const matchedProduct = products?.find(
                                            (p) =>
                                              p._id ===
                                              (detail.productId?._id ||
                                                detail.productId)
                                          );

                                          return (
                                            <div
                                              key={index}
                                              className="bg-base-100 p-3 rounded-lg border"
                                            >
                                              <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                  <h5 className="font-medium text-sm">
                                                    {matchedProduct?.name ||
                                                      detail.productId?.name ||
                                                      `Product ID: ${detail.productId}`}
                                                  </h5>

                                                  <div className="text-xs text-base-content/60 mt-1 space-y-1">
                                                    <div className="flex gap-4">
                                                      <span>
                                                        Qty:{" "}
                                                        <span className="font-mono">
                                                          {detail.quantity}
                                                        </span>
                                                      </span>
                                                      <span>
                                                        Unit:{" "}
                                                        <span className="badge badge-outline badge-xs">
                                                          {detail.unit}
                                                        </span>
                                                      </span>
                                                      {detail.size && (
                                                        <span>
                                                          Size:{" "}
                                                          <span className="font-mono">
                                                            {detail.size}
                                                          </span>
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>

                                                {detail.productId?.price && (
                                                  <div className="text-right">
                                                    <div className="text-xs text-base-content/60">
                                                      Price
                                                    </div>
                                                    <div className="font-mono text-sm font-medium">
                                                      ₱
                                                      {(
                                                        detail.productId.price *
                                                        detail.quantity
                                                      ).toLocaleString()}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-base-content/50">
                                      <p className="text-sm">
                                        No order details available
                                      </p>
                                      <p className="text-xs mt-1">
                                        Make sure to populate reservationDetails
                                        in your API
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <div className="flex flex-col items-center space-y-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-base-content/20"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <p className="text-base-content/60">
                          No reservations found
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="join">
            <button
              className="join-item btn btn-outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
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
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>

            <button className="join-item btn btn-outline btn-disabled">
              Page {page} of {pages}
            </button>

            <button
              className="join-item btn btn-outline"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
            >
              Next
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
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservation;
