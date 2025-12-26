import React from "react";
import Modal from "../../components/Modal";
import { formatDatePHT } from "../../utils/formatDate";
import { formatPrice } from "../../utils/formatPrice";
import { Calendar, Package, FileText, X } from "lucide-react";
import { formatVariantLabel } from "../../utils/formatVariantLabel";

function ReservationDetailsModal({
  isOpen,
  onClose,
  selectedReservation,
  getStatusConfig,
}) {
  if (!selectedReservation || !getStatusConfig) return null;

  const statusConfig = getStatusConfig(selectedReservation.status) || {
    badge: "bg-gray-100 text-gray-700 border-gray-200",
    dot: "bg-gray-500",
    label: "Unknown",
    icon: null,
    color: "text-gray-600",
  };
  const StatusIcon = statusConfig.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideCloseButton={true}
      className="bg-white rounded-2xl max-w-4xl w-full p-0 max-h-[90vh] flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Reservation Details</h3>
              <p className="text-blue-100 text-sm">View complete reservation information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Reservation Info */}
          <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl shadow-sm p-5">
            <h4 className="font-semibold text-lg mb-4 text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              Reservation Info
            </h4>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Reservation ID
                </span>
                <p className="text-sm text-gray-900 break-all mt-1">
                  #{selectedReservation._id?.slice(-8)}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Date</span>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formatDatePHT(selectedReservation.reservationDate)}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Status</span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.badge}`}
                  >
                    {StatusIcon && <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />}
                    {statusConfig.label}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Total Amount</span>
                <p className="text-xl font-bold text-green-600 mt-1">
                  {formatPrice(selectedReservation.totalPrice)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(selectedReservation.notes || selectedReservation.remarks) && (
            <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl shadow-sm p-5">
              <h4 className="font-semibold text-lg mb-4 text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                Notes & Remarks
              </h4>
              <div className="space-y-3">
                {selectedReservation.notes && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Notes</span>
                    <p className="text-sm text-gray-900 whitespace-pre-line leading-relaxed mt-1 bg-white p-3 rounded-lg border border-gray-200">
                      {selectedReservation.notes}
                    </p>
                  </div>
                )}
                {selectedReservation.remarks && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Remarks</span>
                    <p className="text-sm text-gray-900 whitespace-pre-line leading-relaxed mt-1 bg-white p-3 rounded-lg border border-gray-200">
                      {selectedReservation.remarks}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reserved Items */}
        {selectedReservation.reservationDetails?.length > 0 && (
          <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl shadow-sm p-5">
            <h4 className="font-semibold text-lg mb-4 text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-green-600" />
              </div>
              Reserved Items ({selectedReservation.reservationDetails.length})
            </h4>

            <div className="space-y-3 mb-6">
              {selectedReservation.reservationDetails.map((detail, index) => {
                const variant = detail?.productVariantId;
                const product = variant?.product;
                // Use stored names if product/variant is deleted
                const productName = product?.name || detail.productName || "Unknown Product";
                const variantLabel = formatVariantLabel(
                  variant || {
                    size: detail.variantSize || detail.size,
                    unit: detail.variantUnit || detail.unit,
                    color: detail.variantColor || detail.color,
                  }
                );
                const variantColor = variant?.color || detail.variantColor;

                // Safely compute price and subtotal (locked at reservation time)
                const price =
                  typeof detail?.price === "number"
                    ? detail.price
                    : variant?.price || 0;
                const subtotal = price * (detail?.quantity || 0);

                return (
                  <div
                    key={detail?._id || index}
                    className="bg-white border-2 border-gray-200 rounded-xl p-4 transition-all hover:border-blue-300 hover:shadow-md"
                  >
                    {/* Product Info */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="font-semibold text-base text-gray-900 mb-1">
                          {productName}
                        </h5>
                        {variantLabel && (
                          <p className="text-sm text-gray-600">{variantLabel}</p>
                        )}
                      </div>
                      {variantColor && (
                        <div
                          className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 ml-2"
                          style={{ backgroundColor: variantColor }}
                          title={variantColor}
                        ></div>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Quantity</span>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {detail?.quantity ?? "N/A"}
                        </p>
                      </div>

                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Unit Price</span>
                        <p className="text-sm text-gray-900 mt-1">
                          {formatPrice(price)}
                        </p>
                      </div>

                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Subtotal</span>
                        <p className="text-sm font-bold text-green-600 mt-1">
                          {formatPrice(subtotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="pt-4 border-t-2 border-gray-200 bg-white rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(selectedReservation.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ReservationDetailsModal;
