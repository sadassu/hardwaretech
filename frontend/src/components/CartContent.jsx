import React, { useState } from "react";
import Modal from "./Modal";
import { useCart } from "../hooks/useCart";
import { useCheckout } from "../hooks/useCheckout";
import { useAuthContext } from "../hooks/useAuthContext";
import { useProductsContext } from "../hooks/useProductContext";

import StatusToast from "./StatusToast";

function CartContent() {
  const { checkout, loading, adminCheckout } = useCheckout();
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const { user } = useAuthContext();
  const { dispatch } = useProductsContext();
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

  const handleCheckout = async () => {
    try {
      let data;

      if (isRestricted) {
        // adminCheckout returns parsed data (not axios response)
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

      // use backend-updated variants (backend is source of truth)
      if (Array.isArray(data?.updatedVariants)) {
        data.updatedVariants.forEach((variant) => {
          dispatch({
            type: "UPDATE_VARIANT",
            payload: {
              productId:
                // some variants store `product` as ObjectId — normalize to string
                variant.product && variant.product.toString
                  ? variant.product.toString()
                  : variant.product,
              variant,
            },
          });
        });
      } else {
        console.warn("No updatedVariants returned from backend:", data);
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
        message: `Failed to reserved ${error}`,
      });
    }
  };

  // roles check
  const restrictedRoles = ["admin", "cashier", "manager"];
  const isRestricted = user?.roles?.some((role) =>
    restrictedRoles.includes(role)
  );

  return (
    <>
      <StatusToast
        show={toast.show}
        color={toast.color}
        header={toast.header}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Enhanced Cart Button */}
      <div className="relative">
        <button
          className="relative group cursor-pointer btn btn-ghost hover:btn-primary transition-all duration-300 ease-in-out transform hover:scale-105"
          onClick={() => setIsOpen(true)}
          title="View Cart"
        >
          {/* Cart Icon with gradient effect */}
          <div className="relative">
            <img src="/icons/cart.svg" alt="cart" className="h-7 w-7" />
            {cartCount > 0 && (
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-bounce">
                {cartCount > 99 ? "99+" : cartCount}
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Enhanced Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="w-full max-w-2xl"
      >
        <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-2xl shadow-2xl">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-primary-content p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
                    />
                  </svg>
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
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Enhanced Cart Items */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary scrollbar-track-base-300">
              {cartItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-primary/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-base-content mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-base-content/60">
                    Add some delicious items to get started!
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/30 overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-base-content truncate group-hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                          {item.size && (
                            <div className="inline-flex items-center gap-1 mt-1">
                              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                                <span className="text-lg">₱</span>
                                {item.price.toFixed(2)} / 1 {item.unit}
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          className="btn btn-ghost btn-sm text-error/60 hover:text-error hover:bg-error/10 rounded-full w-8 h-8 p-0"
                          onClick={() =>
                            removeItem(item.productId, item.variantId)
                          }
                          title="Remove item"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Enhanced quantity controls */}
                        <div className="flex items-center gap-3 bg-base-200 rounded-full p-1">
                          <button
                            className="btn btn-ghost btn-sm rounded-full w-8 h-8 p-0 hover:bg-primary hover:text-primary-content"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>

                          <input
                            type="number"
                            className="input input-ghost input-sm w-16 text-center font-semibold bg-transparent border-none focus:bg-white rounded-lg"
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
                            className="btn btn-ghost btn-sm rounded-full w-8 h-8 p-0 hover:bg-primary hover:text-primary-content"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity + 1
                              )
                            }
                            disabled={item.quantity >= item.quantityAvailable}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent">
                            ₱{item.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Enhanced Footer */}
            {cartItems.length > 0 && (
              <>
                <div className="divider my-6"></div>

                {/* Enhanced Notes OR Amount Paid */}
                {!isRestricted ? (
                  <div className="form-control mb-6">
                    <label className="label">
                      <span className="label-text font-semibold text-base-content flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Special Notes
                      </span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered textarea-lg w-full bg-white focus:border-primary focus:outline-primary rounded-xl"
                      placeholder="Any special requests or delivery instructions? (Optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                ) : (
                  <div className="form-control mb-6">
                    <label className="label">
                      <span className="label-text font-semibold text-base-content flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-success"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Amount Paid
                      </span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered input-lg w-full bg-white focus:border-primary focus:outline-primary rounded-xl"
                      placeholder="Enter amount paid by customer"
                      value={amountPaid}
                      min={0}
                      step="0.01"
                      onChange={(e) => setAmountPaid(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-6">
                  {/* Enhanced Total Display */}
                  <div className="bg-gradient-to-r from-success/10 to-green-500/10 p-6 rounded-2xl border border-success/20">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-semibold text-base-content">
                        Total Amount:
                      </span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent">
                        ₱{totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      className="btn btn-outline btn-lg flex-1 rounded-xl hover:scale-105 transition-all duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16l-4-4m0 0l4-4m-4 4h18"
                        />
                      </svg>
                      Continue Shopping
                    </button>
                    <button
                      className="btn btn-primary btn-lg flex-1 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl hover:scale-105 bg-gradient-to-r from-primary to-secondary border-none"
                      onClick={handleCheckout}
                      disabled={loading || (isRestricted && !amountPaid)}
                    >
                      {loading ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
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
