import React, { useState, useEffect } from "react";
import { useCart } from "../hooks/useCart";
import { useCheckout } from "../hooks/useCheckout";
import { useAuthContext } from "../hooks/useAuthContext";
import { useConfirm } from "../hooks/useConfirm";
import { useQuickToast } from "../hooks/useQuickToast";
import { useIsMobile } from "../hooks/useIsMobile";
import Modal from "./Modal";

import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  StickyNote,
  Banknote,
  ChevronLeft,
  Loader2,
  PackageX,
  AlertTriangle,
  X,
} from "lucide-react";
import { useProductStore } from "../store/productStore";

function CartContent() {
  const { checkout, loading, adminCheckout } = useCheckout();
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [maxStockMessages, setMaxStockMessages] = useState({});
  const { user } = useAuthContext();
  const { isMobile } = useIsMobile();

  // ✅ Zustand store functions
  const { products, setProducts } = useProductStore();

  const confirm = useConfirm();
  const quickToast = useQuickToast();

  const {
    cartItems,
    cartCount,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
    syncCartWithProducts,
  } = useCart();

  const restrictedRoles = ["admin", "cashier"];
  const isRestricted = user?.roles?.some((role) =>
    restrictedRoles.includes(role)
  );

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Sync cart with product/variant updates when products change
  useEffect(() => {
    if (products.length > 0 && cartItems.length > 0) {
      syncCartWithProducts(products);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  // Listen to product update events
  useEffect(() => {
    const handleProductUpdate = () => {
      // Get fresh products from store
      const store = useProductStore.getState();
      if (store.products.length > 0 && cartItems.length > 0) {
        syncCartWithProducts(store.products);
      }
    };

    window.addEventListener("productUpdated", handleProductUpdate);
    window.addEventListener("variantUpdated", handleProductUpdate);
    window.addEventListener("live-update", handleProductUpdate);

    return () => {
      window.removeEventListener("productUpdated", handleProductUpdate);
      window.removeEventListener("variantUpdated", handleProductUpdate);
      window.removeEventListener("live-update", handleProductUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckout = async () => {
    const result = await confirm({
      title: isRestricted ? "Process this sale?" : "Submit reservation?",
      text: isRestricted
        ? "This will finalize the POS transaction."
        : "Selected items will be reserved immediately.",
      confirmButtonText: isRestricted ? "Yes, process sale" : "Yes, reserve items",
    });
    if (!result.isConfirmed) return;

    try {
      let data;
      if (isRestricted) {
        data = await adminCheckout({
          items: cartItems,
          amountPaid,
          cashier: user._id,
        });
      } else {
        data = await checkout({
          items: cartItems,
          notes,
          reservationDate: new Date(),
        });
      }

      // Close cart immediately after successful checkout
      setIsOpen(false);
      setAmountPaid("");
      setNotes("");

      // ✅ Update product variants in Zustand
      if (Array.isArray(data?.updatedVariants)) {
        const updatedProducts = products.map((product) => {
          const updatedVariant = data.updatedVariants.find(
            (variant) =>
              variant.product?.toString?.() === product._id ||
              variant.product === product._id
          );

          if (!updatedVariant) return product;

          return {
            ...product,
            variants: product.variants.map((v) =>
              v._id === updatedVariant._id ? updatedVariant : v
            ),
          };
        });

        setProducts({
          products: updatedProducts,
          total: updatedProducts.length,
          page: 1,
          pages: 1,
        });
      }

      clearCart();

      quickToast({
        title: isRestricted ? "Sale processed!" : "Reservation submitted!",
        icon: "success",
      });
    } catch (error) {
      quickToast({
        title: "Checkout failed",
        text: error.response?.data?.message || error.message,
        icon: "error",
      });
    }
  };

  return (
    <>
      {/* Cart Button */}
      <div className="relative">
        <button
          className="relative group cursor-pointer btn btn-ghost hover:bg-gray-400 transition-all duration-300 ease-in-out transform hover:scale-105 p-0 m-0"
          onClick={() => setIsOpen(true)}
          title="View Cart"
        >
          <div className="relative">
            <ShoppingCart className="h-7 w-7 text-white" />
            {cartCount > 0 && (
              <div className="absolute -top-3 -right-3 bg-[#F05454] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-bounce">
                {cartCount > 99 ? "99+" : cartCount}
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Mobile: Centered Modal | Desktop: Right Side Slide-In Panel */}
      {isMobile ? (
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          className="bg-white rounded-2xl max-w-3xl w-full p-0 max-h-[90vh] flex flex-col font-mono"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 flex-shrink-0 border-b border-blue-800/30 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Shopping Cart</h2>
                  <p className="text-blue-100 text-sm font-medium">
                    {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <button
                    className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200"
                    onClick={clearCart}
                    title="Clear cart"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Cart Body - Scrollable */}
          <div className="flex-1 overflow-y-auto bg-gray-50 min-h-0">
            <div className="p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                    <PackageX className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 text-center">
                    Add some items to get started!
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0 pr-3">
                          <h3 className="font-bold text-lg text-gray-900 mb-1.5 line-clamp-2">
                            {item.name}
                          </h3>
                          {item.size && (
                            <p className="text-sm text-gray-600 font-medium">
                              ₱{item.price.toFixed(2)} / {item.size} {item.unit}
                            </p>
                          )}
                        </div>
                        <button
                          className="flex-shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-1.5 transition-all duration-200"
                          onClick={() =>
                            removeItem(item.productId, item.variantId)
                          }
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => {
                                const newQty = item.quantity - 1;
                                updateQuantity(
                                  item.productId,
                                  item.variantId,
                                  newQty
                                );
                                setMaxStockMessages(prev => {
                                  const updated = { ...prev };
                                  delete updated[`${item.productId}-${item.variantId}`];
                                  return updated;
                                });
                              }}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4 text-gray-700" />
                            </button>

                            <input
                              type="number"
                              className="w-12 text-center font-bold text-gray-900 bg-transparent border-none focus:outline-none"
                              value={item.quantity}
                              min={1}
                              max={item.quantityAvailable ?? Infinity}
                              onChange={(e) => {
                                let value = parseInt(e.target.value, 10) || 1;
                                const maxAvailable = item.quantityAvailable ?? Infinity;
                                
                                if (value > maxAvailable) {
                                  value = maxAvailable;
                                  setMaxStockMessages(prev => ({
                                    ...prev,
                                    [`${item.productId}-${item.variantId}`]: `Maximum available stock: ${maxAvailable}`
                                  }));
                                } else {
                                  setMaxStockMessages(prev => {
                                    const updated = { ...prev };
                                    delete updated[`${item.productId}-${item.variantId}`];
                                    return updated;
                                  });
                                }
                                if (value < 1) value = 1;
                                updateQuantity(
                                  item.productId,
                                  item.variantId,
                                  value
                                );
                              }}
                            />

                            <button
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => {
                                const maxAvailable = item.quantityAvailable ?? Infinity;
                                const newQty = item.quantity + 1;
                                
                                if (newQty > maxAvailable) {
                                  setMaxStockMessages(prev => ({
                                    ...prev,
                                    [`${item.productId}-${item.variantId}`]: `Maximum available stock: ${maxAvailable}`
                                  }));
                                  updateQuantity(
                                    item.productId,
                                    item.variantId,
                                    maxAvailable
                                  );
                                } else {
                                  updateQuantity(
                                    item.productId,
                                    item.variantId,
                                    newQty
                                  );
                                  setMaxStockMessages(prev => {
                                    const updated = { ...prev };
                                    delete updated[`${item.productId}-${item.variantId}`];
                                    return updated;
                                  });
                                }
                              }}
                              disabled={item.quantity >= (item.quantityAvailable ?? Infinity)}
                            >
                              <Plus className="w-4 h-4 text-gray-700" />
                            </button>
                          </div>
                          {maxStockMessages[`${item.productId}-${item.variantId}`] && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-amber-800">
                                {maxStockMessages[`${item.productId}-${item.variantId}`]}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            ₱{item.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Notes Section - Only for non-restricted users */}
            {cartItems.length > 0 && !isRestricted && (
              <div className="px-5 pb-4 border-t border-gray-200 pt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-gray-600" />
                  Special Notes
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm text-black placeholder-gray-400"
                  placeholder="Any special requests? (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          {cartItems.length > 0 && (
            <div className="flex-shrink-0 bg-white border-t border-gray-200 p-5 space-y-4 rounded-b-2xl">
              {/* Amount Paid Input and Total Amount - Horizontally Aligned */}
              <div className="flex gap-3">
                {/* Amount Paid Input - For restricted users */}
                {isRestricted && (
                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                      <Banknote className="w-4 h-4 text-blue-600" />
                      Amount Paid
                    </label>
                    <input
                      type="number"
                      className="w-full h-11 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-medium"
                      placeholder="Enter amount paid"
                      value={amountPaid}
                      min={0}
                      step="0.01"
                      onChange={(e) => setAmountPaid(e.target.value)}
                    />
                  </div>
                )}

                {/* Total Amount */}
                <div className={`${isRestricted ? "flex-1" : "w-full"} flex flex-col`}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Amount
                  </label>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-11 p-2.5 rounded-lg border border-blue-200 flex items-center">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-sm font-bold text-gray-700">
                        Total:
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        ₱{totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Display - For restricted users */}
              {isRestricted && (
                <>
                  {amountPaid && parseFloat(amountPaid) >= totalPrice && (
                    <div className="bg-green-50 border border-green-200 p-2.5 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-green-700">
                          Change:
                        </span>
                        <span className="text-base font-bold text-green-600">
                          ₱{(parseFloat(amountPaid) - totalPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Insufficient Payment Warning */}
                  {amountPaid && parseFloat(amountPaid) < totalPrice && (
                    <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-red-700">
                          Insufficient:
                        </span>
                        <span className="text-base font-bold text-red-600">
                          ₱{(totalPrice - parseFloat(amountPaid)).toFixed(2)} short
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Continue Shopping
                </button>
                <button
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCheckout}
                  disabled={
                    loading ||
                    (isRestricted &&
                      (!amountPaid || parseFloat(amountPaid) < totalPrice))
                  }
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>{isRestricted ? "Process Sale" : "Reserve Items"}</>
                  )}
                </button>
              </div>
            </div>
          )}
        </Modal>
      ) : (
        <>
          {/* Desktop: Right Side Slide-In Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Cart Panel */}
          <div
            className={`fixed top-0 right-0 h-full w-full sm:w-[420px] lg:w-[480px] bg-white shadow-2xl z-[9999] flex flex-col transform transition-transform duration-300 ease-out font-mono ${
              isOpen ? "translate-x-0" : "translate-x-full"
            }`}
            style={{ margin: 0, padding: 0 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 flex-shrink-0 border-b border-blue-800/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Shopping Cart</h2>
                    <p className="text-blue-100 text-sm font-medium">
                      {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {cartItems.length > 0 && (
                    <button
                      className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200"
                      onClick={clearCart}
                      title="Clear cart"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  )}
                  <button
                    className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Cart Body - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <div className="p-5 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                      <PackageX className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-500 text-center">
                      Add some items to get started!
                    </p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0 pr-3">
                            <h3 className="font-bold text-lg text-gray-900 mb-1.5 line-clamp-2">
                              {item.name}
                            </h3>
                            {item.size && (
                              <p className="text-sm text-gray-600 font-medium">
                                ₱{item.price.toFixed(2)} / {item.size} {item.unit}
                              </p>
                            )}
                          </div>
                          <button
                            className="flex-shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-1.5 transition-all duration-200"
                            onClick={() =>
                              removeItem(item.productId, item.variantId)
                            }
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                              <button
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => {
                                  const newQty = item.quantity - 1;
                                  updateQuantity(
                                    item.productId,
                                    item.variantId,
                                    newQty
                                  );
                                  setMaxStockMessages(prev => {
                                    const updated = { ...prev };
                                    delete updated[`${item.productId}-${item.variantId}`];
                                    return updated;
                                  });
                                }}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4 text-gray-700" />
                              </button>

                              <input
                                type="number"
                                className="w-12 text-center font-bold text-gray-900 bg-transparent border-none focus:outline-none"
                                value={item.quantity}
                                min={1}
                                max={item.quantityAvailable ?? Infinity}
                                onChange={(e) => {
                                  let value = parseInt(e.target.value, 10) || 1;
                                  const maxAvailable = item.quantityAvailable ?? Infinity;
                                  
                                  if (value > maxAvailable) {
                                    value = maxAvailable;
                                    setMaxStockMessages(prev => ({
                                      ...prev,
                                      [`${item.productId}-${item.variantId}`]: `Maximum available stock: ${maxAvailable}`
                                    }));
                                  } else {
                                    setMaxStockMessages(prev => {
                                      const updated = { ...prev };
                                      delete updated[`${item.productId}-${item.variantId}`];
                                      return updated;
                                    });
                                  }
                                  if (value < 1) value = 1;
                                  updateQuantity(
                                    item.productId,
                                    item.variantId,
                                    value
                                  );
                                }}
                              />

                              <button
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => {
                                  const maxAvailable = item.quantityAvailable ?? Infinity;
                                  const newQty = item.quantity + 1;
                                  
                                  if (newQty > maxAvailable) {
                                    setMaxStockMessages(prev => ({
                                      ...prev,
                                      [`${item.productId}-${item.variantId}`]: `Maximum available stock: ${maxAvailable}`
                                    }));
                                    updateQuantity(
                                      item.productId,
                                      item.variantId,
                                      maxAvailable
                                    );
                                  } else {
                                    updateQuantity(
                                      item.productId,
                                      item.variantId,
                                      newQty
                                    );
                                    setMaxStockMessages(prev => {
                                      const updated = { ...prev };
                                      delete updated[`${item.productId}-${item.variantId}`];
                                      return updated;
                                    });
                                  }
                                }}
                                disabled={item.quantity >= (item.quantityAvailable ?? Infinity)}
                              >
                                <Plus className="w-4 h-4 text-gray-700" />
                              </button>
                            </div>
                            {maxStockMessages[`${item.productId}-${item.variantId}`] && (
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800">
                                  {maxStockMessages[`${item.productId}-${item.variantId}`]}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">
                              ₱{item.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Notes Section - Only for non-restricted users */}
              {cartItems.length > 0 && !isRestricted && (
                    <div className="px-5 pb-4 border-t border-gray-200 pt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-gray-600" />
                    Special Notes
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm text-black placeholder-gray-400"
                    placeholder="Any special requests? (Optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            {cartItems.length > 0 && (
              <div className="flex-shrink-0 bg-white border-t border-gray-200 p-5 space-y-4">
                {/* Amount Paid Input and Total Amount - Horizontally Aligned */}
                <div className="flex gap-3">
                  {/* Amount Paid Input - For restricted users */}
                  {isRestricted && (
                    <div className="flex-1 flex flex-col">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Banknote className="w-4 h-4 text-blue-600" />
                        Amount Paid
                      </label>
                      <input
                        type="number"
                        className="w-full h-11 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-medium"
                        placeholder="Enter amount paid"
                        value={amountPaid}
                        min={0}
                        step="0.01"
                        onChange={(e) => setAmountPaid(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Total Amount */}
                  <div className={`${isRestricted ? "flex-1" : "w-full"} flex flex-col`}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Total Amount
                    </label>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-11 p-2.5 rounded-lg border border-blue-200 flex items-center">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-sm font-bold text-gray-700">
                          Total:
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          ₱{totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Change Display - For restricted users */}
                {isRestricted && (
                  <>
                    {amountPaid && parseFloat(amountPaid) >= totalPrice && (
                      <div className="bg-green-50 border border-green-200 p-2.5 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-green-700">
                            Change:
                          </span>
                          <span className="text-base font-bold text-green-600">
                            ₱{(parseFloat(amountPaid) - totalPrice).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Insufficient Payment Warning */}
                    {amountPaid && parseFloat(amountPaid) < totalPrice && (
                      <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-red-700">
                            Insufficient:
                          </span>
                          <span className="text-base font-bold text-red-600">
                            ₱{(totalPrice - parseFloat(amountPaid)).toFixed(2)} short
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Continue Shopping
                  </button>
                  <button
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleCheckout}
                    disabled={
                      loading ||
                      (isRestricted &&
                        (!amountPaid || parseFloat(amountPaid) < totalPrice))
                    }
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>{isRestricted ? "Process Sale" : "Reserve Items"}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          </>
        )}
        </>
      )}
    </>
  );
}

export default CartContent;
