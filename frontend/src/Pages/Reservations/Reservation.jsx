import React, { useEffect, useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  CheckCheck,
  XCircle,
  AlertTriangle,
  ChevronRight,
  FileWarning,
  Loader2,
} from "lucide-react";

import UpdateReservationStatus from "./UpdateReservationStatus";
import CompleteReservation from "./CompleteReservation";
import UpdateReservationDetails from "./UpdateReservationDetails";

import { useReservationsContext } from "../../hooks/useReservationContext";
import { useProductsContext } from "../../hooks/useProductContext";
import { useAuthContext } from "../../hooks/useAuthContext";

import Pagination from "../../components/Pagination";

const Reservation = () => {
  const { reservations, pages, dispatch } = useReservationsContext();
  const { products } = useProductsContext();
  const { user } = useAuthContext();

  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    failed: 0,
    completed: 0,
  });
  const limit = 20;

  const { data, loading, error } = useFetch(
    "/reservations",
    {
      params: {
        page,
        limit,
        sortBy: "reservationDate",
        sortOrder: "asc",
        status: statusFilter !== "all" ? statusFilter : undefined,
      },
      headers: { Authorization: `Bearer ${user?.token}` },
    },
    [page, statusFilter, user?.token]
  );

  useEffect(() => {
    if (error) {
      // If API says no data found, clear reservations
      dispatch({
        type: "SET_RESERVATIONS",
        payload: { reservations: [], total: 0, page: 1, pages: 1 },
      });
      return;
    }

    if (data) {
      dispatch({
        type: "SET_RESERVATIONS",
        payload: {
          reservations: data.reservations || [],
          total: data.total || 0,
          page: data.page || 1,
          pages: data.pages || 1,
        },
      });

      if (data.statusCounts) setStatusCounts(data.statusCounts);
    }
  }, [data, error, dispatch]);

  const toggleExpandedRow = (reservationId) => {
    setExpandedRow(expandedRow === reservationId ? null : reservationId);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setPage(1);
    setExpandedRow(null);
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

  const statusCards = [
    {
      key: "all",
      label: "All",
      Icon: ClipboardList,
      color: "bg-base-200 hover:bg-base-300",
      activeColor: "bg-primary text-primary-content",
    },
    {
      key: "pending",
      label: "Pending",
      Icon: Clock,
      color: "bg-warning/10 hover:bg-warning/20",
      activeColor: "bg-warning text-warning-content",
    },
    {
      key: "confirmed",
      label: "Confirmed",
      Icon: CheckCircle,
      color: "bg-info/10 hover:bg-info/20",
      activeColor: "bg-info text-info-content",
    },
    {
      key: "completed",
      label: "Completed",
      Icon: CheckCheck,
      color: "bg-success/10 hover:bg-success/20",
      activeColor: "bg-success text-success-content",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      Icon: XCircle,
      color: "bg-error/10 hover:bg-error/20",
      activeColor: "bg-error text-error-content",
    },
    {
      key: "failed",
      label: "Failed",
      Icon: AlertTriangle,
      color: "bg-error/10 hover:bg-error/20",
      activeColor: "bg-error text-error-content",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
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

      {/* Status Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statusCards.map((card) => {
          const IconComponent = card.Icon;
          return (
            <button
              key={card.key}
              onClick={() => handleStatusFilterChange(card.key)}
              className={`card ${
                statusFilter === card.key ? card.activeColor : card.color
              } shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer`}
            >
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <IconComponent className="w-6 h-6" />
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {statusCounts[card.key] || 0}
                    </p>
                    <p className="text-xs opacity-80">{card.label}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

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
                {reservations && reservations.length > 0 ? (
                  reservations.map((res) => (
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
                        <td>
                          <div className="font-bold text-sm">
                            {res.userId?.name || "Unknown User"}
                          </div>
                        </td>
                        <td className="text-sm">
                          {res.userId?.email || "N/A"}
                        </td>
                        <td className="text-sm">
                          {new Date(res.reservationDate).toLocaleDateString(
                            "en-PH",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
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

                      {expandedRow === res._id && (
                        <tr>
                          <td colSpan="7" className="p-0">
                            <div className="bg-base-50 p-4 border-t">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
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

                                <div>
                                  <h4 className="font-semibold text-sm mb-2">
                                    Order Details
                                  </h4>
                                  {res.reservationDetails?.length > 0 ? (
                                    <div className="space-y-2">
                                      {res.reservationDetails.map(
                                        (detail, index) => {
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
                                                  <div className="text-xs mt-1 space-y-1 text-base-content/60">
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
                                      <FileWarning className="w-6 h-6 mx-auto mb-1 opacity-50" />
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
                        <ClipboardList className="h-12 w-12 text-base-content/20" />
                        <p className="text-base-content/60">
                          No reservations found for{" "}
                          {statusFilter === "all" ? "any status" : statusFilter}
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

      <Pagination page={page} pages={pages} onPageChange={setPage} />
    </div>
  );
};

export default Reservation;
