import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useParams } from "react-router";
import Modal from "../../components/Modal";
import { formatDatePHT } from "../../utils/formatDate";
import { formatPrice } from "../../utils/formatPrice";
import Pagination from "../../components/Pagination";
import ReservationDetailsModal from "./ReservationDetailsModal";
import CancelReservation from "./CancelReservation";

// ✅ Lucide React icons
import { Search } from "lucide-react";
import { useReservationStore } from "../../store/reservationStore";

const UserReservations = () => {
  const {
    reservations,
    pages,
    page,
    setPage,
    fetchReservations,
    setReservations,
    loading,
  } = useReservationStore();

  const { user } = useAuthContext();
  const { userId } = useParams();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 12;

  // 🕒 Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search, setPage]);

  // 🔄 Fetch Reservations
  useEffect(() => {
    if (user?.token && userId) {
      fetchReservations(user.token, {
        page,
        limit,
        status: "all",
      });
    }
  }, [user?.token, page, userId, fetchReservations, debouncedSearch]);

  // 🏷️ Status Badge Styling
  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "badge-warning",
      confirmed: "badge-success",
      cancelled: "badge-error",
    };
    return `badge ${statusClasses[status] || "badge-neutral"}`;
  };

  // 🔍 View Reservation Details
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

        {/* Search */}
        <div className="form-control w-full max-w-md">
          <div className="input-group">
            <input
              type="text"
              placeholder="Search reservations..."
              className="input input-bordered w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-square btn-outline">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
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
          <p className="text-base-content/70">
            {search
              ? "Try adjusting your search terms"
              : "You haven't made any reservations yet"}
          </p>
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

                  {/* Reservation ID */}
                  <div className="mb-2">
                    <span className="text-base-content/70">ID: </span>
                    <span className="font-mono text-base">
                      {reservation._id.slice(-8)}
                    </span>
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
                    <CancelReservation reservationId={reservation._id} />
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

      {/* Reservation Details Modal */}
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
