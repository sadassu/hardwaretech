import React, { useState, useEffect } from "react";
import { Edit, AlertTriangle } from "lucide-react";
import { useAuthContext } from "../../hooks/useAuthContext";
import api from "../../utils/api";
import Modal from "../../components/Modal";
import { useProductStore } from "../../store/productStore";
import { useReservationStore } from "../../store/reservationStore";

const UpdateReservationDetails = ({ reservation, onUpdateSuccess }) => {
  const { user } = useAuthContext();
  const { updateReservation } = useReservationStore();
  const { products, fetchProducts } = useProductStore();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stockMessages, setStockMessages] = useState({}); // Track stock messages per item
  const [formData, setFormData] = useState({
    remarks: reservation?.remarks || "",
    reservationDetails: reservation?.reservationDetails || [],
  });

  // ✅ Fetch products with variants when modal opens
  useEffect(() => {
    if (isOpen && user?.token && products.length === 0) {
      fetchProducts(user.token, { page: 1, limit: 1000 }); // Fetch all products to get variants
    }
  }, [isOpen, user?.token, products.length, fetchProducts]);

  // ✅ Calculate available stock for a reservation detail
  const getAvailableStock = (detail, originalDetail) => {
    const variant = detail.productVariantId;
    if (!variant || !variant.quantity) return 0;
    
    // Get original quantity from reservation (before editing)
    const originalQuantity = originalDetail?.quantity || detail.quantity || 0;
    
    // Available stock = current variant stock + original reservation quantity
    // (because the original quantity is currently reserved and will be released)
    return (variant.quantity || 0) + originalQuantity;
  };

  // ✅ Update a detail field with stock validation
  const handleDetailChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedDetails = [...prev.reservationDetails];
      const originalDetail = reservation?.reservationDetails?.[index];
      const currentDetail = updatedDetails[index];
      
      // If changing quantity, validate against available stock
      if (field === "quantity") {
        const newQuantity = Math.max(1, parseInt(value, 10) || 1);
        const availableStock = getAvailableStock(currentDetail, originalDetail);
        
        if (newQuantity > availableStock) {
          // Set to max available stock
          updatedDetails[index] = { ...currentDetail, quantity: availableStock };
          setStockMessages((prev) => ({
            ...prev,
            [index]: `Maximum available stock: ${availableStock}`,
          }));
        } else {
          updatedDetails[index] = { ...currentDetail, quantity: newQuantity };
          setStockMessages((prev) => {
            const newMessages = { ...prev };
            delete newMessages[index];
            return newMessages;
          });
        }
      } else {
        updatedDetails[index] = { ...currentDetail, [field]: value };
      }
      
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

  // ✅ Validate all quantities before submit
  const validateQuantities = () => {
    const errors = {};
    formData.reservationDetails.forEach((detail, index) => {
      const originalDetail = reservation?.reservationDetails?.[index];
      const availableStock = getAvailableStock(detail, originalDetail);
      
      if (detail.quantity > availableStock) {
        errors[index] = `Quantity exceeds available stock (${availableStock})`;
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setStockMessages(errors);
      return false;
    }
    
    return true;
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reservation) return;

    // Validate quantities before submitting
    if (!validateQuantities()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        remarks: formData.remarks,
        reservationDetails: formData.reservationDetails.map((d) => {
          // Use variant's unit if available, otherwise fallback to detail's unit
          const variant = d.productVariantId;
          const unit = variant?.unit || d.unit;
          
          return {
            productVariantId: variant?._id || d.productVariantId,
            quantity: d.quantity,
            size: d.size,
            unit: unit,
          };
        }),
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
      setStockMessages({}); // Clear messages on success
    } catch (error) {
      console.error("Update failed:", error);
      // Show error if backend validation fails
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="btn btn-sm btn-ghost gap-1.5 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
        onClick={() => {
          setIsOpen(true);
          setStockMessages({}); // Reset stock messages when opening
        }}
        title="Edit Reservation"
      >
        <Edit className="w-4 h-4" />
        <span className="hidden sm:inline">Edit</span>
      </button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => {
          setIsOpen(false);
          setStockMessages({}); // Reset stock messages when closing
        }}
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
                // Get product ID from detail (could be from productId or productVariantId.product)
                const productId = detail.productId?._id || detail.productId || detail.productVariantId?.product?._id || detail.productVariantId?.product;
                
                const matchedProduct = products?.find(
                  (p) => p._id === productId
                );

                // Get variant information
                const variant = detail.productVariantId;
                const currentUnit = variant?.unit || detail.unit || "";

                // Get available sizes from product variants in inventory
                const getAvailableSizes = () => {
                  // Try to get variants from matched product first
                  let productVariants = matchedProduct?.variants;
                  
                  // If not found, try to get from the product in the variant
                  if (!productVariants && variant?.product?.variants) {
                    productVariants = variant.product.variants;
                  }
                  
                  if (!productVariants || !Array.isArray(productVariants)) {
                    return [];
                  }
                  
                  // Extract unique sizes from all variants that have a size
                  const sizes = productVariants
                    .map((v) => v.size)
                    .filter((size) => size && size.trim() !== "");
                  
                  // Remove duplicates and sort
                  return [...new Set(sizes)].sort();
                };

                const availableSizes = getAvailableSizes();

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
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-semibold text-gray-600">
                                  Quantity
                                </label>
                                {(() => {
                                  const originalDetail = reservation?.reservationDetails?.[index];
                                  const availableStock = getAvailableStock(detail, originalDetail);
                                  const variant = detail.productVariantId;
                                  return variant?.quantity !== undefined ? (
                                    <span className="text-xs text-gray-500">
                                      Stock: {availableStock}
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                              <input
                                type="number"
                                min={1}
                                max={(() => {
                                  const originalDetail = reservation?.reservationDetails?.[index];
                                  return getAvailableStock(detail, originalDetail);
                                })()}
                                value={detail.quantity || 1}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "quantity",
                                    parseInt(e.target.value, 10)
                                  )
                                }
                                className={`input input-bordered input-sm w-full bg-white border-2 ${
                                  stockMessages[index]
                                    ? "border-red-300 focus:border-red-500"
                                    : "border-gray-300 focus:border-purple-500"
                                }`}
                              />
                              {stockMessages[index] && (
                                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span>{stockMessages[index]}</span>
                                </div>
                              )}
                            </div>

                            {/* Unit - Read Only */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Unit
                              </label>
                              <input
                                type="text"
                                value={currentUnit}
                                disabled
                                readOnly
                                className="input input-bordered input-sm w-full bg-gray-100 border-2 border-gray-300 text-gray-600 cursor-not-allowed"
                                placeholder="pcs, kg, etc."
                                title="Unit is determined by the product variant"
                              />
                            </div>

                            {/* Size - Dropdown (Always) */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Size
                              </label>
                              <select
                                value={detail.size || ""}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "size",
                                    e.target.value
                                  )
                                }
                                className="select select-bordered select-sm w-full bg-white border-2 border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 cursor-pointer"
                              >
                                <option value="">Select Size</option>
                                {availableSizes.length > 0 ? (
                                  availableSizes.map((size) => (
                                    <option key={size} value={size}>
                                      {size}
                                    </option>
                                  ))
                                ) : (
                                  <option value="" disabled>
                                    No sizes available
                                  </option>
                                )}
                              </select>
                              {availableSizes.length === 0 && (
                                <p className="mt-1 text-xs text-gray-500">
                                  No size variants found for this product
                                </p>
                              )}
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
