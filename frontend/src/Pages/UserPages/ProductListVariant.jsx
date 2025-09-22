import React, { useState } from "react";
import CreateCart from "./CreateCart";

function ProductListVariant({ product, user, isMobile }) {
  const [showVariants, setShowVariants] = useState(false);

  if (!product.variants?.length) {
    return null;
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
            <svg
              className={`w-4 h-4 transition-transform ${
                showVariants ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
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

      {/* Desktop: Hover overlay */}
      {!isMobile && (
        <div className="absolute inset-0 bg-base-100/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl overflow-hidden">
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
