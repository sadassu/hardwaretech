import React, { useState } from "react";
import Modal from "./Modal";
import { useCart } from "../hooks/useCart";
import { useCheckout } from "../hooks/useCheckout";
import { useAuthContext } from "../hooks/useAuthContext";

function CartContent() {
  const { checkout, loading, adminCheckout } = useCheckout();
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const { user } = useAuthContext();

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
      if (isRestricted) {
        await adminCheckout({
          amountPaid,
          reservationDate: new Date(),
        });
      } else {
        await checkout({
          notes,
          reservationDate: new Date(),
        });
      }
      setIsOpen(false);
      alert("Checkout successful! 🎉");
    } catch (error) {
      alert("Checkout failed, please try again.", error);
    }
  };

  // roles check
  const restrictedRoles = ["admin", "cashier", "manager"];
  const isRestricted = user?.roles?.some((role) =>
    restrictedRoles.includes(role)
  );

  return (
    <>
      {/* Cart Button */}
      <button
        className="relative cursor-pointer btn btn-ghost hover:btn-primary transition-all duration-200"
        onClick={() => setIsOpen(true)}
        title="View Cart"
      >
        {/* Cart Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
          />
        </svg>
        {cartCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-error text-error-content text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {cartCount > 99 ? "99+" : cartCount}
          </div>
        )}
      </button>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="w-full"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-base-content flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
                />
              </svg>
              Cart
            </h2>
            {cartItems.length > 0 && (
              <button
                className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-error-content"
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
              </button>
            )}
          </div>

          {/* Cart Items */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 mx-auto text-base-content/30 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <p className="text-base-content/60 text-lg font-medium mb-2">
                  Your cart is empty
                </p>
                <p className="text-base-content/40 text-sm">
                  Add some items to get started!
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="card bg-base-100 shadow-sm border border-base-300"
                >
                  {/* item card */}
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base-content truncate">
                          {item.name}
                        </h3>
                        {item.size && (
                          <p className="text-sm text-base-content/60">
                            Size: {item.size}
                          </p>
                        )}
                        <p className="text-sm text-primary font-medium">
                          ₱{item.price.toFixed(2)} / {item.unit}
                        </p>
                      </div>
                      <button
                        className="btn btn-ghost btn-xs text-error hover:bg-error hover:text-error-content"
                        onClick={() =>
                          removeItem(item.productId, item.variantId)
                        }
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* quantity controls */}
                      <div className="flex items-center gap-2">
                        <button
                          className="btn btn-outline btn-xs"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>

                        <input
                          type="number"
                          className="input input-bordered input-xs w-16 text-center"
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
                          className="btn btn-outline btn-xs"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity + 1
                            )
                          }
                          disabled={item.quantity >= item.quantityAvailable}
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-lg text-success">
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
              <div className="divider"></div>

              {/* Notes OR Amount Paid */}
              {!isRestricted ? (
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text font-medium">Notes</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Any special requests or delivery instructions?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              ) : (
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text font-medium">Amount Paid</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    placeholder="Enter amount paid"
                    value={amountPaid}
                    min={0}
                    onChange={(e) => setAmountPaid(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 bg-base-200 px-4 rounded-lg">
                  <span className="text-lg font-semibold text-base-content">
                    Total:
                  </span>
                  <span className="text-xl font-bold text-success">
                    ₱{totalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    className="btn btn-outline flex-1"
                    onClick={() => setIsOpen(false)}
                  >
                    Continue Shopping
                  </button>
                  <button
                    className="btn btn-primary flex-1 shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? (
                      "Processing..."
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="size-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                          />
                        </svg>
                        Reserve
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}

export default CartContent;
