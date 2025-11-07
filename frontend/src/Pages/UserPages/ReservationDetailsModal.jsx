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
      // Keep modal within the viewport and make content scrollable
      className="max-w-5xl w-full text-white px-4 sm:px-6 max-h-[90vh] overflow-y-auto py-6"
    >
      <h3 className="font-bold text-2xl mb-6 text-center text-white">
        Reservation Details
      </h3>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Reservation Info */}
        <div className="bg-[#2d333b] border border-gray-600 rounded-2xl shadow-lg p-5">
          <h4 className="font-semibold text-lg mb-3 text-white">
            Reservation Info
          </h4>
          <div className="space-y-2">
            <div>
              <span className="text-gray-400">ID: </span>
              <span className="font-mono text-gray-200 break-all">
                {selectedReservation._id}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Date: </span>
              <span className="text-gray-200">
                {formatDatePHT(selectedReservation.reservationDate)}
              </span>
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

        {/* Notes */}
        {(selectedReservation.notes || selectedReservation.remarks) && (
          <div className="bg-[#2d333b] border border-gray-600 rounded-2xl shadow-lg p-5">
            <h4 className="font-semibold text-lg mb-3 text-white">
              Notes & Remarks
            </h4>
            {selectedReservation.notes && (
              <p className="text-gray-200 whitespace-pre-line leading-relaxed mb-3">
                <span className="font-semibold text-gray-300">Notes: </span>
                {selectedReservation.notes}
              </p>
            )}
            {selectedReservation.remarks && (
              <p className="text-gray-200 whitespace-pre-line leading-relaxed">
                <span className="font-semibold text-gray-300">Remarks: </span>
                {selectedReservation.remarks}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Reserved Items */}
      {selectedReservation.reservationDetails?.length > 0 && (
        <div className="bg-[#2d333b] border border-gray-600 rounded-2xl shadow-lg p-5">
          <h4 className="font-semibold text-lg mb-4 text-white">
            Reserved Items
          </h4>

          <div className="grid grid-cols-1 gap-4">
            {selectedReservation.reservationDetails.map((detail, index) => {
              const variant = detail.productVariantId;

              const price = variant?.price || 0;
              const subtotal = price * detail.quantity;

              return (
                <div
                  key={detail._id || index}
                  className="bg-[#1a1f25] border border-gray-600 rounded-2xl p-4 transition-all hover:border-gray-500"
                >
                  {/* Product Info */}
                  <div className="mb-3">
                    <h5 className="font-semibold text-lg text-white">
                      {variant.product?.name || "Unnamed Product"}
                    </h5>
                  </div>

                  {/* Variant Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Size:</span>{" "}
                      <span className="text-gray-200">
                        {variant?.size || "—"}
                      </span>
                    </div>

                    {/* Only show Color if it exists */}
                    {variant?.color && (
                      <div>
                        <span className="text-gray-400">Color:</span>{" "}
                        <span className="inline-flex items-center gap-2 text-gray-200">
                          <span>{variant.color}</span>
                          <span
                            className="inline-block w-4 h-4 rounded-full border border-gray-400"
                            style={{ backgroundColor: variant.color }}
                          ></span>
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="text-gray-400">Unit:</span>{" "}
                      <span className="text-gray-200">
                        {variant?.unit || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Quantity:</span>{" "}
                      <span className="text-gray-200">{detail.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Price:</span>{" "}
                      <span className="text-gray-200">
                        {formatPrice(price)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Subtotal:</span>{" "}
                      <span className="font-semibold text-primary">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="mt-6 pt-4 border-t border-gray-600 text-right text-lg font-bold">
            <span className="text-gray-200">Total: </span>
            <span className="text-primary">
              {formatPrice(selectedReservation.totalPrice)}
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default ReservationDetailsModal;
