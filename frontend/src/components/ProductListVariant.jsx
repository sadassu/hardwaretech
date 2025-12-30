import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { ChevronDown, AlertTriangle, X, ShoppingCart, Package } from "lucide-react";
import CreateCart from "../Pages/UserPages/CreateCart";
import { formatVariantLabel } from "../utils/formatVariantLabel.js";

function ProductListVariant({ product, user, isMobile, showAutoConvertInfo = false }) {
  const [showVariants, setShowVariants] = useState(false);
  const [isCreateCartOpening, setIsCreateCartOpening] = useState(false);
  const variantMap = new Map(
    (product?.variants || []).map((variant) => [variant._id, variant])
  );

  const getVariantLabel = (variant) =>
    formatVariantLabel(variant) || variant.unit || variant.size || "";

  const getAvailableQuantity = (variant) => {
    if (!variant) return 0;
    if (variant.availableQuantity !== undefined) {
      return Number(variant.availableQuantity) || 0;
    }

    const baseQuantity = Number(variant.quantity) || 0;
    if (variant.autoConvert && variant.conversionSource) {
      const source = variantMap.get(variant.conversionSource);
      if (source) {
        const sourceQty = Number(source.quantity) || 0;
        const multiplier = Number(variant.conversionQuantity) || 1;
        return baseQuantity + sourceQty * multiplier;
      }
    }
    return baseQuantity;
  };

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

  // Check if no variants
  const hasNoVariants = !product.variants?.length;

  // If no variants at all, show message
  if (hasNoVariants) {
    return (
      <div className="mt-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700 text-sm font-semibold">No variants available</span>
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
            className="w-full bg-red-400 hover:bg-red-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            View Options
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Modal Popup */}
          {showVariants &&
            ReactDOM.createPortal(
              <div 
                className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity ${
                  isCreateCartOpening ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
                style={{ 
                  visibility: isCreateCartOpening ? 'hidden' : 'visible',
                  pointerEvents: isCreateCartOpening ? 'none' : 'auto'
                }}
              >
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => {
                    if (!isCreateCartOpening) {
                      setShowVariants(false);
                      setIsCreateCartOpening(false);
                    }
                  }}
                ></div>
                
                {/* Modal Content */}
                <div 
                  className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col z-10 overflow-hidden"
                  onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
                >
                {/* Header */}
                <div className="bg-red-400 p-5 rounded-t-2xl flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white line-clamp-1">
                          {product.name}
                        </h2>
                        <p className="text-xs text-red-100">
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
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                  {product.variants && Array.isArray(product.variants) && product.variants.length > 0 ? (
                    product.variants.map((variant, idx) => {
                      if (!variant) return null;
                      return (
                      <div
                        key={variant._id || `${product._id}-variant-${idx}`}
                        className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all"
                        onClick={(e) => e.stopPropagation()} // Prevent card click from closing modal
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              {variant.price && (
                                <div className="text-xl font-bold text-gray-900">
                                  ₱{variant.price.toLocaleString()}
                                </div>
                              )}
                              {variant.color && (
                                <span
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border border-gray-300"
                                  style={{ color: variant.color }}
                                >
                                  <span
                                    className="inline-block w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: variant.color }}
                                  ></span>
                                  {variant.color}
                                </span>
                              )}
                            </div>
                            
                            <span className="text-xs font-medium text-gray-500 block mb-2">
                              Stock: {getAvailableQuantity(variant)}
                            </span>
                            {showAutoConvertInfo && variant.autoConvert && variant.conversionSource && (() => {
                              const sourceVariant = variantMap.get(
                                variant.conversionSource
                              );
                              if (!sourceVariant) return null;
                              const sourceLabel =
                                getVariantLabel(sourceVariant) || "source";
                              return (
                                <p className="text-[11px] text-red-500">
                                  Auto converts from {sourceLabel} •{" "}
                                  {variant.conversionQuantity || 1} {variant.unit} each
                                </p>
                              );
                            })()}
                            
                            {getVariantLabel(variant) && (
                              <span className="px-2.5 py-1 bg-gray-100 text-gray-900 rounded-lg text-xs font-semibold inline-block whitespace-nowrap">
                                {getVariantLabel(variant)}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex-shrink-0">
                            {user && (
                              <CreateCart 
                                product={product} 
                                variant={variant}
                                onOpen={() => {
                                  // Mark that CreateCart is opening to prevent variant modal from interfering
                                  setIsCreateCartOpening(true);
                                  // DON'T close variant modal - just hide it
                                  // This keeps CreateCart component mounted so its modal stays open
                                  // The variant modal will be hidden but still mounted
                                }}
                                onClose={() => {
                                  // Reset variant modal state when CreateCart closes
                                  setIsCreateCartOpening(false);
                                  setShowVariants(false);
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No variants available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      )}

      {/* Desktop: Hover overlay - positioned to fill the entire card */}
      {!isMobile && (
        <div className="absolute inset-0 bg-white/98 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl overflow-hidden z-10 shadow-2xl">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-red-400 p-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base lg:text-lg font-bold text-white line-clamp-1">
                    {product.name}
                  </h2>
                  <p className="text-xs text-red-100">
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
                  className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-3 hover:border-red-300 hover:shadow-md transition-all group/variant"
                >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {/* Price and Color */}
                        <div className="flex items-center justify-between mb-1">
                          {variant.price && (
                            <div className="text-base lg:text-lg font-bold text-gray-900">
                              ₱{variant.price.toLocaleString()}
                            </div>
                          )}
                          {variant.color && (
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold capitalize border border-gray-300"
                              style={{ color: variant.color }}
                            >
                              <span
                                className="inline-block w-3 h-3 rounded-full border border-gray-300"
                                style={{ backgroundColor: variant.color }}
                              ></span>
                              {variant.color}
                            </span>
                          )}
                        </div>
                        
                        {/* Stock */}
                        <span className="text-xs font-medium text-gray-500 block mb-1.5">
                          Stock: {getAvailableQuantity(variant)}
                        </span>
                        {showAutoConvertInfo && variant.autoConvert && variant.conversionSource && (() => {
                          const sourceVariant = variantMap.get(
                            variant.conversionSource
                          );
                          if (!sourceVariant) return null;
                          const sourceLabel =
                            getVariantLabel(sourceVariant) || "source";
                          return (
                            <p className="text-[11px] text-red-500">
                              Auto converts from {sourceLabel} •{" "}
                              {variant.conversionQuantity || 1} {variant.unit} each
                            </p>
                          );
                        })()}
                        
                        {/* Variant Size/Unit - Now below stock */}
                        {getVariantLabel(variant) && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-900 rounded-lg text-xs font-semibold inline-block whitespace-nowrap">
                            {getVariantLabel(variant)}
                          </span>
                        )}
                      </div>
                      
                      {/* Add to Cart Button */}
                      <div className="flex-shrink-0">
                        {user && (
                          <CreateCart 
                            product={product} 
                            variant={variant}
                            onOpen={() => setShowVariants(false)}
                          />
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
