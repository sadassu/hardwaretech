import React, { useState, useEffect } from "react";
import { Edit, AlertTriangle, Plus, X, Search } from "lucide-react";
import { useAuthContext } from "../../hooks/useAuthContext";
import api from "../../utils/api";
import Modal from "../../components/Modal";
import { useProductStore } from "../../store/productStore";
import { useReservationStore } from "../../store/reservationStore";
import { formatVariantLabel } from "../../utils/formatVariantLabel";
import { useQuickToast } from "../../hooks/useQuickToast";
import { useConfirm } from "../../hooks/useConfirm";

const UpdateReservationDetails = ({ reservation, onUpdateSuccess }) => {
  const { user } = useAuthContext();
  const { updateReservation } = useReservationStore();
  const { products, fetchProducts } = useProductStore();
  const quickToast = useQuickToast();
  const confirm = useConfirm();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stockMessages, setStockMessages] = useState({}); // Track stock messages per item
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    remarks: reservation?.remarks || "",
    reservationDetails: reservation?.reservationDetails || [],
  });

  // ✅ Fetch products with variants when modal opens
  useEffect(() => {
    if (isOpen && user?.token) {
      fetchProducts(user.token, { page: 1, limit: 1000 }); // Fetch all products to get variants
    }
  }, [isOpen, user?.token, fetchProducts]);

  // ✅ Reset add product state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowAddProduct(false);
      setSearchQuery("");
      setSelectedProduct(null);
    }
  }, [isOpen]);

  // ✅ Calculate available stock for a reservation detail
  const getAvailableStock = (detail, originalDetail, matchedProduct) => {
    const variant = detail.productVariantId;
    if (!variant) return 0;
    
    // Get the actual variant from the product's variants (with availableQuantity)
    let actualVariant = null;
    if (matchedProduct?.variants) {
      actualVariant = matchedProduct.variants.find(
        (v) => v._id === variant._id || String(v._id) === String(variant._id)
      );
    }
    
    // Use availableQuantity if available (includes auto-convert), otherwise fallback to quantity
    const variantStock = actualVariant?.availableQuantity ?? actualVariant?.quantity ?? variant.quantity ?? variant?.availableQuantity ?? 0;
    
    // Get original quantity from reservation (before editing)
    const originalQuantity = originalDetail?.quantity || detail.quantity || 0;
    
    // Available stock = current variant stock + original reservation quantity
    // (because the original quantity is currently reserved and will be released)
    return variantStock + originalQuantity;
  };

  // ✅ Update a detail field with stock validation
  const handleDetailChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedDetails = [...prev.reservationDetails];
      const originalDetail = reservation?.reservationDetails?.[index];
      const currentDetail = updatedDetails[index];
      
      // Get product ID to find matched product
      const productId = currentDetail.productId?._id || currentDetail.productId || currentDetail.productVariantId?.product?._id || currentDetail.productVariantId?.product;
      const matchedProduct = products?.find((p) => p._id === productId);
      
      // If changing size, find the matching variant and update productVariantId
      if (field === "size") {
        if (!matchedProduct?.variants || matchedProduct.variants.length === 0) {
          // No variants available, just update size
          updatedDetails[index] = { ...currentDetail, [field]: value };
        } else {
          // Find variant that matches the selected size and current unit
          const currentUnit = currentDetail.productVariantId?.unit || currentDetail.unit || "";
          const matchingVariant = matchedProduct.variants.find(
            (v) => v.size === value && v.unit === currentUnit
          );
          
          if (matchingVariant) {
            // Update to the matching variant
            updatedDetails[index] = {
              ...currentDetail,
              [field]: value,
              productVariantId: {
                ...matchingVariant,
                _id: matchingVariant._id,
                unit: matchingVariant.unit,
                price: matchingVariant.price,
                quantity: matchingVariant.quantity,
                availableQuantity: matchingVariant.availableQuantity,
                product: {
                  _id: matchedProduct._id,
                  name: matchedProduct.name,
                },
              },
              unit: matchingVariant.unit,
                price: matchingVariant.price,
            };
            
            // Reset quantity to 1 if it exceeds new variant's stock
            const newAvailableStock = getAvailableStock(updatedDetails[index], originalDetail, matchedProduct);
            if (updatedDetails[index].quantity > newAvailableStock) {
              updatedDetails[index].quantity = Math.max(1, newAvailableStock);
              setStockMessages((prev) => ({
                ...prev,
                [index]: `Maximum available stock: ${newAvailableStock}`,
              }));
            } else {
              setStockMessages((prev) => {
                const newMessages = { ...prev };
                delete newMessages[index];
                return newMessages;
              });
            }
          } else {
            // No matching variant found, just update size
            updatedDetails[index] = { ...currentDetail, [field]: value };
          }
        }
      }
      // If changing quantity, validate against available stock
      else if (field === "quantity") {
        const newQuantity = Math.max(1, parseInt(value, 10) || 1);
        const availableStock = getAvailableStock(currentDetail, originalDetail, matchedProduct);
        
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

  // ✅ Add a new product to reservation
  const handleAddProduct = (product, variant) => {
    if (!product || !variant) return;

    const newDetail = {
      productId: product._id,
      productVariantId: {
        _id: variant._id,
        unit: variant.unit,
        price: variant.price,
        product: {
          _id: product._id,
          name: product.name,
        },
      },
      price: variant.price,
      quantity: 1,
      size: variant.size || "",
      unit: variant.unit || "",
    };

    setFormData((prev) => ({
      ...prev,
      reservationDetails: [...prev.reservationDetails, newDetail],
    }));

    // Reset selection
    setSelectedProduct(null);
    setShowAddProduct(false);
    setSearchQuery("");
  };

  // ✅ Filter products based on search query
  const filteredProducts = products.filter((product) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.name?.toLowerCase().includes(query) ||
      product.variants?.some((v) =>
        formatVariantLabel(v).toLowerCase().includes(query) ||
        v.size?.toLowerCase().includes(query) ||
        v.unit?.toLowerCase().includes(query)
      )
    );
  });

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
      // Ask for confirmation before updating
      const result = await confirm({
        title: "Update reservation?",
        text: "This will update the items and remarks for this reservation.",
        icon: "question",
        confirmButtonText: "Yes, update",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) {
        return; // User cancelled
      }

      setLoading(true);

      const payload = {
        remarks: formData.remarks,
        reservationDetails: formData.reservationDetails.map((d) => {
          // Use variant's unit if available, otherwise fallback to detail's unit
          const variant = d.productVariantId;
          const unit = variant?.unit || d.unit;
          
          // Handle both object and string ID formats
          const variantId = typeof variant === 'object' 
            ? (variant._id || variant) 
            : (variant || d.productVariantId);
          
          return {
            productVariantId: variantId,
            quantity: d.quantity,
            size: d.size,
            unit: unit,
            price:
              typeof d.price === "number"
                ? d.price
                : variant?.price ?? 0,
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
      
      // Show success alert
      quickToast({
        title: "Reservation updated",
        icon: "success",
      });
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
        className="btn btn-sm btn-ghost gap-1.5 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
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
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Edit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Edit Reservation</h3>
              <p className="text-blue-100 text-sm">Update order details and remarks</p>
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
                className="textarea textarea-bordered w-full bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900"
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
                <button
                  type="button"
                  onClick={() => setShowAddProduct(true)}
                  className="btn btn-sm btn-primary gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>

              {/* Add Product Modal */}
              {showAddProduct && (
                <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Select Product to Add
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddProduct(false);
                        setSearchQuery("");
                        setSelectedProduct(null);
                      }}
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="mb-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products or variants..."
                        className="input input-bordered w-full pl-10 bg-white"
                      />
                    </div>
                  </div>

                  {/* Product List */}
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredProducts.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No products found
                      </p>
                    ) : (
                      filteredProducts.map((product) => (
                        <div
                          key={product._id}
                          className="border border-gray-200 rounded-lg bg-white"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedProduct(
                                selectedProduct?._id === product._id
                                  ? null
                                  : product
                              )
                            }
                            className="w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {product.variants?.length || 0} variant
                                {product.variants?.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <svg
                              className={`w-5 h-5 text-gray-400 transition-transform ${
                                selectedProduct?._id === product._id
                                  ? "rotate-180"
                                  : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>

                          {/* Variants List */}
                          {selectedProduct?._id === product._id &&
                            product.variants?.length > 0 && (
                              <div className="border-t border-gray-200 p-2 space-y-1 max-h-48 overflow-y-auto">
                                {product.variants.map((variant) => {
                                  const availableQty =
                                    variant.availableQuantity ??
                                    variant.quantity ??
                                    0;
                                  const variantLabel =
                                    formatVariantLabel(variant) ||
                                    `${variant.size || ""} ${variant.unit || ""}`.trim() ||
                                    variant.unit ||
                                    "Default";

                                  return (
                                    <button
                                      key={variant._id}
                                      type="button"
                                      onClick={() =>
                                        handleAddProduct(product, variant)
                                      }
                                      disabled={availableQty <= 0}
                                      className={`w-full p-2 rounded-lg text-left transition-colors ${
                                        availableQty > 0
                                          ? "hover:bg-blue-50 border border-gray-200 hover:border-blue-300"
                                          : "bg-gray-100 border border-gray-200 opacity-50 cursor-not-allowed"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium text-gray-900">
                                            {variantLabel}
                                          </p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-600">
                                              Stock: {availableQty}
                                            </span>
                                            {variant.price && (
                                              <span className="text-xs font-semibold text-green-600">
                                                ₱{variant.price.toLocaleString()}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        {availableQty > 0 && (
                                          <Plus className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

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
                        className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-4 relative hover:border-blue-300 transition-colors"
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
                            {detail?.productVariantId?.product?.name || detail?.productName || "Unnamed Product"}
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
                                  const availableStock = getAvailableStock(detail, originalDetail, matchedProduct);
                                  const variant = detail.productVariantId;
                                  return variant ? (
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
                                  return getAvailableStock(detail, originalDetail, matchedProduct);
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
                                    : "border-gray-300 focus:border-blue-500"
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
                                className="select select-bordered select-sm w-full bg-white border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 cursor-pointer"
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
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Subtotal:</span>
                          <span className="text-lg font-bold text-blue-600">
                            ₱
                            {(
                              (typeof detail.price === "number"
                                ? detail.price
                                : variant?.price ?? 0) * (detail.quantity || 1)
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
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
                className="flex-1 btn bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700 shadow-lg"
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
