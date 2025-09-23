import React, { useState, useEffect } from "react";

import { useProductsContext } from "../../hooks/useProductContext";
import { useAuthContext } from "../../hooks/useAuthContext";

import { useFetch } from "../../hooks/useFetch";

import CreateCart from "./CreateCart";
import Pagination from "../../components/Pagination";
import Loading from "../../components/Loading";
import SearchBar from "../../components/SearchBar";
import ProductListVariant from "./ProductListVariant";
import ProductGrid from "../../components/ProductGrid";

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
      <ProductGrid products={products} user={user} isMobile={isMobile} />

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
