import React, { useState, useEffect } from "react";
import { ChevronDown, AlertTriangle, X, ShoppingCart, Package } from "lucide-react";
import CreateCart from "../Pages/UserPages/CreateCart";

function ProductListVariant({ product, user, isMobile }) {
  const [showVariants, setShowVariants] = useState(false);

  // Handle escape key to close modal
  useEffect(() => {
    if (showVariants && isMobile) {
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          setShowVariants(false);
        }
      };
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
      };
    }
  }, [showVariants, isMobile]);

  const colorMap = {
    red: "bg-red-500 border-red-500 text-white",
    blue: "bg-blue-500 border-blue-500 text-white",
    green: "bg-green-500 border-green-500 text-white",
    yellow: "bg-yellow-500 border-yellow-500 text-black",
    black: "bg-black border-black text-white",
    white: "bg-white border-gray-200 text-black",
    gray: "bg-gray-500 border-gray-500 text-white",
  };

  // Check if no variants or all variants have zero or no quantity
  const hasNoVariants = !product.variants?.length;
  const allOutOfStock = product.variants?.every(
    (variant) => !variant.quantity || variant.quantity === 0
  );

  // If no variants or all out of stock, show message
  if (hasNoVariants || allOutOfStock) {
    return (
      <div className="mt-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700 text-sm font-semibold">Out of Stock</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Show variants button */}
      {isMobile && (
        <div className="mt-auto">
          <button
            onClick={() => setShowVariants(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            View Options
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Modal Popup */}
          {showVariants && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowVariants(false)}
              ></div>
              
              {/* Modal Content */}
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col z-10">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white line-clamp-1">
                          {product.name}
                        </h2>
                        <p className="text-xs text-blue-100">
                          {product.variants.length} options available
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowVariants(false)}
                      className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Scrollable variants list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {product.variants.map((variant, idx) => (
                <div
                  key={variant._id || `${product._id}-variant-${idx}`}
                      className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-2 mb-3">
                          {variant.size && (
                              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                              {variant.size} {variant.unit}
                              </span>
                          )}
                          {variant.color && (
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${
                                colorMap[variant.color.toLowerCase()] || "bg-gray-200 text-gray-700"
                              }`}>
                              {variant.color}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            {variant.price && (
                              <div className="text-xl font-bold text-blue-600">
                                ₱{variant.price.toLocaleString()}
                            </div>
                          )}
                          {variant.quantity && (
                              <span className="text-xs font-medium text-gray-500">
                                Stock: {variant.quantity}
                              </span>
                          )}
                          </div>
                      </div>
                        
                        <div className="flex-shrink-0">
                        {user && (
                          <CreateCart product={product} variant={variant} />
                        )}
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desktop: Hover overlay - positioned to fill the entire card */}
      {!isMobile && (
        <div className="absolute inset-0 bg-white/98 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl overflow-hidden z-10 shadow-2xl">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base lg:text-lg font-bold text-white line-clamp-1">
                {product.name}
              </h2>
                  <p className="text-xs text-blue-100">
                    {product.variants.length} options available
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable variants list */}
            <div className="flex-1 overflow-y-auto p-3 lg:p-4">
              <div className="space-y-2 lg:space-y-3">
              {product.variants.map((variant, idx) => (
                <div
                  key={variant._id || `${product._id}-variant-${idx}`}
                    className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-3 hover:border-blue-300 hover:shadow-md transition-all group/variant"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {variant.size && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                              {variant.size} {variant.unit}
                            </span>
                          )}
                          {variant.color && (
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${
                              colorMap[variant.color.toLowerCase()] || "bg-gray-200 text-gray-700"
                            }`}>
                              {variant.color}
                            </span>
                          )}
                        </div>
                        
                        {/* Price and Stock */}
                        <div className="flex flex-col gap-1">
                          {variant.price && (
                            <div className="text-base lg:text-lg font-bold text-blue-600">
                              ₱{variant.price.toLocaleString()}
                            </div>
                          )}
                          {variant.quantity && (
                            <span className="text-xs font-medium text-gray-500">
                              Stock: {variant.quantity}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Add to Cart Button */}
                      <div className="flex-shrink-0">
                        {user && (
                          <CreateCart product={product} variant={variant} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductListVariant;
