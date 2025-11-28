import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useParams } from "react-router";
import { Search } from "lucide-react";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import ReservationDetailsModal from "./ReservationDetailsModal";
import CancelReservation from "./CancelReservation";
import { formatDatePHT } from "../../utils/formatDate";
import { formatPrice } from "../../utils/formatPrice";
import { useReservationStore } from "../../store/reservationStore";
import { useLiveResourceRefresh } from "../../hooks/useLiveResourceRefresh";

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

  // 🏷️ Badge style helper
  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "badge-warning",
      confirmed: "badge-success",
      cancelled: "badge-error",
    };
    return `badge ${statusClasses[status] || "badge-neutral"}`;
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
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">My Reservations</h1>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Empty State */}
      {!loading && reservations && reservations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-bold mb-2">No reservations found</h3>
        </div>
      )}

      {/* Reservations Grid */}
      {!loading && reservations && reservations.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((reservation) => (
              <div
                key={reservation._id}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="card-body">
                  {/* Status and Date */}
                  <div className="flex justify-between items-start mb-4 martian-mono uppercase">
                    <span className={getStatusBadge(reservation.status)}>
                      {reservation.status.charAt(0).toUpperCase() +
                        reservation.status.slice(1)}
                    </span>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatDatePHT(reservation.reservationDate)}
                      </div>
                    </div>
                  </div>

                  <div className="mb-2">
                    {reservation.reservationDetails?.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {reservation.reservationDetails.map((detail, index) => (
                          <span key={index} className="text-primary text-2xl">
                            {detail.productVariantId?.product?.name ||
                              "Unnamed Product"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Total Price */}
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(reservation.totalPrice)}
                    </div>
                  </div>

                  {/* Notes Preview */}
                  {reservation.notes && (
                    <div className="mb-4">
                      <p className="text-base-content/70 line-clamp-2">
                        {reservation.notes}
                      </p>
                    </div>
                  )}

                  {/* Items Count */}
                  {reservation.reservationDetails && (
                    <div className="mb-4">
                      <span className="text-base-content/70">
                        {reservation.reservationDetails.length} item(s) reserved
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="card-actions justify-end">
                    {reservation.status === "pending" && (
                      <CancelReservation reservationId={reservation._id} />
                    )}
                    <button
                      className="btn btn-primary btn-outline"
                      onClick={() => handleViewDetails(reservation)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}

      {/* Details Modal */}
      <ReservationDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedReservation={selectedReservation}
        getStatusBadge={getStatusBadge}
      />
    </div>
  );
};

export default UserReservations;
