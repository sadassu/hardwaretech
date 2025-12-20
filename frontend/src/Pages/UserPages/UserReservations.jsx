import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useParams } from "react-router";
import { 
  Calendar, 
  Package, 
  FileWarning, 
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";
import Pagination from "../../components/Pagination";
import ReservationDetailsModal from "./ReservationDetailsModal";
import CancelReservation from "./CancelReservation";
import { formatDatePHT } from "../../utils/formatDate";
import { formatPrice } from "../../utils/formatPrice";
import { useReservationStore } from "../../store/reservationStore";
import { useLiveResourceRefresh } from "../../hooks/useLiveResourceRefresh";
import { formatVariantLabel } from "../../utils/formatVariantLabel";

const UserReservations = () => {
  const { reservations, pages, page, setPage, fetchUserReservations, loading } =
    useReservationStore();

  const { user } = useAuthContext();
  const { userId } = useParams();
  const reservationsLiveKey = useLiveResourceRefresh(["reservations", "sales"]);

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 12;

  // 🔄 Fetch user-specific reservations
  useEffect(() => {
    if (user?.token && userId) {
      fetchUserReservations(user.token, userId, {
        page,
        limit,
        status: "all",
      });
    }
  }, [user?.token, userId, page, fetchUserReservations, reservationsLiveKey]);

  // 🏷️ Status configuration helper
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        badge: "bg-amber-100 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
        label: "Pending",
        icon: Clock,
        color: "text-amber-600",
      },
      confirmed: {
        badge: "bg-blue-100 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
        label: "Confirmed",
        icon: CheckCircle,
        color: "text-blue-600",
      },
      cancelled: {
        badge: "bg-red-100 text-red-700 border-red-200",
        dot: "bg-red-500",
        label: "Cancelled",
        icon: XCircle,
        color: "text-red-600",
      },
      completed: {
        badge: "bg-green-100 text-green-700 border-green-200",
        dot: "bg-green-500",
        label: "Completed",
        icon: CheckCircle,
        color: "text-green-600",
      },
    };
    return configs[status] || configs.pending;
  };

  // 🔍 Modal Handlers
  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedReservation(null);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-0 sm:p-4 lg:p-6">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            My Reservations
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base ml-0 sm:ml-[60px]">
            View and manage your reservation orders
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center min-h-[400px] bg-white rounded-2xl shadow-sm border border-gray-100">
            <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
            <p className="text-gray-600">Loading reservations...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && reservations && reservations.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100">
            <div className="text-center py-16">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileWarning className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Reservations Found
              </h3>
              <p className="text-gray-600">
                You haven't made any reservations yet
              </p>
            </div>
          </div>
        )}

        {/* Reservations Grid */}
        {!loading && reservations && reservations.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
              {reservations.map((reservation) => {
                const statusConfig = getStatusConfig(reservation.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div
                    key={reservation._id}
                    className="bg-white rounded-2xl shadow-md border-2 border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
                  >
                    {/* Header with Status */}
                    <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-5 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border ${statusConfig.badge}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></span>
                          {statusConfig.label}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="font-medium">
                            {new Date(reservation.reservationDate).toLocaleDateString("en-PH", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {/* Total Price */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Total Amount</span>
                        <span className="text-lg sm:text-xl font-bold text-green-600">
                          {formatPrice(reservation.totalPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Body - Products */}
                    <div className="p-4 sm:p-5">
                      {/* Products List */}
                      {reservation.reservationDetails?.length > 0 ? (
                        <div className="space-y-3 mb-4">
                          {reservation.reservationDetails.slice(0, 2).map((detail, index) => {
                            const productName = detail.productVariantId?.product?.name || detail.productName || "Unknown Product";
                            const variantLabel = formatVariantLabel(
                              detail.productVariantId || {
                                size: detail.variantSize || detail.size,
                                unit: detail.variantUnit || detail.unit,
                                color: detail.variantColor || detail.color,
                              }
                            );
                            
                            return (
                              <div
                                key={index}
                                className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
                              >
                                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                  <Package className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm text-gray-900 truncate mb-1">
                                    {productName}
                                  </h4>
                                  {variantLabel && (
                                    <p className="text-xs text-gray-600 mb-1">
                                      {variantLabel}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Qty:</span>
                                    <span className="text-xs font-semibold text-gray-700">
                                      {detail.quantity}
                                    </span>
                                    <span className="text-xs text-gray-400">×</span>
                                    <span className="text-xs text-gray-700">
                                      {formatPrice(detail.price || detail.productVariantId?.price || 0)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {reservation.reservationDetails.length > 2 && (
                            <div className="text-center py-2">
                              <span className="text-xs text-gray-500 font-medium">
                                +{reservation.reservationDetails.length - 2} more item(s)
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No items in this reservation
                        </div>
                      )}

                      {/* Items Count */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-3 border-t border-gray-100">
                        <span>
                          {reservation.reservationDetails?.length || 0} item(s) reserved
                        </span>
                        {reservation.notes && (
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                            Has notes
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {reservation.status === "pending" && (
                          <div className="flex-1">
                            <CancelReservation reservationId={reservation._id} />
                          </div>
                        )}
                        <button
                          className="flex-1 btn btn-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700 shadow-md flex items-center justify-center gap-2"
                          onClick={() => handleViewDetails(reservation)}
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="mt-6">
                <Pagination page={page} pages={pages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}

        {/* Details Modal */}
        <ReservationDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          selectedReservation={selectedReservation}
          getStatusConfig={getStatusConfig}
        />
      </div>
    </div>
  );
};

export default UserReservations;
