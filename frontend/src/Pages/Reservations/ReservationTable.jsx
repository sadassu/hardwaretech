import React, { useEffect } from "react";
import {
  Loader2,
  ClipboardList,
  ChevronRight,
  FileWarning,
} from "lucide-react";

import { useReservationStore } from "../../store/reservationStore";
import { useAuthContext } from "../../hooks/useAuthContext";

import UpdateReservationStatus from "./UpdateReservationStatus";
import CompleteReservation from "./CompleteReservation";
import UpdateReservationDetails from "./UpdateReservationDetails";

const ReservationTable = () => {
  const {
    reservations,
    page,
    loading,
    expandedRow,
    statusFilter,
    fetchReservations,
    toggleExpandedRow,
    updateReservation,
  } = useReservationStore();

  const { user } = useAuthContext();

  const limit = 20;

  useEffect(() => {
    if (user?.token) {
      fetchReservations(user.token, { page, limit, status: statusFilter });
    }
  }, [page, statusFilter, user?.token, fetchReservations]);

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
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  if (!reservations?.length) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="h-12 w-12 text-base-content/20 mx-auto mb-2" />
        <p className="text-base-content/60">
          No reservations found for{" "}
          {statusFilter === "all" ? "any status" : statusFilter}
        </p>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body p-0">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th></th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Reservation Date</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => (
                <React.Fragment key={res._id}>
                  <tr className="hover">
                    <td>
                      <button
                        className="btn btn-ghost btn-sm btn-circle"
                        onClick={() => toggleExpandedRow(res._id)}
                      >
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
                            expandedRow === res._id ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    </td>
                    <td className="text-sm font-bold">
                      {res.userId?.name || "Unknown User"}
                    </td>
                    <td className="text-sm">{res.userId?.email || "N/A"}</td>
                    <td className="text-sm">
                      {new Date(res.reservationDate).toLocaleDateString(
                        "en-PH",
                        { year: "numeric", month: "short", day: "numeric" }
                      )}
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
                        <UpdateReservationStatus reservation={res} />
                        <UpdateReservationDetails
                          reservation={res}
                          onUpdateSuccess={updateReservation}
                        />
                        {!['completed', 'cancelled'].includes(res.status?.toLowerCase()) && (
                          <CompleteReservation
                            reservation={res}
                            onUpdateSuccess={updateReservation}
                          />
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Details */}
                  {expandedRow === res._id && (
                    <tr>
                      <td colSpan="7" className="p-0">
                        <div className="bg-base-50 p-4 border-t">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                            {/* Notes */}
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold text-sm mb-1">
                                  Notes
                                </h4>
                                <p className="text-sm bg-base-100 p-2 rounded">
                                  {res.notes || "No notes provided"}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm mb-1">
                                  Remarks
                                </h4>
                                <p className="text-sm bg-base-100 p-2 rounded">
                                  {res.remarks || "No remarks"}
                                </p>
                              </div>
                            </div>

                            {/* Order Details */}
                            <div>
                              <h4 className="font-semibold text-sm mb-2">
                                Order Details
                              </h4>
                              {res.reservationDetails?.length > 0 ? (
                                <div className="space-y-2">
                                  {res.reservationDetails.map(
                                    (detail, index) => {
                                      const variant = detail.productVariantId;
                                      const product = variant?.product;

                                      return (
                                        <div
                                          key={index}
                                          className="bg-base-100 p-3 rounded-lg border"
                                        >
                                          <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                              <h5 className="font-medium text-sm">
                                                {product?.name ||
                                                  "Unnamed Product"}
                                              </h5>
                                              <div className="text-xs mt-1 space-y-1 text-base-content/60">
                                                <div className="flex gap-4 flex-wrap">
                                                  <span>
                                                    Qty:{" "}
                                                    <span className="font-mono">
                                                      {detail.quantity}
                                                    </span>
                                                  </span>
                                                  <span>
                                                    Unit:{" "}
                                                    <span className="badge badge-outline badge-xs">
                                                      {variant?.unit || "pcs"}
                                                    </span>
                                                  </span>
                                                  {variant?.size && (
                                                    <span>
                                                      Size:{" "}
                                                      <span className="font-mono">
                                                        {variant.size}
                                                      </span>
                                                    </span>
                                                  )}
                                                  {variant?.color && (
                                                    <span>
                                                      Color:{" "}
                                                      <span className="font-mono">
                                                        {variant.color}
                                                      </span>
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            {variant?.price && (
                                              <div className="text-right">
                                                <div className="text-xs text-base-content/60">
                                                  Price
                                                </div>
                                                <div className="font-mono text-sm font-medium">
                                                  ₱
                                                  {(
                                                    variant.price *
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
                                  <FileWarning className="w-6 h-6 mx-auto mb-1 opacity-50" />
                                  <p className="text-sm">
                                    No order details available
                                  </p>
                                  <p className="text-xs mt-1">
                                    Make sure to populate
                                    reservationDetails.productVariantId.product
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReservationTable;
