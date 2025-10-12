import React, { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import api from "../../utils/api";
import Modal from "../../components/Modal";

import { useReservationStore } from "../../store/reservationStore";
import { useProductStore } from "../../store/productStore";

const UpdateReservationDetails = ({ reservation, onUpdateSuccess }) => {
  const { user } = useAuthContext();
  const { updateReservation } = useReservationStore();
  const { products } = useProductStore();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    remarks: reservation?.remarks || "",
    reservationDetails: reservation?.reservationDetails || [],
  });
  const [loading, setLoading] = useState(false);

  const handleDetailChange = (index, field, value) => {
    const updated = [...formData.reservationDetails];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, reservationDetails: updated });
  };

  const handleRemoveDetail = (index) => {
    const updated = [...formData.reservationDetails];
    updated.splice(index, 1);
    setFormData({ ...formData, reservationDetails: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reservation) return;

    try {
      setLoading(true);

      const res = await api.put(
        `/reservations/${reservation._id}`,
        {
          remarks: formData.remarks,
          reservationDetails: formData.reservationDetails.map((d) => ({
            productId: d.productId?._id || d.productId,
            quantity: d.quantity,
            size: d.size,
            unit: d.unit,
          })),
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      // ✅ Update global store
      updateReservation(res.data.reservation);

      // ✅ Optional callback for parent (already used in ReservationTable)
      if (onUpdateSuccess) onUpdateSuccess(res.data.reservation);

      setIsOpen(false);
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="btn btn-sm btn-outline"
        onClick={() => setIsOpen(true)}
      >
        Edit Reservation
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-semibold text-lg text-white">
            Update Reservation
          </h3>

          {/* Remarks */}
          <div>
            <label className="block text-sm mb-1 text-white">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              className="textarea textarea-bordered w-full bg-[#30475E] text-white"
              rows={2}
            />
          </div>

          {/* Reservation Details */}
          {formData.reservationDetails?.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {formData.reservationDetails.map((detail, index) => {
                const matchedProduct = products?.find(
                  (p) => p._id === (detail.productId?._id || detail.productId)
                );

                return (
                  <div
                    key={index}
                    className="p-3 rounded-lg border relative bg-[#30475E] text-white"
                  >
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveDetail(index)}
                      className="absolute top-2 right-2 btn btn-xs btn-error"
                    >
                      ✕
                    </button>

                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* Product Name */}
                        <h5 className="font-medium text-sm">
                          {matchedProduct?.name ||
                            detail.productId?.name ||
                            `Product ID: ${detail.productId}`}
                        </h5>

                        <div className="text-xs text-base-content/60 mt-1 space-y-1">
                          <div className="flex gap-4 items-center flex-wrap">
                            <span>
                              Qty:
                              <input
                                type="number"
                                min={1}
                                value={detail.quantity}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "quantity",
                                    parseInt(e.target.value, 10)
                                  )
                                }
                                className="input input-bordered input-xs w-16 ml-1"
                              />
                            </span>
                            <span>
                              Unit:
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
                                className="input input-bordered input-xs w-20 ml-1"
                              />
                            </span>
                            <span>
                              Size:
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
                                className="input input-bordered input-xs w-20 ml-1"
                              />
                            </span>
                          </div>
                        </div>
                      </div>

                      {matchedProduct?.price && (
                        <div className="text-right">
                          <div className="text-xs text-base-content/60">
                            Price
                          </div>
                          <div className="font-mono text-sm font-medium">
                            ₱
                            {(
                              matchedProduct.price * detail.quantity
                            ).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No details found.</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn bg-red-500 text-white border-red-500"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default UpdateReservationDetails;
