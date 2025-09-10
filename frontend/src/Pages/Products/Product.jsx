import React, { useState } from "react";

import CreateProduct from "./CreateProduct";
import DeleteProduct from "./DeleteProduct";
import UpdateProduct from "./UpdateProduct";
import CreateVariant from "../Variants/CreateVariant";
import { formatDatePHT } from "../../utils/formatDate";
import { useFetch } from "../../hooks/useFetch";
import { backendUrl } from "../config/url";
import { useAuthContext } from "../../hooks/useAuthContext";

const Product = () => {
  const [page, setPage] = useState(1);
  const limit = 5;
  const { user } = useAuthContext();

  // Use custom hook
  const { data, loading, error } = useFetch(
    "/products",
    {
      params: { page, limit, sortBy: "name", sortOrder: "asc" },
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    },
    [page]
  );

  const products = data?.products || [];
  const pages = data?.pages || 1;

  console.log(products);
  // handle delete
  const handleDeleteSuccess = (deletedProductId) => {
    if (!data) return;
    data.products = data.products.filter(
      (product) => product._id !== deletedProductId
    );
  };

  return (
    <div className="p-6">
      <div className="mt-6">
        <CreateProduct onProductCreated={() => setPage(1)} />
      </div>

      <h1 className="text-2xl font-bold mb-4">Products</h1>

      {loading ? (
        <span className="loading loading-bars loading-xl"></span>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : (
        <ul className="list bg-base-100 rounded-box shadow-md divide-y">
          <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
            Product list
          </li>

          {products.length > 0 ? (
            products.map((product) => (
              <li
                key={product._id}
                className="list-row flex flex-col gap-2 p-3 border-b"
              >
                {/* Product Info Row */}
                <div className="flex items-center gap-3">
                  <div>
                    <img
                      className="size-10 rounded-box object-cover"
                      src={
                        product.image
                          ? `${backendUrl}${product.image}`
                          : "https://img.daisyui.com/images/profile/demo/1@94.webp"
                      }
                      alt={product.name}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-xs uppercase font-semibold opacity-60">
                      {product.category?.name || "Uncategorized"}
                    </div>
                    <div className="text-xs opacity-50">
                      {formatDatePHT(product.createdAt)}
                    </div>
                  </div>

                  <DeleteProduct
                    product={product}
                    onDeleteSuccess={handleDeleteSuccess}
                  />
                  <UpdateProduct
                    product={product}
                    onUpdateSuccess={() => setPage(page)}
                  />
                  <CreateVariant
                    product={product}
                    onUpdateSuccess={() => setPage(page)}
                  />
                </div>

                {/* Variants Section */}
                {product.variants?.length > 0 ? (
                  <div className="ml-12 mt-2">
                    <div className="text-xs font-semibold opacity-70 mb-1">
                      Variants:
                    </div>
                    <ul className="text-sm space-y-1">
                      {product.variants.map((variant) => (
                        <li
                          key={variant._id}
                          className="flex justify-between items-center border rounded-md px-2 py-1 bg-base-200"
                        >
                          <span>
                            {variant.size ? `${variant.size} ` : ""}
                            {variant.unit} – Qty: {variant.quantity}
                          </span>
                          <span className="font-semibold">
                            ₱{variant.price}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="ml-12 text-xs opacity-50 italic">
                    No variants
                  </div>
                )}
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-sm opacity-60">
              No products found
            </li>
          )}
        </ul>
      )}

      {/* Pagination Controls */}
      {pages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            className="btn btn-sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>

          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i + 1}
              className={`btn btn-sm ${page === i + 1 ? "btn-primary" : ""}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="btn btn-sm"
            disabled={page === pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Product;
