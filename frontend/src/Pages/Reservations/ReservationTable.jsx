import React, { useEffect } from "react";
import {
  Loader2,
  ClipboardList,
  ChevronRight,
  FileWarning,
  User,
  Mail,
  Calendar,
  Package,
  MessageSquare,
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
    searchQuery,
    fetchReservations,
    toggleExpandedRow,
    updateReservation,
  } = useReservationStore();

  const { user } = useAuthContext();

  const limit = 20;

  useEffect(() => {
    if (user?.token) {
      fetchReservations(user.token, { page, limit, status: statusFilter, search: searchQuery });
    }
  }, [page, statusFilter, searchQuery, user?.token, fetchReservations]);

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        badge: "bg-amber-100 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
        label: "Pending",
      },
      confirmed: {
        badge: "bg-blue-100 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
        label: "Confirmed",
      },
      cancelled: {
        badge: "bg-red-100 text-red-700 border-red-200",
        dot: "bg-red-500",
        label: "Cancelled",
      },
      failed: {
        badge: "bg-red-100 text-red-700 border-red-200",
        dot: "bg-red-500",
        label: "Failed",
      },
      completed: {
        badge: "bg-green-100 text-green-700 border-green-200",
        dot: "bg-green-500",
        label: "Completed",
      },
    };
    return configs[status] || configs.pending;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] bg-base-100 rounded-2xl">
        <Loader2 className="animate-spin w-12 h-12 text-primary mb-4" />
        <p className="text-base-content/60">Loading reservations...</p>
      </div>
    );
  }

  if (!reservations?.length) {
    return (
      <div className="bg-base-100 rounded-2xl shadow-lg border-2 border-base-300">
        <div className="text-center py-16">
          <div className="bg-base-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="h-10 w-10 text-base-content/30" />
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-2">
            No Reservations Found
          </h3>
        <p className="text-base-content/60">
            {statusFilter === "all"
              ? "No reservations have been created yet"
              : `No ${statusFilter} reservations at the moment`}
        </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reservations.map((res) => {
        const statusConfig = getStatusConfig(res.status);
        const isExpanded = expandedRow === res._id;
        
        return (
          <div
            key={res._id}
            className="bg-white rounded-2xl shadow-md border-2 border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
          >
            {/* Main Card Content */}
            <div className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Left Section - Customer Info */}
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {res.userId?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                      {res.userId?.name || "Unknown User"}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 mt-0.5">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{res.userId?.email || "N/A"}</span>
                        </div>
                      </div>
                      
                      {/* Status Badge - Mobile */}
                      <div className="lg:hidden">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Date and Price - Mobile */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm mt-2">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                          {new Date(res.reservationDate).toLocaleDateString("en-PH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-green-600">
                        ₱{res.totalPrice?.toLocaleString() || "0"}
                      </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Status & Actions (Desktop) */}
                <div className="hidden lg:flex items-center gap-4">
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.badge}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></span>
                    {statusConfig.label}
                      </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!["completed", "cancelled"].includes(res.status?.toLowerCase()) && (
                          <>
                            <UpdateReservationStatus reservation={res} />
                            <UpdateReservationDetails
                              reservation={res}
                              onUpdateSuccess={updateReservation}
                            />
                            <CompleteReservation
                              reservation={res}
                              onUpdateSuccess={updateReservation}
                            />
                          </>
                        )}
                    
                    {/* Expand Button */}
                    <button
                      onClick={() => toggleExpandedRow(res._id)}
                      className="btn btn-ghost btn-sm btn-circle"
                      aria-label="Toggle details"
                    >
                      <ChevronRight
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="lg:hidden flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                  {!["completed", "cancelled"].includes(res.status?.toLowerCase()) && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <UpdateReservationStatus reservation={res} />
                      <UpdateReservationDetails
                        reservation={res}
                        onUpdateSuccess={updateReservation}
                      />
                      <CompleteReservation
                        reservation={res}
                        onUpdateSuccess={updateReservation}
                      />
                      </div>
                  )}
                  
                  <button
                    onClick={() => toggleExpandedRow(res._id)}
                    className="btn btn-ghost btn-sm btn-circle ml-auto"
                    aria-label="Toggle details"
                  >
                    <ChevronRight
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

                  {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t-2 border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Column - Notes & Remarks */}
                  <div className="space-y-4">
                            {/* Notes */}
                              <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <h4 className="font-semibold text-sm text-gray-700">
                                  Notes
                                </h4>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200 text-sm text-gray-700 min-h-[60px]">
                        {res.notes || (
                          <span className="text-gray-400 italic">
                            No notes provided
                          </span>
                        )}
                      </div>
                              </div>

                    {/* Remarks */}
                              <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        <h4 className="font-semibold text-sm text-gray-700">
                                  Remarks
                                </h4>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200 text-sm text-gray-700 min-h-[60px]">
                        {res.remarks || (
                          <span className="text-gray-400 italic">
                            No remarks
                          </span>
                        )}
                      </div>
                              </div>
                            </div>

                  {/* Right Column - Order Details */}
                            <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-4 h-4 text-green-600" />
                      <h4 className="font-semibold text-sm text-gray-700">
                                Order Details
                              </h4>
                    </div>

                              {res.reservationDetails?.length > 0 ? (
                      <div className="space-y-3">
                        {res.reservationDetails.map((detail, index) => {
                                      const variant = detail.productVariantId;
                                      const product = variant?.product;

                                      return (
                                        <div
                                          key={index}
                              className="bg-white rounded-xl border-2 border-gray-200 p-3 sm:p-4 hover:border-gray-300 transition-colors"
                                        >
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-sm text-gray-900 mb-2 truncate">
                                    {product?.name || "Unnamed Product"}
                                              </h5>
                                  
                                  <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                                      Qty: {detail.quantity}
                                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">
                                                      {variant?.unit || "pcs"}
                                                  </span>
                                                  {variant?.size && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium">
                                                        {variant.size}
                                                    </span>
                                                  )}
                                                  {variant?.color && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-pink-50 text-pink-700 text-xs font-medium capitalize">
                                                        {variant.color}
                                                    </span>
                                                  )}
                                              </div>
                                            </div>

                                            {variant?.price && (
                                  <div className="text-right flex-shrink-0">
                                    <div className="text-xs text-gray-500 mb-0.5">
                                      Subtotal
                                                </div>
                                    <div className="font-mono text-sm font-bold text-green-600">
                                      ₱{(variant.price * detail.quantity).toLocaleString()}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                        })}
                                </div>
                              ) : (
                      <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                        <FileWarning className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-600 mb-1">
                                    No order details available
                                  </p>
                        <p className="text-xs text-gray-400">
                          Order items will appear here
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                  )}
        </div>
        );
      })}
    </div>
  );
};

export default ReservationTable;
