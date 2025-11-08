import React, { useState } from "react";
import { ChevronDown, AlertTriangle } from "lucide-react";
import CreateCart from "../Pages/UserPages/CreateCart";

function ProductListVariant({ product, user, isMobile }) {
  const [showVariants, setShowVariants] = useState(false);

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
      <div className="mt-4">
        <div className="alert alert-warning">
          <AlertTriangle className="h-6 w-6" />
          <span className="text-red-500">No stock available</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Show variants button */}
      {isMobile && (
        <div className="mt-4">
          <button
            onClick={() => setShowVariants(!showVariants)}
            className="btn btn-outline btn-block"
          >
            {showVariants ? "Hide Options" : "View Options"}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showVariants ? "rotate-180" : ""
              }`}
            />
          </button>

          {showVariants && (
            <div className="mt-3 max-h-48 overflow-y-auto space-y-2">
              {product.variants.map((variant, idx) => (
                <div
                  key={variant._id || `${product._id}-variant-${idx}`}
                  className="card bg-base-200 shadow-sm border border-base-300"
                >
                  <div className="card-body p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-1 mb-1">
                          {variant.size && (
                            <div className="badge badge-outline badge-sm">
                              {variant.size} {variant.unit}
                            </div>
                          )}
                          {variant.color && (
                            <div className="badge badge-info badge-sm">
                              {variant.color}
                            </div>
                          )}
                          {variant.quantity && (
                            <div className="badge badge-ghost badge-sm">
                              Qty: {variant.quantity}
                            </div>
                          )}
                        </div>
                        {variant.price && (
                          <div className="text-sm font-semibold text-primary">
                            ₱{variant.price}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        {user && (
                          <CreateCart product={product} variant={variant} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Desktop: Hover overlay - positioned to fill the entire card */}
      {!isMobile && (
        <div className="absolute inset-0 bg-base-100/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl overflow-hidden z-10">
          <div className="p-6 h-full flex flex-col">
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-base-content mb-2">
                {product.name}
              </h2>
              <h3 className="font-semibold text-base text-base-content border-b pb-2">
                Available Options:
              </h3>
            </div>

            {/* Scrollable variants list */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {product.variants.map((variant, idx) => (
                <div
                  key={variant._id || `${product._id}-variant-${idx}`}
                  className="card bg-base-200 shadow-md hover:shadow-lg transition-all duration-200 border border-base-300 hover:border-primary/30"
                >
                  <div className="card-body p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {variant.size && (
                            <div className="badge badge-outline text-xs">
                              {variant.size} {variant.unit}
                            </div>
                          )}
                          {variant.color && (
                            <div
                              className={`capitalize p-1 rounded px-2 text-xs ${
                                colorMap[variant.color.toLowerCase()] ||
                                "bg-gray-200 border-gray-200 text-black"
                              }`}
                            >
                              {variant.color}
                            </div>
                          )}
                          {variant.quantity && (
                            <div className="badge badge-ghost text-xs">
                              Qty: {variant.quantity}
                            </div>
                          )}
                        </div>
                        {variant.price && (
                          <div className="text-lg font-semibold text-primary">
                            ₱{variant.price}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        {user && (
                          <CreateCart product={product} variant={variant} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductListVariant;
