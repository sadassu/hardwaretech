import React from "react";
import Modal from "../../components/Modal";
import { formatDatePHT } from "../../utils/formatDate";
import { formatPrice } from "../../utils/formatPrice";

function ReservationDetailsModal({
  isOpen,
  onClose,
  selectedReservation,
  getStatusBadge,
}) {
  if (!selectedReservation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl w-full text-white"
    >
      <h3 className="font-bold text-2xl mb-6 text-center">
        Reservation Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Reservation Info Card */}
        <div className="bg-base-200/20 border border-gray-700 rounded-2xl shadow-lg p-5 backdrop-blur-sm">
          <h4 className="font-semibold text-lg mb-3">Reservation Info</h4>
          <div className="space-y-2 text-gray-300">
            <div>
              <span className="text-gray-400">ID: </span>
              <span className="font-mono text-white">
                {selectedReservation._id}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Date: </span>
              <span>{formatDatePHT(selectedReservation.reservationDate)}</span>
            </div>
            <div>
              <span className="text-gray-400">Status: </span>
              <span className={getStatusBadge(selectedReservation.status)}>
                {selectedReservation.status.charAt(0).toUpperCase() +
                  selectedReservation.status.slice(1)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Total: </span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(selectedReservation.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes Card */}
        {selectedReservation.notes && (
          <div className="bg-base-200/20 border border-gray-700 rounded-2xl shadow-lg p-5 backdrop-blur-sm">
            <h4 className="font-semibold text-lg mb-3">Notes</h4>
            <p className="text-gray-300 whitespace-pre-line leading-relaxed">
              {selectedReservation.notes}
            </p>
          </div>
        )}
      </div>

      {/* Reserved Items Card */}
      {selectedReservation.reservationDetails?.length > 0 && (
        <div className="bg-base-200/20 border border-gray-700 rounded-2xl shadow-lg p-5 backdrop-blur-sm">
          <h4 className="font-semibold text-lg mb-4">Reserved Items</h4>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-white">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="py-2">Product</th>
                  <th className="py-2">Quantity</th>
                  <th className="py-2">Unit</th>
                </tr>
              </thead>
              <tbody>
                {selectedReservation.reservationDetails.map((detail, index) => (
                  <tr
                    key={detail._id || index}
                    className="hover:bg-base-200/30 transition-colors"
                  >
                    <td className="py-2">
                      <div>
                        <div className="font-medium text-white">
                          {detail.productId?.name || "Product"}
                        </div>
                        {detail.productId?.description && (
                          <div className="text-gray-400 text-sm">
                            {detail.productId.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="font-medium py-2">{detail.quantity}</td>
                    <td className="py-2">
                      <span className="badge badge-outline text-gray-200 border-gray-500">
                        {detail.unit}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default ReservationDetailsModal;
