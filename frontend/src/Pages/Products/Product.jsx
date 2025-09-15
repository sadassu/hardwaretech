import React, { useState, useEffect } from "react";
import CreateProduct from "./CreateProduct";
import DeleteProduct from "./DeleteProduct";
import UpdateProduct from "./UpdateProduct";
import CreateVariant from "../Variants/CreateVariant";
import { formatDatePHT } from "../../utils/formatDate";
import { useFetch } from "../../hooks/useFetch";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useProductsContext } from "../../hooks/useProductContext";
import { backendUrl } from "../../config/url";
import DeleteVariant from "../Variants/DeleteVariant";
import UpdateVariant from "../Variants/UpdateVariant";
import Pagination from "../../components/Pagination";

const Product = () => {
  const { products, pages, dispatch } = useProductsContext();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const limit = 10;
  const { user } = useAuthContext();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch products whenever page or debouncedSearch changes
  const { data, loading, error } = useFetch(
    "/products",
    {
      params: {
        page,
        limit,
        sortBy: "name",
        sortOrder: "asc",
        search: debouncedSearch,
      },
      headers: { Authorization: `Bearer ${user.token}` },
    },
    [page, debouncedSearch]
  );

  useEffect(() => {
    if (data) {
      dispatch({
        type: "SET_PRODUCTS",
        payload: {
          products: data.products,
          total: data.total,
          page: data.page,
          pages: data.pages,
        },
      });
    }
  }, [data, dispatch]);

  const handleDeleteSuccess = (deletedProductId) => {
    dispatch({ type: "DELETE_PRODUCT", payload: deletedProductId });
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 lg:p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 mb-8 text-primary-content shadow-xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                Product Management
              </h1>
              <p className="opacity-90">Manage your inventory with ease</p>
            </div>

            {/* Search Bar */}
            <div className="form-control w-full max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input input-bordered input-lg w-full text-base-content bg-base-100 pr-12"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Create Product Section */}
        <div className="mb-8">
          <CreateProduct
            onProductCreated={(newProduct) =>
              dispatch({ type: "CREATE_PRODUCT", payload: newProduct })
            }
          />
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-4">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-base-content/70">Loading products...</p>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-error shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        ) : (
          <div className="space-y-4">
            {products?.length > 0 ? (
              products?.map((product, idx) => (
                <div
                  key={product._id || `product-${idx}`}
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300"
                >
                  <div className="card-body p-6">
                    {/* Product Header */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                      {/* Product Image */}
                      <div className="avatar">
                        <div className="w-16 h-16 rounded-xl ring ring-primary ring-offset-base-100 ring-offset-2">
                          <img
                            src={
                              product.image
                                ? `${backendUrl}${product.image}`
                                : "https://img.daisyui.com/images/profile/demo/1@94.webp"
                            }
                            alt={product.name}
                            className="object-cover"
                          />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mb-2">
                          <h2 className="card-title text-xl lg:text-2xl text-base-content">
                            {product.name}
                          </h2>
                          <div className="badge badge-secondary badge-lg font-semibold">
                            {product.category?.name || "Uncategorized"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-base-content/70">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Created {formatDatePHT(product.createdAt)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                        <UpdateProduct
                          product={product}
                          onUpdateSuccess={(updated) =>
                            dispatch({
                              type: "UPDATE_PRODUCT",
                              payload: updated,
                            })
                          }
                        />
                        <DeleteProduct
                          product={product}
                          onDeleteSuccess={handleDeleteSuccess}
                        />
                      </div>
                      <CreateVariant
                        product={product}
                        onUpdateSuccess={(updated) =>
                          dispatch({
                            type: "UPDATE_PRODUCT",
                            payload: updated,
                          })
                        }
                      />
                    </div>

                    {/* Variants Section */}
                    <div className="divider my-4"></div>

                    {product.variants?.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">Variants</h3>
                          <div className="badge badge-primary badge-sm">
                            {product.variants.length}
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {product.variants?.map((variant, idx) => (
                            <div
                              key={
                                variant._id || `${product._id}-variant-${idx}`
                              }
                              className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow duration-200 border border-base-300"
                            >
                              <div className="card-body p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <p className="font-medium text-base-content">
                                      {variant.size ? `${variant.size} ` : ""}
                                      {variant.unit}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="badge badge-outline badge-sm">
                                        Qty: {variant.quantity}
                                      </div>
                                      <div className="badge badge-success badge-sm text-success-content font-semibold">
                                        ₱{variant.price}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="card-actions justify-end mt-3">
                                  <UpdateVariant
                                    variant={variant}
                                    onUpdateSuccess={(updated) =>
                                      dispatch({
                                        type: "UPDATE_PRODUCT",
                                        payload: updated,
                                      })
                                    }
                                  />
                                  <DeleteVariant
                                    variant={variant}
                                    onDeleteSuccess={handleDeleteSuccess}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-base-content/50 mb-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mx-auto mb-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1"
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                        </div>
                        <p className="text-base-content/70 italic">
                          No variants available
                        </p>
                        <p className="text-sm text-base-content/50 mt-1">
                          Add variants to manage different sizes and quantities
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center py-16">
                  <div className="text-base-content/50 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    No products found
                  </h3>
                  <p className="text-base-content/70">
                    {search
                      ? `No products match "${search}"`
                      : "Start by creating your first product"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default Product;
