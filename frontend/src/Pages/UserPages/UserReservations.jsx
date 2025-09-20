import React, { useEffect, useState } from "react";
import { useReservationsContext } from "../../hooks/useReservationContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useFetch } from "../../hooks/useFetch";
import { useParams } from "react-router";
import Modal from "../../components/Modal";
import { formatDatePHT } from "../../utils/formatDate";
import { formatPrice } from "../../utils/formatPrice";

const UserReservations = () => {
  const { reservations, pages, dispatch } = useReservationsContext();
  const { user } = useAuthContext();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 12;
  const { userId } = useParams();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, loading, error } = useFetch(
    `/reservations/user/${userId}`,
    {
      params: {
        page,
        limit,
        sortBy: "name",
        sortOrder: "asc",
        search: debouncedSearch,
      },
      headers: { Authorization: `Bearer ${user?.token}` },
    },
    [page, debouncedSearch, userId]
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

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "badge-warning",
      confirmed: "badge-success",
      cancelled: "badge-error",
    };
    return `badge ${statusClasses[status] || "badge-neutral"}`;
  };


  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedReservation(null);
    setIsModalOpen(false);
  };

  const renderPagination = () => {
    if (!pages || pages <= 1) return null;

    const pageNumbers = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(pages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center mt-8">
        <div className="join">
          <button
            className="join-item btn btn-outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            «
          </button>
          {pageNumbers.map((num) => (
            <button
              key={num}
              className={`join-item btn ${
                page === num ? "btn-active" : "btn-outline"
              }`}
              onClick={() => setPage(num)}
            >
              {num}
            </button>
          ))}
          <button
            className="join-item btn btn-outline"
            onClick={() => setPage(page + 1)}
            disabled={page === pages}
          >
            »
          </button>
        </div>
      </div>
    );
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
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
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

      {/* Error State */}
      {error && (
        <div className="alert alert-error mb-6">
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
          <span>Error loading reservations: {error}</span>
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
                  <div className="flex justify-between items-start mb-4">
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
          {renderPagination()}
        </>
      )}

      {/* Reservation Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        className="max-w-4xl w-full"
      >
        {selectedReservation && (
          <>
            <h3 className="font-bold text-lg mb-6">Reservation Details</h3>

            {/* Reservation Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-2">Reservation Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-base-content/70">ID: </span>
                    <span className="font-mono">{selectedReservation._id}</span>
                  </div>
                  <div>
                    <span className="text-base-content/70">Date: </span>
                    <span>
                      {formatDatePHT(selectedReservation.reservationDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-base-content/70">Status: </span>
                    <span
                      className={getStatusBadge(selectedReservation.status)}
                    >
                      {selectedReservation.status.charAt(0).toUpperCase() +
                        selectedReservation.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-base-content/70">Total: </span>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(selectedReservation.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedReservation.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <div className="bg-base-200 p-4 rounded-lg">
                    <p>{selectedReservation.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Reservation Details */}
            {selectedReservation.reservationDetails &&
              selectedReservation.reservationDetails.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-4">Reserved Items</h4>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReservation.reservationDetails.map(
                          (detail, index) => (
                            <tr key={detail._id || index}>
                              <td>
                                <div>
                                  <div className="font-medium">
                                    {detail.productId?.name || "Product"}
                                  </div>
                                  {detail.productId?.description && (
                                    <div className="text-base-content/70">
                                      {detail.productId.description}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="font-medium">{detail.quantity}</td>
                              <td>
                                <span className="badge badge-outline">
                                  {detail.unit}
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default UserReservations;
