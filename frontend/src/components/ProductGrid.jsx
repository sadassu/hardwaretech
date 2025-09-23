import { backendUrl } from "../config/url";
import ProductListVariant from "../Pages/UserPages/ProductListVariant";

function ProductGrid({ products, user, isMobile }) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
      {products.map((product) => (
        <div
          key={product._id}
          className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300 hover:border-primary/30 group relative h-[500px] overflow-hidden"
        >
          <div className="card-body p-6 flex flex-col h-full">
            {/* Product Image */}
            {product.image && (
              <figure className="mb-4 -mx-6 -mt-6 flex-shrink-0">
                <img
                  src={
                    product.image
                      ? `${backendUrl}${product.image}`
                      : "https://img.daisyui.com/images/profile/demo/1@94.webp"
                  }
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-2xl"
                />
              </figure>
            )}

            {/* Product Name */}
            <h2 className="card-title text-xl font-bold mb-3 text-base-content flex-shrink-0">
              {product.name}
            </h2>

            {/* Product Description */}
            <div className="flex-1 overflow-hidden">
              {product.description && (
                <p className="text-base text-base-content/80 mb-4 line-clamp-3 leading-relaxed group-hover:opacity-0 md:group-hover:opacity-0 transition-opacity duration-300">
                  {product.description}
                </p>
              )}
            </div>

            {/* Product Price */}
            {product.price && (
              <div className="mb-4 flex-shrink-0">
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
      ))}
    </div>
  );
}

export default ProductGrid;
