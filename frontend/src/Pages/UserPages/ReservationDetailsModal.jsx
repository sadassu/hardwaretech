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
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl w-full">
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
              <span>{formatDatePHT(selectedReservation.reservationDate)}</span>
            </div>
            <div>
              <span className="text-base-content/70">Status: </span>
              <span className={getStatusBadge(selectedReservation.status)}>
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
      {selectedReservation.reservationDetails?.length > 0 && (
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
                {selectedReservation.reservationDetails.map((detail, index) => (
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
                      <span className="badge badge-outline">{detail.unit}</span>
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
