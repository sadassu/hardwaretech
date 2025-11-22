import React, { useState } from "react";
import { Edit } from "lucide-react";
import { useAuthContext } from "../../hooks/useAuthContext";
import api from "../../utils/api";
import Modal from "../../components/Modal";
import { useProductStore } from "../../store/productStore";
import { useReservationStore } from "../../store/reservationStore";

const UpdateReservationDetails = ({ reservation, onUpdateSuccess }) => {
  const { user } = useAuthContext();
  const { updateReservation } = useReservationStore();
  const { products } = useProductStore();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    remarks: reservation?.remarks || "",
    reservationDetails: reservation?.reservationDetails || [],
  });

  // ✅ Update a detail field
  const handleDetailChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedDetails = [...prev.reservationDetails];
      updatedDetails[index] = { ...updatedDetails[index], [field]: value };
      return { ...prev, reservationDetails: updatedDetails };
    });
  };

  // ✅ Remove a detail item
  const handleRemoveDetail = (index) => {
    setFormData((prev) => {
      const updatedDetails = [...prev.reservationDetails];
      updatedDetails.splice(index, 1);
      return { ...prev, reservationDetails: updatedDetails };
    });
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reservation) return;

    try {
      setLoading(true);

      const payload = {
        remarks: formData.remarks,
        reservationDetails: formData.reservationDetails.map((d) => ({
          productVariantId: d.productVariantId?._id || d.productVariantId,
          quantity: d.quantity,
          size: d.size,
          unit: d.unit,
        })),
      };

      const res = await api.put(`/reservations/${reservation._id}`, payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      const updatedReservation = res.data.reservation;

      // ✅ Update Zustand store
      updateReservation(updatedReservation);

      // ✅ Notify parent if needed
      onUpdateSuccess?.(updatedReservation);

      setIsOpen(false);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="btn btn-sm btn-ghost gap-1.5 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
        onClick={() => setIsOpen(true)}
        title="Edit Reservation"
      >
        <Edit className="w-4 h-4" />
        <span className="hidden sm:inline">Edit</span>
      </button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        className="bg-white rounded-2xl max-w-3xl w-full p-0 max-h-[90vh] flex flex-col"
      >
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Edit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Edit Reservation</h3>
              <p className="text-purple-100 text-sm">Update order details and remarks</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Remarks Section */}
          <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Remarks
              </label>
            <textarea
              value={formData.remarks}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, remarks: e.target.value }))
              }
                className="textarea textarea-bordered w-full bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-gray-900"
                rows={3}
                placeholder="Add any special notes or instructions..."
            />
          </div>

            {/* Order Items Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  Order Items ({formData.reservationDetails?.length || 0})
                </label>
              </div>

          {formData.reservationDetails?.length > 0 ? (
                <div className="space-y-3">
              {formData.reservationDetails.map((detail, index) => {
                const matchedProduct = products?.find(
                  (p) => p._id === (detail.productId?._id || detail.productId)
                );

                return (
                  <div
                    key={index}
                        className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-4 relative hover:border-purple-300 transition-colors"
                  >
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveDetail(index)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                          title="Remove item"
                    >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                    </button>

                        <div className="pr-10">
                          <h5 className="font-bold text-gray-900 mb-3">
                            {detail?.productVariantId?.product?.name || "Unnamed Product"}
                        </h5>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Quantity */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={detail.quantity || 1}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "quantity",
                                    parseInt(e.target.value, 10)
                                  )
                                }
                                className="input input-bordered input-sm w-full bg-white border-2 border-gray-300 focus:border-purple-500"
                              />
                            </div>

                            {/* Unit */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Unit
                              </label>
                              <input
                                type="text"
                                value={detail.unit || ""}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "unit",
                                    e.target.value
                                  )
                                }
                                className="input input-bordered input-sm w-full bg-white border-2 border-gray-300 focus:border-purple-500"
                                placeholder="pcs, kg, etc."
                              />
                            </div>

                            {/* Size */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Size
                              </label>
                              <input
                                type="text"
                                value={detail.size || ""}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "size",
                                    e.target.value
                                  )
                                }
                                className="input input-bordered input-sm w-full bg-white border-2 border-gray-300 focus:border-purple-500"
                                placeholder="Size"
                              />
                        </div>
                      </div>

                          {/* Price Display */}
                      {matchedProduct?.price && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Subtotal:</span>
                                <span className="text-lg font-bold text-purple-600">
                                  ₱{(matchedProduct.price * (detail.quantity || 1)).toLocaleString()}
                                </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">No order items found</p>
                </div>
          )}
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0">
            <div className="flex gap-3">
            <button
              type="button"
                className="flex-1 btn btn-ghost border-2 border-gray-200 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
                disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
                className="flex-1 btn bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 hover:from-purple-600 hover:to-purple-700 shadow-lg"
              disabled={loading}
            >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Save Changes
                  </span>
                )}
            </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default UpdateReservationDetails;
