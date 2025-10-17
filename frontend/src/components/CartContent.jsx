import React, { useState } from "react";
import Modal from "./Modal";
import { useCart } from "../hooks/useCart";
import { useCheckout } from "../hooks/useCheckout";
import { useAuthContext } from "../hooks/useAuthContext";
import StatusToast from "./StatusToast";

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
  ClipboardList,
} from "lucide-react";
import { useProductStore } from "../store/productStore";

function CartContent() {
  const { checkout, loading, adminCheckout } = useCheckout();
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const { user } = useAuthContext();

  // ✅ Zustand store functions
  const { products, setProducts } = useProductStore();

  const [toast, setToast] = useState({
    show: false,
    color: "",
    header: "",
    message: "",
  });

  const {
    cartItems,
    cartCount,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const restrictedRoles = ["admin", "cashier"];
  const isRestricted = user?.roles?.some((role) =>
    restrictedRoles.includes(role)
  );

  const handleCheckout = async () => {
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

      setIsOpen(false);

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

      setToast({
        show: true,
        color: "success-toast",
        header: "Success 🎉",
        message: isRestricted
          ? "Checkout successful!"
          : "Added to reservation successful!",
      });
    } catch (error) {
      setToast({
        show: true,
        color: "error-toast",
        header: "Failed 🥲",
        message: `Failed to reserve ${error.message || error}`,
      });
    }
  };

  return (
    <>
      <StatusToast
        show={toast.show}
        color={toast.color}
        header={toast.header}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Cart Button */}
      <div className="relative">
        <button
          className="relative group cursor-pointer btn btn-ghost hover:bg-gray-400 transition-all duration-300 ease-in-out transform hover:scale-105"
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

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="w-full max-w-2xl"
      >
        <div className="bg-[#222831] rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="bg-[#30475E] text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Shopping Cart</h2>
                  <p className="text-white/80 text-sm">
                    {cartItems.length}{" "}
                    {cartItems.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              {cartItems.length > 0 && (
                <button
                  className="btn btn-ghost btn-sm text-white/80 hover:text-white hover:bg-white/20 border-white/30"
                  onClick={clearCart}
                  title="Clear cart"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Cart Body */}
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#30475E] scrollbar-track-[#222831]">
              {cartItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 mx-auto bg-[#30475E]/20 rounded-full flex items-center justify-center">
                      <PackageX className="w-12 h-12 text-[#30475E]/60" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-[#DDDDDD] mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-[#DDDDDD]/60">
                    Add some delicious items to get started!
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-[#30475E]/30 hover:border-[#30475E] overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-[#222831] truncate group-hover:text-[#30475E] transition-colors">
                            {item.name}
                          </h3>
                          {item.size && (
                            <div className="inline-flex items-center gap-1 mt-1">
                              <span className="text-xs font-medium text-[#30475E] bg-[#30475E]/10 px-2 py-1 rounded-full">
                                ₱{item.price.toFixed(2)} / 1 {item.unit}
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          className="btn btn-ghost btn-sm text-[#F05454]/60 hover:text-[#F05454] hover:bg-[#F05454]/10 rounded-full w-8 h-8 p-0"
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
                        <div className="flex items-center gap-3 bg-[#222831]/10 rounded-full p-1">
                          <button
                            className="btn btn-ghost btn-sm rounded-full w-8 h-8 p-0 hover:bg-[#30475E] hover:text-white"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <input
                            type="number"
                            className="input input-ghost input-sm w-16 text-center font-semibold bg-transparent border-none focus:bg-white rounded-lg text-[#222831]"
                            value={item.quantity}
                            min={1}
                            max={item.quantityAvailable}
                            onChange={(e) => {
                              let value = parseInt(e.target.value, 10) || 1;
                              if (value > item.quantityAvailable)
                                value = item.quantityAvailable;
                              if (value < 1) value = 1;
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                value
                              );
                            }}
                          />

                          <button
                            className="btn btn-ghost btn-sm rounded-full w-8 h-8 p-0 hover:bg-[#30475E] hover:text-white"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity + 1
                              )
                            }
                            disabled={item.quantity >= item.quantityAvailable}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#F05454]">
                            ₱{item.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <>
                <div className="divider my-6"></div>

                {!isRestricted ? (
                  <div className="form-control mb-6">
                    <label className="label">
                      <span className="label-text font-semibold text-[#DDDDDD] flex items-center gap-2">
                        <StickyNote className="w-4 h-4" />
                        Special Notes
                      </span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered textarea-lg w-full bg-white text-[#222831] focus:border-[#30475E] focus:outline-[#30475E] rounded-xl"
                      placeholder="Any special requests or delivery instructions? (Optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                ) : (
                  <div className="form-control mb-6">
                    <label className="label">
                      <span className="label-text font-semibold text-[#DDDDDD] flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-[#F05454]" />
                        Amount Paid
                      </span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered input-lg w-full bg-white text-[#222831] focus:border-[#30475E] focus:outline-[#30475E] rounded-xl"
                      placeholder="Enter amount paid by customer"
                      value={amountPaid}
                      min={0}
                      step="0.01"
                      onChange={(e) => setAmountPaid(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-[#30475E]/40">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-semibold ">
                        Total Amount:
                      </span>
                      <span className="text-3xl font-bold text-[#F05454]">
                        ₱{totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      className="btn btn-outline btn-lg flex-1 rounded-xl hover:scale-105 transition-all duration-200 border-[#DDDDDD] text-[#DDDDDD] hover:bg-white hover:text-[#222831]"
                      onClick={() => setIsOpen(false)}
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Continue Shopping
                    </button>
                    <button
                      className="btn cursor-pointer btn-lg flex-1 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl hover:scale-105 bg-[#F05454] hover:bg-[#F05454]/90 text-white border-none"
                      onClick={handleCheckout}
                      disabled={loading || (isRestricted && !amountPaid)}
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
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

export default CartContent;
