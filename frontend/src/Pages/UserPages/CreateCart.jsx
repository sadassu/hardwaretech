import React, { useState } from "react";
import Modal from "../../components/Modal";
import { useCart } from "../../hooks/useCart";
import { ShoppingCart, X, Plus, Minus, PlusCircle } from "lucide-react";

function CreateCart({ product, variant }) {
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const outOfStock = (variant?.quantity ?? 0) <= 0;

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
            : "btn-primary hover:btn-primary-focus shadow-md hover:shadow-lg text-white"
        }`}
        disabled={outOfStock}
        onClick={() => setIsOpen(true)}
        title={outOfStock ? "Out of stock" : "Add to cart"}
      >
        <div className="flex items-center justify-center gap-2">
          {outOfStock ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <ShoppingCart className="w-6 h-6 text-white" />
          )}
        </div>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Add to Cart</h2>
          </div>

          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-white">
                  Quantity
                </span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  className="btn btn-outline btn-sm text-white border-white hover:border-white"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  className="input input-bordered flex-1 text-center font-medium text-white border-white bg-transparent"
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value)))
                  }
                />

                <button
                  className="btn btn-outline btn-sm text-white border-white hover:border-white"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="divider border-white"></div>

            <div className="flex justify-between items-center py-2">
              <span className="text-white/70">Total Price:</span>
              <span className="text-lg font-bold text-primary">
                ₱
                {((variant?.price ?? product?.price ?? 0) * quantity).toFixed(
                  2
                )}
              </span>
            </div>

            <button
              className="btn btn-primary w-full btn-lg shadow-md hover:shadow-lg transition-all duration-200 text-white"
              onClick={handleAddToCart}
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add to Cart
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default CreateCart;
