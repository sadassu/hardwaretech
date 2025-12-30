import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "../../components/Modal";
import { useCart } from "../../hooks/useCart";
import { ShoppingCart, X, Plus, Minus, PlusCircle, AlertTriangle, Package } from "lucide-react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { formatPrice } from "../../utils/formatPrice";

function CreateCart({ product, variant, onOpen, onClose: onCloseCallback }) {
  const { user } = useAuthContext();
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [maxStockMessage, setMaxStockMessage] = useState("");
  const isOpeningRef = useRef(false);
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
    
    // Notify parent that CreateCart is closing
    if (onCloseCallback) {
      onCloseCallback();
    }
    
    // Navigate based on current page: stay on POS if already on POS, otherwise go to product list
    if (location.pathname !== "/pos") {
      navigate("/user/product-list");
    }
    // If on POS page, stay on the same page (no navigation needed)
  };

  return (
    <>
      <button
        type="button"
        className={`btn text-sm font-medium transition-all duration-200 ${
          outOfStock || isUserUnverified
            ? "btn-disabled bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-yellow-400 hover:bg-yellow-500 text-white shadow-md hover:shadow-lg border-0"
        }`}
        disabled={outOfStock || isUserUnverified}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation(); // Prevent event bubbling to parent elements
          e.nativeEvent.stopImmediatePropagation(); // Stop all event propagation
          if (!outOfStock && !isUserUnverified) {
            // Open CreateCart modal FIRST
            setIsOpen(true);
            // Notify parent that CreateCart is opening (this hides variant modal but keeps it mounted)
            if (onOpen) {
              // Small delay to ensure CreateCart modal is rendered first
              setTimeout(() => {
                onOpen(); // This sets isCreateCartOpening to true, hiding variant modal
              }, 100);
            }
          }
        }}
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

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          // Notify parent that CreateCart is closing
          if (onCloseCallback) {
            onCloseCallback();
          }
        }}
        className="bg-white rounded-2xl max-w-md w-full p-0 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-red-400 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Add to Cart</h3>
              <p className="text-red-100 text-sm">Select quantity to add to your cart</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {isUserUnverified ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">
                You must verify your account before adding items to your cart.
              </p>
            </div>
          ) : (
            <>
              {/* Product Info */}
              <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base text-gray-900 mb-1 truncate">
                      {product?.name || "Product"}
                    </h4>
                    {variant && (
                      <p className="text-sm text-gray-600">
                        {variant.size && `${variant.size} `}
                        {variant.unit && `${variant.unit}`}
                        {variant.color && ` • ${variant.color}`}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Price: <span className="font-semibold text-gray-900">{formatPrice(variant?.price ?? product?.price ?? 0)}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Quantity Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    className="btn btn-ghost btn-sm btn-circle border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    title="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 text-gray-700" />
                  </button>

                  <input
                    type="number"
                    min="1"
                    max={availableStock}
                    value={quantity}
                    className="input input-bordered flex-1 text-center font-semibold text-gray-900 bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    onChange={(e) => {
                      const value = Number(e.target.value) || 1;
                      handleQuantityChange(value);
                    }}
                  />

                  <button
                    className="btn btn-ghost btn-sm btn-circle border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= availableStock}
                    title="Increase quantity"
                  >
                    <Plus className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Available: <span className="font-semibold text-gray-700">{availableStock}</span>
                </p>
                {maxStockMessage && (
                  <div className="mt-3 bg-amber-50 border-2 border-amber-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 font-medium">{maxStockMessage}</p>
                  </div>
                )}
              </div>

              {/* Total Price */}
              <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Total Price:</span>
                  <span className="text-xl font-bold text-black">
                    {formatPrice((variant?.price ?? product?.price ?? 0) * quantity)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isUserUnverified && (
          <div className="border-t-2 border-gray-100 p-6 bg-gray-50 rounded-b-2xl flex-shrink-0">
            <button
              className="btn w-full bg-yellow-400 hover:bg-yellow-500 text-white border-0 shadow-lg flex items-center justify-center gap-2"
              onClick={handleAddToCart}
              disabled={isUserUnverified || quantity > availableStock || availableStock <= 0}
            >
              <PlusCircle className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}

export default CreateCart;
