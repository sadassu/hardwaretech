import { useState } from "react";
import { ImageOff } from "lucide-react";
import ProductListVariant from "./ProductListVariant";

function ProductGrid({ products, user, isMobile }) {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
      {products.map((product) => {
        const variantCount = product.variants ? product.variants.length : 0;
        const hasImageError = imageErrors[product._id];

        return (
          <div key={product._id} className="indicator w-full h-full">
            {/* Variant Count Indicator */}
            <span
              className={`indicator-item badge ${
                variantCount === 0 ? "badge-error" : "badge-primary"
              }`}
            >
              {variantCount}
            </span>
            {/* Product Card */}
            <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300 hover:border-primary/30 group relative lg:h-[400px] overflow-hidden w-full">
              <div className="card-body p-6 flex flex-col h-full">
                {/* Product Image or Fallback */}
                {product.image &&
                product.image.trim() !== "" &&
                !hasImageError ? (
                  <figure className="mb-4 -mx-6 -mt-6 flex-shrink-0 group-hover:opacity-0 transition-opacity duration-300">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-2xl"
                      onError={() => handleImageError(product._id)}
                    />
                  </figure>
                ) : (
                  <div className="mb-4 -mx-6 -mt-6 flex-shrink-0 group-hover:opacity-0 transition-opacity duration-300 bg-base-200 rounded-t-2xl h-48 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-base-content/40">
                      <ImageOff size={48} strokeWidth={1.5} />
                      <span className="text-sm">Image unavailable</span>
                    </div>
                  </div>
                )}

                {/* Product Name */}
                <h2 className="martian-mono card-title text-xl font-extrabold mb-3 text-base-content flex-shrink-0 justify-center uppercase group-hover:opacity-0 transition-opacity duration-300">
                  {product.name}
                </h2>
                {/* Product Description */}
                <div className="flex-1 overflow-hidden group-hover:opacity-0 transition-opacity duration-300">
                  {product.description && (
                    <p className="text-base text-base-content/80 mb-4 line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>
                {/* Product Price */}
                {product.price && (
                  <div className="mb-4 flex-shrink-0 group-hover:opacity-0 transition-opacity duration-300">
                    <span className="text-2xl font-bold text-primary">
                      ₱{product.price}
                    </span>
                  </div>
                )}
                {/* Variants Component */}
                <ProductListVariant
                  product={product}
                  user={user}
                  isMobile={isMobile}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProductGrid;
