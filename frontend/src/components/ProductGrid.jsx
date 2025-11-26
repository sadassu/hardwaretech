import { useState } from "react";
import { ImageOff, Package, Tag } from "lucide-react";
import ProductListVariant from "./ProductListVariant";

function ProductGrid({ products, user, isMobile, showAutoConvertInfo = false }) {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  if (!products || products.length === 0) {
    return null;
  }

  // Calculate how many empty slots needed to complete the last row (4 columns on large screens)
  const itemsPerRow = 4; // For lg screens
  const remainder = products.length % itemsPerRow;
  const emptySlots = remainder > 0 ? itemsPerRow - remainder : 0;

  return (
    <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => {
        const variantCount = product.variants ? product.variants.length : 0;
        const hasImageError = imageErrors[product._id];

        return (
          <div key={product._id} className="group relative">
            {/* Product Card */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-300 overflow-hidden h-full flex flex-col transform hover:-translate-y-1">
              {/* Product Image or Fallback */}
              <div className="relative flex-shrink-0">
                {product.image && product.image.trim() !== "" && !hasImageError ? (
                  <div className="relative overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 sm:h-48 lg:h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={() => handleImageError(product._id)}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-40 sm:h-48 lg:h-52 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <ImageOff className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={1.5} />
                      <span className="text-xs sm:text-sm font-medium">No Image</span>
                    </div>
                  </div>
                )}
                
                {/* Variant Count Badge */}
                <div className="absolute top-3 right-3">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
                    variantCount === 0 
                      ? "bg-red-500/90 text-white" 
                      : "bg-blue-500/90 text-white"
                  }`}>
                    <Package className="w-3.5 h-3.5" />
                    <span>{variantCount}</span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-3 sm:p-4 flex flex-col flex-1">
                {/* Product Name */}
                <h2 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 mb-2 line-clamp-2 leading-tight min-h-[2.5rem] sm:min-h-[3rem]">
                  {product.name}
                </h2>

                {/* Category Badge */}
                {product.category && (
                  <p className="mb-3 text-xs sm:text-sm text-gray-500 flex items-center gap-1 truncate">
                    <Tag className="w-3 h-3 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{product.category.name}</span>
                  </p>
                )}

                {/* Product Description */}
                {product.description && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed flex-1">
                    {product.description}
                  </p>
                )}

                {/* Price Section */}
                {product.price && (
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs sm:text-sm text-gray-500">Starting at</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
                        ₱{product.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Variants Button */}
                <div className="mt-auto">
                  <ProductListVariant
                    product={product}
                    user={user}
                    isMobile={isMobile}
                    showAutoConvertInfo={showAutoConvertInfo}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {/* Empty placeholder divs to fill the last row */}
      {Array.from({ length: emptySlots }).map((_, index) => (
        <div key={`empty-${index}`} className="hidden lg:block" aria-hidden="true" />
      ))}
    </div>
  );
}

export default ProductGrid;
