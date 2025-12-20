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
import { useLiveResourceRefresh } from "../../hooks/useLiveResourceRefresh";

import UpdateReservationStatus from "./UpdateReservationStatus";
import CompleteReservation from "./CompleteReservation";
import UpdateReservationDetails from "./UpdateReservationDetails";
import ReservationUpdateHistory from "../../components/ReservationUpdateHistory";

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
  const reservationsLiveKey = useLiveResourceRefresh(["reservations", "sales"]);

  const limit = 20;

  useEffect(() => {
    if (user?.token) {
      fetchReservations(user.token, {
        page,
        limit,
        status: statusFilter,
        search: searchQuery,
      });
    }
  }, [page, statusFilter, searchQuery, user?.token, fetchReservations, reservationsLiveKey]);

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
    <div className="space-y-2 sm:space-y-3">
      {reservations.map((res) => {
        const statusConfig = getStatusConfig(res.status);
        const isExpanded = expandedRow === res._id;
        
        return (
          <div
            key={res._id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            {/* Main Card Content */}
            <div className="p-3 sm:p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                {/* Left Section - Customer Info */}
                <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {(res.userId?.name || res.userName || "U").charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                            {res.userId?.name || res.userName || "Unknown User"}
                        </h3>
                          {!res.userId && (res.userName || res.userEmail) && (
                            <span className="text-xs text-gray-500 italic whitespace-nowrap">
                              (Deleted)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{res.userId?.email || res.userEmail || "N/A"}</span>
                        </div>
                      </div>
                      
                      {/* Status Badge - Mobile */}
                      <div className="lg:hidden">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Date and Price - Mobile */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs mt-1.5">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>
                          {new Date(res.reservationDate).toLocaleDateString("en-PH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-green-600">
                        ₱{res.totalPrice?.toLocaleString() || "0"}
                      </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Status & Actions (Desktop) */}
                <div className="hidden lg:flex items-center gap-3">
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.badge}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                    {statusConfig.label}
                      </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
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
                      className="btn btn-ghost btn-xs btn-circle"
                      aria-label="Toggle details"
                    >
                      <ChevronRight
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="lg:hidden flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                  {!["completed", "cancelled"].includes(res.status?.toLowerCase()) && (
                    <div className="flex items-center gap-1.5 flex-wrap">
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
                    className="btn btn-ghost btn-xs btn-circle ml-auto"
                    aria-label="Toggle details"
                  >
                    <ChevronRight
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

                  {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white p-3 sm:p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {/* Left Column - Notes & Remarks */}
                  <div className="space-y-3">
                            {/* Notes */}
                              <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        <h4 className="font-semibold text-xs text-gray-700">
                                  Notes
                                </h4>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-gray-200 text-xs text-gray-700 min-h-[50px]">
                        {res.notes || (
                          <span className="text-gray-400 italic">
                            No notes provided
                          </span>
                        )}
                      </div>
                              </div>

                    {/* Remarks */}
                              <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                        <h4 className="font-semibold text-xs text-gray-700">
                                  Remarks
                                </h4>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-gray-200 text-xs text-gray-700 min-h-[50px]">
                        {res.remarks || (
                          <span className="text-gray-400 italic">
                            No remarks
                          </span>
                        )}
                      </div>
                              </div>
                            </div>

                  {/* Right Column - Order Details & Update History */}
                            <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Package className="w-3.5 h-3.5 text-green-600" />
                        <h4 className="font-semibold text-xs text-gray-700">
                                  Order Details
                                </h4>
                      </div>

                              {res.reservationDetails?.length > 0 ? (
                      <div className="space-y-2">
                        {res.reservationDetails.map((detail, index) => {
                                      const variant = detail.productVariantId;
                                      const product = variant?.product;
                                      // Use stored names if product/variant is deleted
                                      const productName = product?.name || detail.productName || "Unnamed Product";
                                      const variantSize = variant?.size || detail.variantSize || detail.size;
                                      const variantUnit = variant?.unit || detail.variantUnit || detail.unit || "pcs";
                                      const variantColor = variant?.color || detail.variantColor;
                                      const lockedPrice =
                                        typeof detail.price === "number"
                                          ? detail.price
                                          : variant?.price ?? 0;
                                      const subtotal =
                                        lockedPrice * (detail.quantity || 0);

                                      return (
                                        <div
                                          key={index}
                              className="bg-white rounded-lg border border-gray-200 p-2.5 hover:border-gray-300 transition-colors"
                                        >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-xs text-gray-900 mb-1.5 truncate">
                                    {productName}
                                              </h5>
                                  
                                  <div className="flex flex-wrap gap-1.5">
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                                      Qty: {detail.quantity}
                                                    </span>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                                                      {variantUnit}
                                                  </span>
                                                  {variantSize && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-xs font-medium">
                                                        {variantSize}
                                                    </span>
                                                  )}
                                                  {variantColor && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 text-xs font-medium capitalize">
                                                        {variantColor}
                                                    </span>
                                                  )}
                                              </div>
                                            </div>

                                  <div className="text-right flex-shrink-0">
                                    <div className="text-xs text-gray-500 mb-0.5">
                                      Subtotal
                                                </div>
                                    <div className="text-xs font-bold text-green-600">
                                      ₱{subtotal.toLocaleString()}
                                                </div>
                                              </div>
                                          </div>
                                        </div>
                                      );
                        })}
                                </div>
                              ) : (
                      <div className="bg-white rounded-lg border border-dashed border-gray-200 p-6 text-center">
                        <FileWarning className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs font-medium text-gray-600 mb-1">
                                    No order details available
                                  </p>
                        <p className="text-xs text-gray-400">
                          Order items will appear here
                                  </p>
                                </div>
                              )}
                    </div>

                    {/* Update History */}
                    <div>
                      <ReservationUpdateHistory reservationId={res._id} />
                    </div>
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
