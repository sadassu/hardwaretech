import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useProductsContext } from "../../hooks/useProductContext";
import { useFetch } from "../../hooks/useFetch";

import Loading from "../../components/Loading";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import ProductGrid from "../../components/ProductGrid";

function Pos() {
  const { user } = useAuthContext();
  const { products, pages, dispatch } = useProductsContext();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const limit = 9;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // debounce search
  useEffect(() => {
    if (search !== debouncedSearch) setIsSearching(true);

    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(handler);
  }, [search, debouncedSearch]);

  // fetch products
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

  // update context when new data arrives
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

  const handleSearchChange = (e) => setSearch(e.target.value);
  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
  };

  if (loading && !products?.length) {
    return <Loading message="Loading products..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="alert alert-error shadow-lg max-w-md">
          <div>
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
            <div>
              <h3 className="font-bold">Error!</h3>
              <div className="text-xs">{error.message || String(error)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-base-200 border-b border-base-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-base-content">
                Point of Sale
              </h1>
              <p className="text-base-content/70">
                Select products to add to cart
              </p>
            </div>
            <div className="stats shadow bg-base-100">
              <div className="stat place-items-center">
                <div className="stat-title">Total Products</div>
                <div className="stat-value text-primary">
                  {products?.length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Search Section */}
        <div className="mb-6">
          <SearchBar
            search={search}
            onSearchChange={handleSearchChange}
            onClear={clearSearch}
            isSearching={isSearching}
            placeholder="Search products for POS..."
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        {/* Empty State */}
        {products?.length === 0 && !loading && (
          <div className="hero min-h-[400px]">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <div className="text-6xl mb-4">📦</div>
                <h1 className="text-2xl font-bold text-base-content/70">
                  No Products Found
                </h1>
                <p className="py-4 text-base-content/50">
                  {search
                    ? "Try adjusting your search terms"
                    : "No products available at the moment"}
                </p>
                {search && (
                  <button className="btn btn-primary" onClick={clearSearch}>
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <ProductGrid products={products} user={user} isMobile={isMobile} />

        {/* Pagination */}
        {pages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination page={page} pages={pages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Pos;
