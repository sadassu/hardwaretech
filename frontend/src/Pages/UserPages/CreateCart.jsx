import React, { useState } from "react";
import Modal from "../../components/Modal";
import { useCart } from "../../hooks/useCart";

function CreateCart({ product, variant }) {
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const outOfStock = (variant?.quantity ?? 0) <= 0;

  // In your CreateCart component's handleAddToCart function:
  const handleAddToCart = () => {
    addToCart({
      productId: product._id,
      variantId: variant?._id || null,
      name: product.name,
      size: variant?.size,
      unit: variant?.unit || "pcs",
      price: variant?.price ?? product.price,
      quantity: Number(quantity),
      total: Number(quantity) * (variant?.price ?? product.price),
    });

    setIsOpen(false);
  };

  return (
    <>
      <button
        className={`btn text-sm font-medium transition-all duration-200 ${
          outOfStock
            ? "btn-disabled bg-gray-100 text-gray-400 cursor-not-allowed"
            : "btn-primary hover:btn-primary-focus shadow-md hover:shadow-lg"
        }`}
        disabled={outOfStock}
        onClick={() => setIsOpen(true)}
        title={outOfStock ? "Out of stock" : "Add to cart"}
      >
        <div className="flex items-center justify-center gap-2">
          {outOfStock ? (
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
                  d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </>
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
            </>
          )}
        </div>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-base-content">Add to Cart</h2>
          </div>

          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Quantity</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
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
                      d="M20 12H4"
                    />
                  </svg>
                </button>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  className="input input-bordered flex-1 text-center font-medium"
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value)))
                  }
                />

                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setQuantity(quantity + 1)}
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="divider"></div>

            <div className="flex justify-between items-center py-2">
              <span className="text-base-content/70">Total Price:</span>
              <span className="text-lg font-bold text-primary">
                ₱
                {((variant?.price ?? product?.price ?? 0) * quantity).toFixed(
                  2
                )}
              </span>
            </div>

            <button
              className="btn btn-primary w-full btn-lg shadow-md hover:shadow-lg transition-all duration-200"
              onClick={handleAddToCart}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add to Cart
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default CreateCart;
