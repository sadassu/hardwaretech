import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import { useCart } from "../../hooks/useCart";
import { ShoppingCart, X, Plus, Minus, PlusCircle, AlertTriangle } from "lucide-react";
import { useAuthContext } from "../../hooks/useAuthContext";

function CreateCart({ product, variant }) {
  const { user } = useAuthContext();
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [maxStockMessage, setMaxStockMessage] = useState("");
  const computedQuantity =
    variant?.availableQuantity ?? variant?.quantity ?? 0;
  const outOfStock = computedQuantity <= 0;
  
  // Calculate available stock (considering items already in cart)
  const getAvailableStock = () => {
    const variantStock = computedQuantity;
    if (!variant?._id) return variantStock;
    
    // Find existing quantity in cart for this variant
    const existingCartItem = cartItems.find(
      (item) => item.variantId === variant._id.toString()
    );
    const existingQuantity = existingCartItem?.quantity ?? 0;
    
    return Math.max(0, variantStock - existingQuantity);
  };
  
  const availableStock = getAvailableStock();

  // Determine if Add to Cart should be disabled
  const isUserUnverified =
    user &&
    Array.isArray(user.roles) &&
    user.roles.includes("user") &&
    !user.isVerified;

  // Update quantity and check stock limits
  useEffect(() => {
    if (quantity > availableStock) {
      setMaxStockMessage(`Maximum available stock: ${availableStock}`);
      setQuantity(availableStock);
    } else {
      setMaxStockMessage("");
    }
  }, [quantity, availableStock]);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity > availableStock) {
      setQuantity(availableStock);
      setMaxStockMessage(`Maximum available stock: ${availableStock}`);
    } else if (newQuantity < 1) {
      setQuantity(1);
      setMaxStockMessage("");
    } else {
      setQuantity(newQuantity);
      setMaxStockMessage("");
    }
  };

  const handleAddToCart = () => {
    if (isUserUnverified) return; // safety check
    if (quantity > availableStock) {
      setMaxStockMessage(`Cannot add more than ${availableStock} items. Maximum available stock reached.`);
      return;
    }
    
    // Use variant's actual quantity as quantityAvailable (not the calculated availableStock)
    // The cart will handle checking against existing items
    addToCart({
      productId: product._id,
      variantId: variant?._id || null,
      name: product.name,
      size: variant?.size,
      unit: variant?.unit || "pcs",
      price: variant?.price ?? product.price,
      quantity: Number(quantity),
      total: Number(quantity) * (variant?.price ?? product.price),
      quantityAvailable: computedQuantity,
    });

    setIsOpen(false);
    setQuantity(1);
    setMaxStockMessage("");
    
    // Navigate to product list after adding to cart
    navigate("/user/product-list");
  };

  return (
    <>
      <button
        className={`btn text-sm font-medium transition-all duration-200 ${
          outOfStock || isUserUnverified
            ? "btn-disabled bg-gray-100 text-gray-400 cursor-not-allowed"
            : "btn-primary hover:btn-primary-focus shadow-md hover:shadow-lg text-white"
        }`}
        disabled={outOfStock || isUserUnverified}
        onClick={() => setIsOpen(true)}
        title={
          outOfStock
            ? "Out of stock"
            : isUserUnverified
            ? "Please verify your account to add to cart"
            : "Add to cart"
        }
      >
        <div className="flex items-center justify-center gap-2">
          {outOfStock || isUserUnverified ? (
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

          {isUserUnverified ? (
            <div className="text-center py-6 text-red-400 font-medium">
              You must verify your account before adding items to your cart.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-white">
                    Quantity
                  </span>
                  <span className="label-text-alt text-white/70">
                    Available: {availableStock}
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    className="btn btn-outline btn-sm text-white border-white hover:border-white"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    type="number"
                    min="1"
                    max={availableStock}
                    value={quantity}
                    className="input input-bordered flex-1 text-center font-medium text-white border-white bg-transparent"
                    onChange={(e) => {
                      const value = Number(e.target.value) || 1;
                      handleQuantityChange(value);
                    }}
                  />

                  <button
                    className="btn btn-outline btn-sm text-white border-white hover:border-white"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= availableStock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {maxStockMessage && (
                  <div className="mt-2 bg-amber-500/20 border border-amber-500/40 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-200">{maxStockMessage}</p>
                  </div>
                )}
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
                disabled={isUserUnverified || quantity > availableStock || availableStock <= 0}
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

export default CreateCart;
