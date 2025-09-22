import React, { useState, useEffect } from "react";

import { useProductsContext } from "../../hooks/useProductContext";
import { useAuthContext } from "../../hooks/useAuthContext";

import { useFetch } from "../../hooks/useFetch";
import { backendUrl } from "../../config/url";

import CreateCart from "./CreateCart";
import Pagination from "../../components/Pagination";
import Loading from "../../components/Loading";
import SearchBar from "../../components/SearchBar";
import ProductListVariant from "./ProductListVariant";

function ProductList() {
  const { products, pages, dispatch } = useProductsContext();
  const { user } = useAuthContext();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const limit = 12;

  useEffect(() => {
    if (search !== debouncedSearch) {
      setIsSearching(true);
    }

    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(handler);
  }, [search, debouncedSearch]);

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
      headers: { Authorization: `Bearer ${user?.token}` },
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
  };

  if (loading && !products?.length && !search) {
    return <Loading message="Loading products..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
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
          <span className="text-base">Error loading products: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Enhanced Search Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="p-6">
            <SearchBar
              search={search}
              onSearchChange={handleSearchChange}
              onClear={clearSearch}
              isSearching={isSearching}
              placeholder="Search for products..."
            />
          </div>

          {/* Search Results Info */}
          <div className="text-base text-base-content/70">
            {products?.length > 0 && (
              <span className="badge badge-outline badge-lg">
                {products.length} product{products.length !== 1 ? "s" : ""}{" "}
                found
              </span>
            )}
          </div>
        </div>

        {/* Active Search Indicator */}
        {search && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-base">Searching for:</span>
            <div className="badge badge-primary badge-lg gap-2">
              "{search}"
              <button onClick={clearSearch} className="btn btn-ghost btn-xs">
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading State for Products */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-3">
            <span className="loading loading-dots loading-md text-primary"></span>
            <span className="text-base text-base-content/70">
              Updating results...
            </span>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
        {products?.map((product) => (
          <div
            key={product._id}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300 hover:border-primary/30 group relative h-[500px] overflow-hidden" // Fixed height here
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
                    className="w-full h-48 object-cover rounded-t-2xl" // Fixed image height
                  />
                </figure>
              )}

              {/* Product Name */}
              <h2 className="card-title text-xl font-bold mb-3 text-base-content flex-shrink-0">
                {product.name}
              </h2>

              {/* Product Description - This will be hidden on hover for desktop */}
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

      {/* Pagination */}
      <Pagination page={page} pages={pages} onPageChange={setPage} />

      {/* No Products Found */}
      {products?.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto h-16 w-16 text-base-content/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-base-content/80 mb-3">
              No products found
            </h3>
            <p className="text-base text-base-content/60 mb-6 leading-relaxed">
              We couldn't find any products matching your search criteria. Try
              using different keywords or browse all products.
            </p>
            {search && (
              <button
                onClick={clearSearch}
                className="btn btn-primary btn-wide"
              >
                Clear Search & Show All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;
